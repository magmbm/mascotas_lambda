const { Pool } = require('pg');
import { mascota } from "./index.mts";

const pool = new Pool({

    connectionString: "postgresql://postgres.bvnqhgqcvvnaufseuhye:s09_BAs3$_pl0@aws-0-us-east-2.pooler.supabase.com:5432/postgres",

    ssl: { rejectUnauthorized: false }

});

const fetch_by_id= 'SELECT * FROM mascotas WHERE id_mascota= ?;';
const fetch_all= 'SELECT * FROM mascotas;';
        

export const handler= async (event : any) => {
    const conexion= await pool.connect();
    try {
        if (event.method!= "GET") {
            return  {
                statusCode : 403,
                body : {
                    error : "Metodo no permitido para esta funcion"
                }
            }
        }
        try {
            if (event.header.id_mascota!= null) {
                const res= await conexion.query(fetch_by_id, event.header.id_mascota);
                const mascota : mascota= {
                    id_mascota : res.rows[0].id_mascota,
                    peso_mascota : res.rows[0].peso_mascota,
                    nombre_mascota : res.rows[0].nombre_mascota,
                    edad_mascota : res.rows[0].edad_mascota,
                    vacunado : res.rows[0].vacunado,
                    sexo : res.rows[0].sexo,
                    especie : res.rows[0].especie
                }

                return {
                    statusCode : 200,
                    body : JSON.stringify(mascota)
                };
            }
            const res= await conexion.query(fetch_all);
            const mascotas : mascota[]= res.rows;
            return {
                statusCode : 200,
                body : JSON.stringify(mascotas)
            };

        } catch {
            return {
                statusCode: 500,
                body : {
                    error : "Fallo al consultar a la BD"
                }
            }
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