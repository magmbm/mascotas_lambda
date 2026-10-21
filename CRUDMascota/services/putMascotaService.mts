import { COLUMNAS_MASCOTA } from "../config/const.mts";
import { mascotaRepository } from "../repositories/MascotaRepository.mts";
import type { Mascota, MascotaUpdate } from "../types.mts";
import { ErrorNoEncontrado, ErrorValidacion } from "../utils/errores.mts";

/**
 * Reglas de tipo por campo actualizable de la mascota.
 * Cada regla es [campo, predicado de validez, mensaje de error].
 */
const REGLAS: [keyof MascotaUpdate, (valor: unknown) => boolean, string][] = [
    ["nombre_mascota", (valor) => typeof valor === "string", "El campo 'nombre_mascota' debe ser un texto"],
    ["especie", (valor) => typeof valor === "string", "El campo 'especie' debe ser un texto"],
    ["sexo", (valor) => typeof valor === "string", "El campo 'sexo' debe ser un texto"],
    ["peso_mascota", (valor) => typeof valor === "number" && !Number.isNaN(valor), "El campo 'peso_mascota' debe ser un numero"],
    ["edad_mascota", (valor) => typeof valor === "number" && !Number.isNaN(valor), "El campo 'edad_mascota' debe ser un numero"],
    ["vacunado", (valor) => typeof valor === "boolean", "El campo 'vacunado' debe ser un booleano"]
];

/**
 * Validacion de la carga util de una actualizacion (campos opcionales).
 * Lanza ErrorValidacion cuando la data no cumple las reglas del negocio.
 */
const validarActualizacion = (cambios: MascotaUpdate): void => {
    if (!cambios || typeof cambios !== "object" || Array.isArray(cambios)) {
        throw new ErrorValidacion(
            "El cuerpo de la peticion debe ser un objeto JSON con los campos a actualizar"
        );
    }

    const camposRecibidos = COLUMNAS_MASCOTA.filter(
        (columna) => cambios[columna as keyof MascotaUpdate] !== undefined
    );

    if (camposRecibidos.length === 0) {
        throw new ErrorValidacion(
            `Se debe enviar al menos un campo a actualizar (${COLUMNAS_MASCOTA.join(", ")})`
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
export const actualizarMascota = async (
    id: number,
    cambios: MascotaUpdate
): Promise<Mascota> => {
    if (!id || id <= 0) {
        throw new ErrorValidacion("El id de la mascota debe ser un numero valido");
    }

    validarActualizacion(cambios);

    const mascotaActualizada = await mascotaRepository.updateById(id, cambios);

    if (!mascotaActualizada) {
        throw new ErrorNoEncontrado(`No existe una mascota con id ${id}`);
    }

    return mascotaActualizada;
};
