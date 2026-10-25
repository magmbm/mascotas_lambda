import { pool } from "../config/dbConfig.mts";
import { COLUMNAS_USUARIO, TABLA_USUARIO } from "../config/const.mts";
import type { Usuario, UsuarioInsert, UsuarioUpdate } from "../utils/types.mts";

const QUERY_INSERTAR = `
    INSERT INTO ${TABLA_USUARIO} (${COLUMNAS_USUARIO.join(", ")})
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
`;

const QUERY_OBTENER_POR_ID = `
    SELECT * FROM ${TABLA_USUARIO} WHERE id_mascota = $1;
`;

const QUERY_OBTENER_TODOS = `
    SELECT * FROM ${TABLA_USUARIO};
`;

const QUERY_ELIMINAR = `
    DELETE FROM ${TABLA_USUARIO} WHERE id_mascota = $1
    RETURNING *;
`;

/**
 * Repositorio por entidad: es el unico lugar donde se conoce el SQL
 * de la tabla mascotas. Es reutilizable por cualquier servicio.
 */
export class UsuarioRepository {

    /** Inserta una mascota y devuelve el registro generado por la BD. */
    public async save(usuario: UsuarioInsert): Promise<Usuario> {
        const res = await pool.query(QUERY_INSERTAR, [
            usuario.nombre_usuario,
            usuario.papellido_usuario,
            usuario.sapellido_usuario,
            usuario.numrun_usuario,
            usuario.dvrun_usuario,
            usuario.email_usuario
        ]);

        return res.rows[0] as Usuario;
    }

    /** Busca una mascota por su id, o null si no existe. */
    public async findById(id: number): Promise<Usuario | null> {
        const res = await pool.query(QUERY_OBTENER_POR_ID, [id]);

        return res.rows[0] ?? null;
    }

    /** Lista todas las mascotas de la tabla. */
    public async findAll(): Promise<Usuario[]> {
        const res = await pool.query(QUERY_OBTENER_TODOS);

        return res.rows as Usuario[];
    }

    /** Actualiza los campos indicados de una mascota, o null si no existe. */
    public async updateById(id: number, cambios: UsuarioUpdate): Promise<Usuario | null> {
        const campos = COLUMNAS_USUARIO.filter(
            (columna) => cambios[columna as keyof UsuarioUpdate] !== undefined
        );

        if (campos.length === 0) {
            return null;
        }

        const asignaciones = campos.map((columna, indice) => `${columna} = $${indice + 1}`);
        const valores = [...campos.map((columna) => cambios[columna as keyof UsuarioUpdate]), id];

        const query = `
            UPDATE ${TABLA_USUARIO}
            SET ${asignaciones.join(", ")}
            WHERE id_mascota = $${valores.length}
            RETURNING *;
        `;

        const res = await pool.query(query, valores);

        return res.rows[0] ?? null;
    }

    /** Elimina una mascota por su id y devuelve el registro eliminado. */
    public async deleteById(id: number): Promise<Usuario | null> {
        const res = await pool.query(QUERY_ELIMINAR, [id]);

        return res.rows[0] ?? null;
    }
}

export const usuarioRepository = new UsuarioRepository();
