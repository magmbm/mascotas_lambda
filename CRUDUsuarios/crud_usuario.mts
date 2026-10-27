import { METODOS_PERMITIDOS } from "./config/const.mts";
import { registrarUsuario } from "./services/postUsuarioService.mts";
import { actualizarUsuario } from "./services/putUsuarioService.mts";
import { eliminarUsuario } from "./services/deleteUsuarioService.mts";
import { usuarioRegistrado } from "./services/usuarioRegistradoService.mts";
import type { UsuarioInsert, UsuarioUpdate } from "./utils/types.mjs"
import { ErrorValidacion } from "./utils/errores.mts";
import { obtenerIdUsuario } from "./utils/parametros.mts";
import {
    responderError,
    respuestaCreada,
    respuestaNoValido,
    respuestaOk,
    respuestaProhibido
} from "./utils/respuestas.mts";
import type { RespuestaLambda } from "./utils/respuestas.mts";
import { obtenerUsuarioPorId, obtenerTodosLosUsuarios } from "./services/getUsuarioService.mts";

/**
 * Handler (controller) de la lambda CRUD.
 * Solo resuelve el metodo HTTP, convierte el body al objeto requerido,
 * delega la logica de negocios en los servicios y arma la respuesta HTTP.
 * v
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
                if (headers.id_usuario!= null) {
                    const usuarios= await obtenerUsuarioPorId(headers.id_usuario);
                    return usuarios
                }
                if (headers.email_usuario!= null) {
                    const registrado= await usuarioRegistrado(headers.email_usuario);
                    return registrado;
                }
                const usuarios= await obtenerTodosLosUsuarios();

                return usuarios;
            }

            case "POST": {
                const usuario: UsuarioInsert = body;
                const usuarioCreada = await registrarUsuario(usuario);

                return usuarioCreada;
            }
            case "PUT": {
                const cambios: UsuarioUpdate = body;
                const id = obtenerIdUsuario(headers);

                if (id === undefined) {
                    return null;
                }

                const usuarioActualizada = await actualizarUsuario(id, cambios);

                return usuarioActualizada;
            }
            case "DELETE": {
                const id = obtenerIdUsuario(headers);

                if (id === undefined) {
                    return null;
                }

                const usuarioEliminada = await eliminarUsuario(id);

                return usuarioEliminada
            }
            default:
                return respuestaProhibido("Metodo no permitido para esta funcion");
        }
    } catch (err) {
        return responderError(err);
    }
};
