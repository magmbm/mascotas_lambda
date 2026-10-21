import { mascota, mascota_insert } from "./types.mts";
import { registrar_mascota } from "./post_mascota.mts";
import { eliminar_mascota } from "./delete_mascota.mts";
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
        const headers= event.header || event.headers;
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

        switch(metodo) {
            case "POST":
                const mascota : mascota_insert= {
                    nombre_mascota : body.nombre_mascota,
                    peso_mascota :   body.peso_mascota,
                    edad_mascota :   body.edad_mascota,
                    sexo :           body.sexo,
                    especie :        body.especie,
                    vacunado :       body.vacunado,
                }
                return await registrar_mascota(mascota);
            case "DELETE":
                const id_por_eliminar= headers.id_mascota || headers["id_mascota"];
                if (id_por_eliminar== null) {
                    return await eliminar_mascota(id_por_eliminar);
                }
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