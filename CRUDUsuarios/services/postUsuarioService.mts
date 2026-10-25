import { COLUMNAS_MASCOTA } from "../config/const.mts";
import { mascotaRepository } from "../repositories/MascotaRepository.mts";
import type { Mascota, MascotaInsert } from "../utils/types.mts";
import { ErrorValidacion } from "../utils/errores.mts";

/**
 * Reglas de tipo por campo de la mascota.
 * Cada regla es [campo, predicado de validez, mensaje de error].
 */
const REGLAS: [keyof MascotaInsert, (valor: unknown) => boolean, string][] = [
    ["nombre_mascota", (valor) => typeof valor === "string", "El campo 'nombre_mascota' debe ser un texto"],
    ["especie", (valor) => typeof valor === "string", "El campo 'especie' debe ser un texto"],
    ["sexo", (valor) => typeof valor === "string", "El campo 'sexo' debe ser un texto"],
    ["peso_mascota", (valor) => typeof valor === "number" && !Number.isNaN(valor), "El campo 'peso_mascota' debe ser un numero"],
    ["edad_mascota", (valor) => typeof valor === "number" && !Number.isNaN(valor), "El campo 'edad_mascota' debe ser un numero"],
    ["vacunado", (valor) => typeof valor === "boolean", "El campo 'vacunado' debe ser un booleano"]
];

/**
 * Validacion de la carga util de una mascota.
 * Lanza ErrorValidacion cuando la data no cumple las reglas del negocio.
 */
const validarMascota = (mascota: MascotaInsert): void => {
    if (!mascota || typeof mascota !== "object" || Array.isArray(mascota)) {
        throw new ErrorValidacion(
            "El cuerpo de la peticion debe ser un objeto JSON con los datos de la mascota"
        );
    }

    const campoAusente = COLUMNAS_MASCOTA.find((campo) => {
        const valor = (mascota as Record<string, unknown>)[campo];

        return valor === undefined || valor === null || valor === "";
    });

    if (campoAusente) {
        throw new ErrorValidacion(`El campo '${campoAusente}' es obligatorio`);
    }

    const reglaIncumplida = REGLAS.find(
        ([campo, esValido]) => !esValido((mascota as Record<string, unknown>)[campo])
    );

    if (reglaIncumplida) {
        throw new ErrorValidacion(reglaIncumplida[2]);
    }
};

/**
 * Servicio de la operacion POST: valida la data y la persiste.
 * Recibe el cuerpo de la peticion y devuelve la mascota creada.
 */
export const registrarMascota = async (mascota: MascotaInsert): Promise<Mascota> => {
    validarMascota(mascota);

    return mascotaRepository.save(mascota);
};
