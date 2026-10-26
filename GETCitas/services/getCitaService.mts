import { citaRepository } from "../repositories/CitaRepository.mts";
import type { Cita } from "../utils/types.mts";
import { ErrorNoEncontrado, ErrorValidacion } from "../utils/errores.mts";

/**
 * Servicio de la operacion GET: devuelve una cita por su id.
 * Recibe una primitiva (id) y devuelve la cita encontrada.
 */
export const obtenerCitaPorId = async (id: number): Promise<Cita> => {
    if (!id || id <= 0) {
        throw new ErrorValidacion("El id de la cita debe ser un numero valido");
    }

    const cita = await citaRepository.findById(id);

    if (!cita) {
        throw new ErrorNoEncontrado(`No existe una cita con id ${id}`);
    }

    return cita;
};

/**
 * Servicio de la operacion GET: devuelve el listado completo de citas.
 */
export const obtenerTodasLasCitas = async (): Promise<Cita[]> => {
    return citaRepository.findAll();
};
