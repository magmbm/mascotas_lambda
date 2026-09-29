const { Pool } = require('pg');

const pool = new Pool({

    connectionString: "postgresql://postgres.bvnqhgqcvvnaufseuhye:s09_BAs3$_pl0@aws-0-us-east-2.pooler.supabase.com:5432/postgres",

    ssl: { rejectUnauthorized: false }

});

type mascota= {
    id_mascota : number,
    nombre_mascota : string,
    peso_mascota : number
}

type response= {
    statusCode: number;
    mascota : mascota | null
    res : {}
}

export const handler = async (event : any) => {
    const conexion= await pool.connect();
    try {
        const res= await conexion.query(
            'SELECT id_mascota, peso_mascota, nombre_mascota FROM mascotas WHERE peso_mascota =(SELECT MAX(peso_mascota) FROM mascotas );'
        );
        //let response : response;
        
       
        const mascota : mascota= {
            id_mascota : res.rows[0].id_mascota,
            peso_mascota : res.rows[0].peso_mascota,
            nombre_mascota : res.rows[0].nombre_mascota
        }

        return {
            statusCode : 200,
            body : JSON.stringify(mascota)
        };
    } catch (error : any) {
        let response : response = {
            statusCode : 500,
            mascota : error,
            res : {}
        }
        return response;
    }
};
