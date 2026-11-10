import { pool } from "../config/dbConfig.mts";
import { TABLA_CITAS, TABLA_MOTIVOS } from "../config/const.mts";
import type { Cita } from "../utils/types.mts";

const QUERY_OBTENER_POR_ID = `
    SELECT * FROM ${TABLA_CITAS} WHERE id_cita = $1;
`;

const CAMPOS_QUERY= `id_cita, created_at, fecha_hora_cita, nombre_mascota, 
    especie_mascota, fk_owner, fk_vet, fk_motivo, 
    ${TABLA_MOTIVOS}.titulo_motivo, 
    ${TABLA_MOTIVOS}.desc_motivo, 
    ${TABLA_MOTIVOS}.precio_motivo`;

const QUERY_OBTENER_TODOS = `
    SELECT ${CAMPOS_QUERY} FROM ${TABLA_CITAS} INNER JOIN motivos 
    ON ${TABLA_CITAS}.fk_motivo = ${TABLA_MOTIVOS}.id_motivo;
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
        console.log(res.rows);
        return res.rows as Cita[];
    }
}

export const citaRepository = new CitaRepository();
