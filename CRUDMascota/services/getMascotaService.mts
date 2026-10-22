import { mascotaRepository } from "../repositories/MascotaRepository.mts";
import type { Mascota } from "../utils/types.mts";
import { ErrorNoEncontrado, ErrorValidacion } from "../utils/errores.mts";

/**
 * Servicio de la operacion GET: devuelve una mascota por su id.
 * Recibe una primitiva (id) y devuelve la mascota encontrada.
 */
export const obtenerMascotaPorId = async (id: number): Promise<Mascota> => {
    if (!id || id <= 0) {
        throw new ErrorValidacion("El id de la mascota debe ser un numero valido");
    }

    const mascota = await mascotaRepository.findById(id);

    if (!mascota) {
        throw new ErrorNoEncontrado(`No existe una mascota con id ${id}`);
    }

    return mascota;
};

/**
 * Servicio de la operacion GET: devuelve el listado completo de mascotas.
 */
export const obtenerTodasLasMascotas = async (): Promise<Mascota[]> => {
    return mascotaRepository.findAll();
};
