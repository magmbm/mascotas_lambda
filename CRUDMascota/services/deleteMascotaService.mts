import { mascotaRepository } from "../repositories/MascotaRepository.mts";
import type { Mascota } from "../types.mts";
import { ErrorNoEncontrado, ErrorValidacion } from "../utils/errores.mts";

/**
 * Servicio de la operacion DELETE: elimina una mascota por su id.
 * Recibe una primitiva (id) y devuelve la mascota eliminada.
 */
export const eliminarMascota = async (id: number): Promise<Mascota> => {
    if (!id || id <= 0) {
        throw new ErrorValidacion("El id de la mascota debe ser un numero valido");
    }

    const mascotaEliminada = await mascotaRepository.deleteById(id);

    if (!mascotaEliminada) {
        throw new ErrorNoEncontrado(`No existe una mascota con id ${id}`);
    }

    return mascotaEliminada;
};
