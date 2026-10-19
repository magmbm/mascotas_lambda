const { Pool } = require('pg');
import { mascota } from "./types.mts";

const pool = new Pool({

    connectionString: "postgresql://postgres.bvnqhgqcvvnaufseuhye:s09_BAs3$_pl0@aws-0-us-east-2.pooler.supabase.com:5432/postgres",

    ssl: { rejectUnauthorized: false }

});

const INSERT_QUERY= "INSERT INTO mascotas (nombre_mascota, especie, sexo, peso_mascota, vacunado, edad_mascota) VALUES(?, ?, ?, ?, ?, ?)";

export const handler= async (event : any) => {
    try {
        const mascota : mascota = {
            id_mascota : 0,
            nombre_mascota : event.body.nombre_mascota,
            peso_mascota : event.body.peso_mascota,
            edad_mascota : event.body.edad_mascota,
            sexo : event.body.sexo,
            especie : event.body.especie,
            vacunado : event.body.vacunado,
        }
        const conexion= await pool.connect();
        const res= conexion.query(INSERT_QUERY, mascota)
        return {
            statusCode : 201,
            body : JSON.stringify(mascota)
        }
    } catch {
        return {
            statusCode : 500,
            body : {
                error : "No fue posible procesar la peticion"
            }
        }
    }
}