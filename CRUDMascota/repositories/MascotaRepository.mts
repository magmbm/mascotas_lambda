import { pool } from "../config/dbConfig.mts";
import { COLUMNAS_MASCOTA, TABLA_MASCOTAS } from "../config/const.mts";
import type { Mascota, MascotaInsert, MascotaUpdate } from "../utils/types.mts";

const QUERY_INSERTAR = `
    INSERT INTO ${TABLA_MASCOTAS} (${COLUMNAS_MASCOTA.join(", ")})
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
`;

const QUERY_OBTENER_POR_ID = `
    SELECT * FROM ${TABLA_MASCOTAS} WHERE id_mascota = $1;
`;

const QUERY_OBTENER_TODOS = `
    SELECT * FROM ${TABLA_MASCOTAS};
`;

const QUERY_ELIMINAR = `
    DELETE FROM ${TABLA_MASCOTAS} WHERE id_mascota = $1
    RETURNING *;
`;

/**
 * Repositorio por entidad: es el unico lugar donde se conoce el SQL
 * de la tabla mascotas. Es reutilizable por cualquier servicio.
 */
export class MascotaRepository {

    /** Inserta una mascota y devuelve el registro generado por la BD. */
    public async save(mascota: MascotaInsert): Promise<Mascota> {
        const res = await pool.query(QUERY_INSERTAR, [
            mascota.nombre_mascota,
            mascota.especie,
            mascota.sexo,
            mascota.peso_mascota,
            mascota.vacunado,
            mascota.edad_mascota
        ]);

        return res.rows[0] as Mascota;
    }

    /** Busca una mascota por su id, o null si no existe. */
    public async findById(id: number): Promise<Mascota | null> {
        const res = await pool.query(QUERY_OBTENER_POR_ID, [id]);

        return res.rows[0] ?? null;
    }

    /** Lista todas las mascotas de la tabla. */
    public async findAll(): Promise<Mascota[]> {
        const res = await pool.query(QUERY_OBTENER_TODOS);

        return res.rows as Mascota[];
    }

    /** Actualiza los campos indicados de una mascota, o null si no existe. */
    public async updateById(id: number, cambios: MascotaUpdate): Promise<Mascota | null> {
        const campos = COLUMNAS_MASCOTA.filter(
            (columna) => cambios[columna as keyof MascotaUpdate] !== undefined
        );

        if (campos.length === 0) {
            return null;
        }

        const asignaciones = campos.map((columna, indice) => `${columna} = $${indice + 1}`);
        const valores = [...campos.map((columna) => cambios[columna as keyof MascotaUpdate]), id];

        const query = `
            UPDATE ${TABLA_MASCOTAS}
            SET ${asignaciones.join(", ")}
            WHERE id_mascota = $${valores.length}
            RETURNING *;
        `;

        const res = await pool.query(query, valores);

        return res.rows[0] ?? null;
    }

    /** Elimina una mascota por su id y devuelve el registro eliminado. */
    public async deleteById(id: number): Promise<Mascota | null> {
        const res = await pool.query(QUERY_ELIMINAR, [id]);

        return res.rows[0] ?? null;
    }
}

export const mascotaRepository = new MascotaRepository();
