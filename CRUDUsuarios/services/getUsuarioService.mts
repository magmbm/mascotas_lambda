import { usuarioRepository } from "../repositories/UsuarioRepository.mjs";
import type { Usuario } from "../utils/types.mts";
import { ErrorNoEncontrado, ErrorValidacion } from "../utils/errores.mts";

/**
 * Servicio de la operacion GET: devuelve una usuario por su id.
 * Recibe una primitiva (id) y devuelve la usuario encontrada.
 */
export const obtenerUsuarioPorId = async (id: number): Promise<Usuario> => {
    if (!id || id <= 0) {
        throw new ErrorValidacion("El id de la usuario debe ser un numero valido");
    }

    const usuario = await usuarioRepository.findById(id);

    if (!usuario) {
        throw new ErrorNoEncontrado(`No existe una usuario con id ${id}`);
    }

    return usuario;
};

/**
 * Servicio de la operacion GET: devuelve el listado completo de usuarios.
 */
export const obtenerTodosLosUsuarios = async (): Promise<Usuario[]> => {
    return usuarioRepository.findAll();
};
