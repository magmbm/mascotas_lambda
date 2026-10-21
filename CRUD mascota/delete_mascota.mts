import { mascota } from "./types.mts";
import { pool } from "./crud_mascota.mts";


const DELETE_QUERY = `
    DELETE FROM mascotas WHERE id_mascota= $1;
`;

export const eliminar_mascota= async (id : number) => {
    const conexion= await pool.connect();
    try {
        const res= await conexion.query(DELETE_QUERY, [id])
        return res;

    } catch (err : any) {
        return {
            statusCode : 500,
            body : {
                error : "No fue posible procesar la peticion: " + err
            }
        }
    } finally {
        conexion.release();
    }
}