import { pool } from "../config/dbConfig.mts";
import { TABLA_CITAS } from "../config/const.mts";
import type { Cita } from "../utils/types.mts";

const QUERY_OBTENER_POR_ID = `
    SELECT * FROM ${TABLA_CITAS} WHERE id_cita = $1;
`;

const QUERY_OBTENER_TODOS = `
    SELECT * FROM ${TABLA_CITAS};
`;

/**
 * Repositorio de solo lectura para la tabla citas.
 * Es el unico lugar donde se conoce el SQL de la entidad.
 */
export class CitaRepository {

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
}

export const citaRepository = new CitaRepository();
