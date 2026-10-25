import { COLUMNAS_USUARIO } from "../config/const.mts";
import { usuarioRepository } from "../repositories/UsuarioRepository.mjs";
import type { Usuario, UsuarioInsert } from "../utils/types.mts";
import { ErrorValidacion } from "../utils/errores.mts";

/**
 * Reglas de tipo por campo de la usuario.
 * Cada regla es [campo, predicado de validez, mensaje de error].
 */

const REGLAS: [keyof UsuarioInsert, (valor: unknown) => boolean, string][] = [
    ["nombre_usuario", (valor) => typeof valor === "string", "El campo 'nombre_usuario' debe ser un texto"],
    ["papellido_usuario", (valor) => typeof valor === "string", "El campo 'papellido_usuario' debe ser un texto"],
    ["sapellido_usuario", (valor) => typeof valor === "string", "El campo 'sapellido_usuario' debe ser un texto"],
    ["email_usuario", (valor) => typeof valor === "string" , "El campo 'email_usuario' debe ser un texo"],
    ["numrun_usuario", (valor) => typeof valor === "number" && !Number.isNaN(valor), "El campo 'numrun_usuario' debe ser un numero"],
    ["dvrun_usuario", (valor) => typeof valor === "string", "El campo 'dvrun_usuario' debe ser un caracter"]
];

/**
 * Validacion de la carga util de una usuario.
 * Lanza ErrorValidacion cuando la data no cumple las reglas del negocio.
 */
const validarUsuario = (usuario: UsuarioInsert): void => {
    if (!usuario || typeof usuario !== "object" || Array.isArray(usuario)) {
        throw new ErrorValidacion(
            "El cuerpo de la peticion debe ser un objeto JSON con los datos de la usuario"
        );
    }

    const campoAusente = COLUMNAS_USUARIO.find((campo) => {
        const valor = (usuario as Record<string, unknown>)[campo];

        return valor === undefined || valor === null || valor === "";
    });

    if (campoAusente) {
        throw new ErrorValidacion(`El campo '${campoAusente}' es obligatorio`);
    }

    const reglaIncumplida = REGLAS.find(
        ([campo, esValido]) => !esValido((usuario as Record<string, unknown>)[campo])
    );

    if (reglaIncumplida) {
        throw new ErrorValidacion(reglaIncumplida[2]);
    }
};

/**
 * Servicio de la operacion POST: valida la data y la persiste.
 * Recibe el cuerpo de la peticion y devuelve la usuario creada.
 */
export const registrarUsuario = async (usuario: UsuarioInsert): Promise<Usuario> => {
    validarUsuario(usuario);

    return usuarioRepository.save(usuario);
};
