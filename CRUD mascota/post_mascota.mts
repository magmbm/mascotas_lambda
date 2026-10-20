import { mascota, mascota_insert } from "./types.mts";
import { pool } from "./crud_mascota.mts";


const INSERT_QUERY = `
    INSERT INTO mascotas (nombre_mascota, especie, sexo, peso_mascota, vacunado, edad_mascota) 
    VALUES ($1, $2, $3, $4, $5, $6) 
    RETURNING *;
`;

export const registrar_mascota= async (mascota : mascota_insert) => {
    const conexion= await pool.connect();
    try {
        const res= await conexion.query(INSERT_QUERY, [
            mascota.nombre_mascota,
            mascota.especie,
            mascota.sexo,
            mascota.peso_mascota,
            mascota.vacunado,
            mascota.edad_mascota
        ])

        if (res.rowCount && res.rowCount > 0) {
            return {
                statusCode: 201,
                body: JSON.stringify(res.rows[0])
            };
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "No se pudo insertar el registro" })
            };
        }

    } catch (err : any){
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