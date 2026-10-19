const { Pool } = require('pg');

export type mascota= {
    id_mascota : number,
    nombre_mascota : string,
    peso_mascota : number,
    especie : string,
    edad_mascota : number,
    vacunado : boolean,
    sexo : string
}

//

const SUPABASE_PASS= process.env.SUPABASE_PASS;

const pool = new Pool({

    connectionString: `postgresql://postgres.bvnqhgqcvvnaufseuhye:${SUPABASE_PASS}@aws-0-us-east-2.pooler.supabase.com:5432/postgres`,

    ssl: { rejectUnauthorized: false }

});

const fetch_by_id= 'SELECT * FROM mascotas WHERE id_mascota= $1;';
const fetch_all= 'SELECT * FROM mascotas;';
        

export const handler= async (event : any) => {
    const conexion= await pool.connect();
    try {
        const headers = event.headers || event.header || {};
        const id_mascota = headers.id_mascota || headers['id_mascota'];

        if (event.method!= "GET") {
            return  {
                statusCode : 403,
                body : {
                    error : "Metodo no permitido para esta funcion"
                }
            }
        }
        try {
            if (id_mascota!= null) {
                const res= await conexion.query(fetch_by_id, [parseInt(id_mascota)]);
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

        } catch (err : any){
            return {
                statusCode: 500,
                body : {
                    error : "Fallo al consultar a la BD: " + err
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