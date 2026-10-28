import { METODOS_PERMITIDOS } from "./config/const.mts";
import { sendEmail } from './email/emailService.mts';
import { registrarCita } from "./services/postCitaService.mts";
import { actualizarCita } from "./services/putCitaService.mts";
import { eliminarCita } from "./services/deleteCitaService.mts";
import type { CitaInsert, CitaUpdate } from "./utils/types.mts";
import { ErrorValidacion } from "./utils/errores.mts";
import { obtenerIdCita } from "./utils/parametros.mts";
import {
    responderError,
    respuestaNoValido,
    respuestaProhibido
} from "./utils/respuestas.mts";
import { obtenerCitaPorId, obtenerTodasLasCitas } from "./services/getCitaService.mts";
import { extraerMensaje, obtenerIdMensaje, obtenerOperacion } from "./utils/mensajes.mts";

/**
 * Handler (controller) de la lambda CRUD de citas.
 * Solo resuelve el metodo HTTP, convierte el body al objeto requerido,
 * delega la logica de negocios en los servicios y arma la respuesta HTTP.
 */

const revisionDeMetodo = (metodo: string): boolean => METODOS_PERMITIDOS.includes(metodo);

/**
 * Ejecuta la operacion indicada por el mensaje.
 * Si el BFF no envia operacion se asume POST (alta de cita).
 */
const procesarMensaje = async (mensaje: any): Promise<unknown> => {
    const operacion = obtenerOperacion(mensaje);

    switch (operacion) {
        case "POST":
            const result= registrarCita(mensaje as CitaInsert);
            if (result!= null) {
                const fecha= new Date(mensaje.fecha_hora_cita).getDate();
                const hora= new Date(mensaje.fecha_hora_cita).getHours();
                const mes= new Date(mensaje.fecha_hora_cita).getMonth();
                const mascota= mensaje.nombre_mascota;
                await sendEmail({
                    to: 'mag.burdiles@duocuc.cl',
                    subject: `Cita agendada para ${mascota}`,
                    html: `<h1>Cita Veterinaria</h1><h3>` + 
                    `Este ${fecha} de ${mes} a las ${hora}hrs tendrá su cita para ${mensaje.motivo_cita}</h3>,`
                })
            }
            return result;

        case "PUT": {
            const id = obtenerIdMensaje(mensaje);

            if (id === undefined) {
                throw new ErrorValidacion("El mensaje debe incluir 'id_cita' para actualizar");
            }

            return actualizarCita(id, mensaje as CitaUpdate);
        }

        case "DELETE": {
            const id = obtenerIdMensaje(mensaje);

            if (id === undefined) {
                throw new ErrorValidacion("El mensaje debe incluir 'id_cita' para eliminar");
            }

            return eliminarCita(id);
        }

        default:
            throw new ErrorValidacion(`Operacion '${operacion}' no soportada por esta lambda`);
    }
};

/**
 * Procesa un lote de SQS. Los mensajes fallidos se devuelven en
 * batchItemFailures para que SQS los reintente (requiere
 * "Report batch item failures" habilitado en el event source mapping).
 */
const procesarEventosSQS = async (event: any): Promise<unknown> => {
    const fallos: { itemIdentifier: string }[] = [];
    const resultados: unknown[] = [];

    for (const record of event.Records) {
        try {
            const mensaje = extraerMensaje(record);
            console.log("Mensaje SQS recibido:", JSON.stringify(mensaje));

            resultados.push(await procesarMensaje(mensaje));
        } catch (err) {
            console.error(`Error procesando el mensaje SQS ${record?.messageId}:`, err);
            fallos.push({ itemIdentifier: record?.messageId });
        }
    }

    console.log(`SQS: ${resultados.length} procesado(s), ${fallos.length} fallido(s)`);

    return { batchItemFailures: fallos };
};

/**
 * Procesa una invocacion directa desde SNS. Si un mensaje falla se
 * lanza el error para que SNS reintente o lo derive a la DLQ.
 */
const procesarEventosSNS = async (event: any): Promise<unknown> => {
    const resultados: unknown[] = [];

    for (const record of event.Records) {
        const mensaje = extraerMensaje(record);
        console.log("Mensaje SNS recibido:", JSON.stringify(mensaje));

        resultados.push(await procesarMensaje(mensaje));
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            mensaje: "Mensajes de SNS procesados correctamente",
            procesados: resultados.length,
            resultados
        })
    };
};

const obtenerBody = (event: any): any => {
    const body = event?.body;

    if (typeof body !== "string") {
        return body ?? {};
    }

    if (body.trim() === "") {
        return {};
    }

    try {
        return JSON.parse(body);
    } catch {
        throw new ErrorValidacion("El cuerpo de la peticion no contiene un JSON valido");
    }
};

export const handler = async (event: any): Promise<unknown> => {
    try {
        const registros = Array.isArray(event?.Records) ? event.Records : [];
        const primerRegistro = registros[0];

        if (registros.length > 0 && (primerRegistro?.eventSource === "aws:sqs" || primerRegistro?.body !== undefined)) {
            console.log(`Procesando ${registros.length} mensaje(s) de SQS...`);
            return await procesarEventosSQS(event);
        }

        if (registros.length > 0 && (primerRegistro?.EventSource === "aws:sns" || primerRegistro?.Sns !== undefined)) {
            console.log(`Procesando ${registros.length} mensaje(s) de SNS...`);
            return await procesarEventosSNS(event);
        }

        const metodo = String(event?.method || event?.httpMethod || "").toUpperCase();
        const headers = event?.headers || event?.header || {};

        if (!revisionDeMetodo(metodo)) {
            return respuestaProhibido("Metodo no permitido para esta funcion");
        }

        const body = obtenerBody(event);

        switch (metodo) {
            case "GET": {
                const id = obtenerIdCita(headers);

                if (headers?.id_cita != null && id === undefined) {
                    return respuestaNoValido("El header 'id_cita' debe ser un numero valido");
                }

                if (id !== undefined) {
                    return await obtenerCitaPorId(id);
                }

                return await obtenerTodasLasCitas();
            }

            case "POST": {
                const cita: CitaInsert = body;
                const citaCreada = await registrarCita(cita);

                return citaCreada;
            }
            case "PUT": {
                const cambios: CitaUpdate = body;
                const id = obtenerIdCita(headers);

                if (id === undefined) {
                    return respuestaNoValido("El header 'id_cita' es obligatorio para actualizar");
                }

                const citaActualizada = await actualizarCita(id, cambios);

                return citaActualizada;
            }
            case "DELETE": {
                const id = obtenerIdCita(headers);

                if (id === undefined) {
                    return respuestaNoValido("El header 'id_cita' es obligatorio para eliminar");
                }

                const citaEliminada = await eliminarCita(id);

                return citaEliminada;
            }
            default:
                return respuestaProhibido("Metodo no permitido para esta funcion");
        }
    } catch (err) {
        return responderError(err);
    }
};
