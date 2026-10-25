import { usuarioRepository } from "../repositories/UsuarioRepository.mjs";
import type { Usuario } from "../utils/types.mjs";
import { ErrorNoEncontrado, ErrorValidacion } from "../utils/errores.mts";

/**
 * Servicio de la operacion DELETE: elimina una mascota por su id.
 * Recibe una primitiva (id) y devuelve la mascota eliminada.
 */
export const eliminarUsuario = async (id: number): Promise<Usuario> => {
    if (!id || id <= 0) {
        throw new ErrorValidacion("El id de la mascota debe ser un numero valido");
    }

    const usuarioEliminado = await usuarioRepository.deleteById(id);

    if (!usuarioEliminado) {
        throw new ErrorNoEncontrado(`No existe una mascota con id ${id}`);
    }

    return usuarioEliminado;
};
