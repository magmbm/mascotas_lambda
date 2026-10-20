import { mascota, mascota_insert } from "./types.mts";
import { registrar_mascota } from "./post_mascota.mts";
const { Pool } = require('pg');

//

const SUPABASE_PASSWORD= process.env.SUPABASE_PASSWORD;
export const pool = new Pool({

    connectionString: `postgresql://postgres.bvnqhgqcvvnaufseuhye:${SUPABASE_PASSWORD}@aws-0-us-east-2.pooler.supabase.com:5432/postgres`,

    ssl: { rejectUnauthorized: false }

});

const revision_de_metodo= (metodo : string)=> {
    switch (metodo) {
        case "PUT":
        case "DELETE":
        case "POST":
            return true;
        default:
            return false;
    }
}


export const handler= async (event : any) => {
    try {
        const metodo = event.method || event.httpMethod;
        if (!revision_de_metodo(metodo)) {
            return {
                statusCode: 403,
                body : {
                    error : "Metodo no permitido para esta funcion"
                }
            }
        }

        let body = event.body;
        if (typeof body === "string") {
            body = JSON.parse(body);
        }

        if (metodo== "POST") {
            const mascota : mascota_insert= {
                nombre_mascota : event.body.nombre_mascota,
                peso_mascota : event.body.peso_mascota,
                edad_mascota : event.body.edad_mascota,
                sexo : event.body.sexo,
                especie : event.body.especie,
                vacunado : event.body.vacunado,
            }
            return await registrar_mascota(mascota);
        }

    } catch (err : any){
        return {
            statusCode : 500,
            body : {
                error : "No fue posible procesar la peticion: " + err
            }
        }
    }
}