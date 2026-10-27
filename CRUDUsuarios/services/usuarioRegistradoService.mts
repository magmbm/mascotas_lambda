import { usuarioRepository } from "../repositories/UsuarioRepository.mjs";
import type { Usuario } from "../utils/types.mts";
import { ErrorNoEncontrado, ErrorValidacion } from "../utils/errores.mts";

/**
 * Servicio de la operacion GET: devuelve una usuario por su id.
 * Recibe una primitiva (id) y devuelve la usuario encontrada.
 */
export const usuarioRegistrado = async (email : string): Promise<boolean> => {
    if (!email || email== "") {
        throw new ErrorValidacion("El email del usuario debe ser valido");
    }

    const registrado = await usuarioRepository.usuarioRegistrado(email);

    if (!registrado) {
        return false;
    }

    return true;
};

