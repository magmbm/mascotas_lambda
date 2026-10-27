import { COLUMNAS_CITA } from "../config/const.mts";
import { citaRepository } from "../repositories/CitaRepository.mts";
import type { Cita, CitaInsert } from "../utils/types.mts";
import { ErrorValidacion } from "../utils/errores.mts";

/**
 * Reglas de tipo por campo de la cita.
 * Cada regla es [campo, predicado de validez, mensaje de error].
 */
const REGLAS: [keyof CitaInsert, (valor: unknown) => boolean, string][] = [
    [
        "fecha_hora_cita",
        (valor) => typeof valor === "string" && !Number.isNaN(Date.parse(valor)),
        "El campo 'fecha_hora_cita' debe ser una fecha valida (ISO 8601)"
    ],
    ["motivo_cita", (valor) => typeof valor === "string", "El campo 'motivo_cita' debe ser un texto"],
    ["nombre_mascota", (valor) => typeof valor === "string", "El campo 'nombre_mascota' debe ser un texto"],
    ["especie_mascota", (valor) => typeof valor === "string", "El campo 'especie_mascota' debe ser un texto"],
    ["fk_owner", (valor) => typeof valor === "number" && Number.isInteger(valor), "El campo 'fk_owner' debe ser un numero entero"],
    ["fk_vet", (valor) => typeof valor === "number" && Number.isInteger(valor), "El campo 'fk_vet' debe ser un numero entero"]
];

/**
 * Validacion de la carga util de una cita.
 * Lanza ErrorValidacion cuando la data no cumple las reglas del negocio.
 */
const validarCita = (cita: CitaInsert): void => {
    if (!cita || typeof cita !== "object" || Array.isArray(cita)) {
        throw new ErrorValidacion(
            "El cuerpo de la peticion debe ser un objeto JSON con los datos de la cita"
        );
    }

    const campoAusente = COLUMNAS_CITA.find((campo) => {
        const valor = (cita as Record<string, unknown>)[campo];

        return valor === undefined || valor === null || valor === "";
    });

    if (campoAusente) {
        throw new ErrorValidacion(`El campo '${campoAusente}' es obligatorio`);
    }

    const reglaIncumplida = REGLAS.find(
        ([campo, esValido]) => !esValido((cita as Record<string, unknown>)[campo])
    );

    if (reglaIncumplida) {
        throw new ErrorValidacion(reglaIncumplida[2]);
    }
};

/**
 * Servicio de la operacion POST: valida la data y la persiste.
 * Recibe el cuerpo de la peticion y devuelve la cita creada.
 */
export const registrarCita = async (cita: CitaInsert): Promise<Cita> => {
    validarCita(cita);

    return citaRepository.save(cita);
};
