import { COLUMNAS_USUARIO } from "../config/const.mts";
import { usuarioRepository } from "../repositories/UsuarioRepository.mjs";
import type { Usuario, UsuarioUpdate } from "../utils/types.mts";
import { ErrorNoEncontrado, ErrorValidacion } from "../utils/errores.mts";

/**
 * Reglas de tipo por campo actualizable de la mascota.
 * Cada regla es [campo, predicado de validez, mensaje de error].
 */
const REGLAS: [keyof UsuarioUpdate, (valor: unknown) => boolean, string][] = [
    ["nombre_usuario", (valor) => typeof valor === "string", "El campo 'nombre_usuario' debe ser un texto"],
    ["papellido_usuario", (valor) => typeof valor === "string", "El campo 'papellido_usuario' debe ser un texto"],
    ["sapellido_usuario", (valor) => typeof valor === "string", "El campo 'sapellido_usuario' debe ser un texto"],
    ["email_usuario", (valor) => typeof valor === "string" , "El campo 'email_usuario' debe ser un texo"],
    ["numrun_usuario", (valor) => typeof valor === "number" && !Number.isNaN(valor), "El campo 'numrun_usuario' debe ser un numero"],
    ["dvrun_usuario", (valor) => typeof valor === "string", "El campo 'dvrun_usuario' debe ser un caracter"]
];

/**
 * Validacion de la carga util de una actualizacion (campos opcionales).
 * Lanza ErrorValidacion cuando la data no cumple las reglas del negocio.
 */
const validarActualizacion = (cambios: UsuarioUpdate): void => {
    if (!cambios || typeof cambios !== "object" || Array.isArray(cambios)) {
        throw new ErrorValidacion(
            "El cuerpo de la peticion debe ser un objeto JSON con los campos a actualizar"
        );
    }

    const camposRecibidos = COLUMNAS_USUARIO.filter(
        (columna) => cambios[columna as keyof UsuarioUpdate] !== undefined
    );

    if (camposRecibidos.length === 0) {
        throw new ErrorValidacion(
            `Se debe enviar al menos un campo a actualizar (${COLUMNAS_USUARIO.join(", ")})`
        );
    }

    const reglaIncumplida = REGLAS.find(([campo, esValido]) => {
        const valor = (cambios as Record<string, unknown>)[campo];

        return valor !== undefined && !esValido(valor);
    });

    if (reglaIncumplida) {
        throw new ErrorValidacion(reglaIncumplida[2]);
    }
};

/**
 * Servicio de la operacion PUT: actualiza los campos indicados de una mascota.
 * Recibe primitivas (id y cambios) y devuelve la mascota actualizada.
 */
export const actualizarUsuario = async (
    id: number,
    cambios: UsuarioUpdate
): Promise<Usuario> => {
    if (!id || id <= 0) {
        throw new ErrorValidacion("El id del usuario debe ser un numero valido");
    }

    validarActualizacion(cambios);

    const usuarioActualizado = await usuarioRepository.updateById(id, cambios);

    if (!usuarioActualizado) {
        throw new ErrorNoEncontrado(`No existe un usuario con id ${id}`);
    }

    return usuarioActualizado;
};
