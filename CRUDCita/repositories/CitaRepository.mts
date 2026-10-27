import { pool } from "../config/dbConfig.mts";
import { COLUMNAS_CITA, TABLA_CITAS } from "../config/const.mts";
import type { Cita, CitaInsert, CitaUpdate } from "../utils/types.mts";

const QUERY_INSERTAR = `
    INSERT INTO ${TABLA_CITAS} (${COLUMNAS_CITA.join(", ")})
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
`;

const QUERY_OBTENER_POR_ID = `
    SELECT * FROM ${TABLA_CITAS} WHERE id_cita = $1;
`;

const QUERY_OBTENER_TODOS = `
    SELECT * FROM ${TABLA_CITAS};
`;

const QUERY_ELIMINAR = `
    DELETE FROM ${TABLA_CITAS} WHERE id_cita = $1
    RETURNING *;
`;

/**
 * Repositorio por entidad: es el unico lugar donde se conoce el SQL
 * de la tabla citas. Es reutilizable por cualquier servicio.
 */
export class CitaRepository {

    /** Inserta una cita y devuelve el registro generado por la BD. */
    public async save(cita: CitaInsert): Promise<Cita> {
        const res = await pool.query(QUERY_INSERTAR, [
            cita.fecha_hora_cita,
            cita.motivo_cita,
            cita.nombre_mascota,
            cita.especie_mascota,
            cita.fk_owner,
            cita.fk_vet
        ]);

        return res.rows[0] as Cita;
    }

    /** Busca una cita por su id, o null si no existe. */
    public async findById(id: number): Promise<Cita | null> {
        const res = await pool.query(QUERY_OBTENER_POR_ID, [id]);

        return res.rows[0] ?? null;
    }

    /** Lista todas las citas de la tabla. */
    public async findAll(): Promise<Cita[]> {
        const res = await pool.query(QUERY_OBTENER_TODOS);

        return res.rows as Cita[];
    }

    /** Actualiza los campos indicados de una cita, o null si no existe. */
    public async updateById(id: number, cambios: CitaUpdate): Promise<Cita | null> {
        const campos = COLUMNAS_CITA.filter(
            (columna) => cambios[columna as keyof CitaUpdate] !== undefined
        );

        if (campos.length === 0) {
            return null;
        }

        const asignaciones = campos.map((columna, indice) => `${columna} = $${indice + 1}`);
        const valores = [...campos.map((columna) => cambios[columna as keyof CitaUpdate]), id];

        const query = `
            UPDATE ${TABLA_CITAS}
            SET ${asignaciones.join(", ")}
            WHERE id_cita = $${valores.length}
            RETURNING *;
        `;

        const res = await pool.query(query, valores);

        return res.rows[0] ?? null;
    }

    /** Elimina una cita por su id y devuelve el registro eliminado. */
    public async deleteById(id: number): Promise<Cita | null> {
        const res = await pool.query(QUERY_ELIMINAR, [id]);

        return res.rows[0] ?? null;
    }
}

export const citaRepository = new CitaRepository();
