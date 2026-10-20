import { mascota } from "./types.mts";
import { pool } from "./crud_mascota.mts";


const DELETE_QUERY = `
    DELETE FROM mascotas WHERE id_mascota= $1;
`;

export const registrar_mascota= async (id : number) => {
    const conexion= await pool.connect();
    try {
        const res= conexion.query(DELETE_QUERY, [id])
        if (res.rowCount > 0) {
            console.log(res);
            console.log(`Successfully deleted ${res.rowCount} record(s).`);
        } else {
            console.log("Query ran successfully, but no record matched that ID.");
        }

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