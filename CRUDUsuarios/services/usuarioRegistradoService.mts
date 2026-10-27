import { usuarioRepository } from "../repositories/UsuarioRepository.mjs";
import type { Usuario } from "../utils/types.mts";
import { ErrorValidacion } from "../utils/errores.mts";

/**
 * Servicio de la operacion GET: dado un email, devuelve el usuario
 * registrado completo o null si no existe.
 */
export const usuarioRegistrado = async (email: string): Promise<Usuario | null> => {
    if (typeof email !== "string" || email.trim() === "") {
        throw new ErrorValidacion("El email del usuario debe ser valido");
    }

    return usuarioRepository.usuarioRegistrado(email.trim());
};
