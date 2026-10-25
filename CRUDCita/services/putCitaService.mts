import { COLUMNAS_CITA } from "../config/const.mts";
import { citaRepository } from "../repositories/CitaRepository.mts";
import type { Cita, CitaUpdate } from "../utils/types.mts";
import { ErrorNoEncontrado, ErrorValidacion } from "../utils/errores.mts";

/**
 * Reglas de tipo por campo actualizable de la cita.
 * Cada regla es [campo, predicado de validez, mensaje de error].
 */
const REGLAS: [keyof CitaUpdate, (valor: unknown) => boolean, string][] = [
    [
        "fecha_hora_cita",
        (valor) => typeof valor === "string" && !Number.isNaN(Date.parse(valor)),
        "El campo 'fecha_hora_cita' debe ser una fecha valida (ISO 8601)"
    ],
    ["motivo_cita", (valor) => typeof valor === "string", "El campo 'motivo_cita' debe ser un texto"],
    ["fk_owner", (valor) => typeof valor === "number" && Number.isInteger(valor), "El campo 'fk_owner' debe ser un numero entero"],
    ["fk_vet", (valor) => typeof valor === "number" && Number.isInteger(valor), "El campo 'fk_vet' debe ser un numero entero"]
];

/**
 * Validacion de la carga util de una actualizacion (campos opcionales).
 * Lanza ErrorValidacion cuando la data no cumple las reglas del negocio.
 */
const validarActualizacion = (cambios: CitaUpdate): void => {
    if (!cambios || typeof cambios !== "object" || Array.isArray(cambios)) {
        throw new ErrorValidacion(
            "El cuerpo de la peticion debe ser un objeto JSON con los campos a actualizar"
        );
    }

    const camposRecibidos = COLUMNAS_CITA.filter(
        (columna) => cambios[columna as keyof CitaUpdate] !== undefined
    );

    if (camposRecibidos.length === 0) {
        throw new ErrorValidacion(
            `Se debe enviar al menos un campo a actualizar (${COLUMNAS_CITA.join(", ")})`
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
 * Servicio de la operacion PUT: actualiza los campos indicados de una cita.
 * Recibe primitivas (id y cambios) y devuelve la cita actualizada.
 */
export const actualizarCita = async (
    id: number,
    cambios: CitaUpdate
): Promise<Cita> => {
    if (!id || id <= 0) {
        throw new ErrorValidacion("El id de la cita debe ser un numero valido");
    }

    validarActualizacion(cambios);

    const citaActualizada = await citaRepository.updateById(id, cambios);

    if (!citaActualizada) {
        throw new ErrorNoEncontrado(`No existe una cita con id ${id}`);
    }

    return citaActualizada;
};
