import { mascota } from "./types.mts";
import { pool } from "./crud_mascota.mts";


const INSERT_QUERY = `
    INSERT INTO mascotas (nombre_mascota, especie, sexo, peso_mascota, vacunado, edad_mascota) 
    VALUES ($1, $2, $3, $4, $5, $6) 
    RETURNING *;
`;

export const registrar_mascota= async (mascota : mascota) => {
    const conexion= await pool.connect();
    try {
        const res= conexion.query(INSERT_QUERY, [mascota])
        if (res.rowCount > 0) {
            console.log(res);
            console.log(`Successfully deleted ${res.rowCount} record(s).`);
        } else {
            console.log(res);
            console.log("Error");
        }

    } catch {
        return {
            statusCode : 500,
            body : {
                error : "No fue posible procesar la peticion"
            }
        }
    } finally {
        conexion.release();
    }
}