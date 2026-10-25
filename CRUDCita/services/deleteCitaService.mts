import { citaRepository } from "../repositories/CitaRepository.mts";
import type { Cita } from "../utils/types.mts";
import { ErrorNoEncontrado, ErrorValidacion } from "../utils/errores.mts";

/**
 * Servicio de la operacion DELETE: elimina una cita por su id.
 * Recibe una primitiva (id) y devuelve la cita eliminada.
 */
export const eliminarCita = async (id: number): Promise<Cita> => {
    if (!id || id <= 0) {
        throw new ErrorValidacion("El id de la cita debe ser un numero valido");
    }

    const citaEliminada = await citaRepository.deleteById(id);

    if (!citaEliminada) {
        throw new ErrorNoEncontrado(`No existe una cita con id ${id}`);
    }

    return citaEliminada;
};
