import { METODOS_PERMITIDOS } from "./config/const.mts";
import { registrarMascota } from "./services/postMascotaService.mts";
import { actualizarMascota } from "./services/putMascotaService.mts";
import { eliminarMascota } from "./services/deleteMascotaService.mts";
import type { MascotaInsert, MascotaUpdate } from "./types.mts";
import { ErrorValidacion } from "./utils/errores.mts";
import { obtenerIdMascota } from "./utils/parametros.mts";
import {
    responderError,
    respuestaCreada,
    respuestaNoValido,
    respuestaOk,
    respuestaProhibido
} from "./utils/respuestas.mts";
import type { RespuestaLambda } from "./utils/respuestas.mts";

/**
 * Handler (controller) de la lambda CRUD.
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

export const handler = async (event: any): Promise<RespuestaLambda> => {
    try {
        const metodo = String(event?.method || event?.httpMethod || "").toUpperCase();
        const headers = event?.headers || event?.header || {};

        if (!revisionDeMetodo(metodo)) {
            return respuestaProhibido("Metodo no permitido para esta funcion");
        }

        const body = obtenerBody(event);

        switch (metodo) {
            case "POST": {
                const mascota: MascotaInsert = body;
                const mascotaCreada = await registrarMascota(mascota);

                return respuestaCreada(mascotaCreada);
            }
            case "PUT": {
                const cambios: MascotaUpdate = body;
                const id = obtenerIdMascota(headers);

                if (id === undefined) {
                    return respuestaNoValido("Debe enviar un id de mascota valido para actualizar");
                }

                const mascotaActualizada = await actualizarMascota(id, cambios);

                return respuestaOk(mascotaActualizada);
            }
            case "DELETE": {
                const id = obtenerIdMascota(headers);

                if (id === undefined) {
                    return respuestaNoValido("Debe enviar un id de mascota valido para eliminar");
                }

                const mascotaEliminada = await eliminarMascota(id);

                return respuestaOk({
                    mensaje: "La mascota fue eliminada correctamente",
                    mascota: mascotaEliminada
                });
            }
            default:
                return respuestaProhibido("Metodo no permitido para esta funcion");
        }
    } catch (err) {
        return responderError(err);
    }
};
