import { METODOS_PERMITIDOS } from "./config/const.mts";
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

/**
 * Handler (controller) de la lambda CRUD de citas.
 * Solo resuelve el metodo HTTP, convierte el body al objeto requerido,
 * delega la logica de negocios en los servicios y arma la respuesta HTTP.
 */

const revisionDeMetodo = (metodo: string): boolean => METODOS_PERMITIDOS.includes(metodo);

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
