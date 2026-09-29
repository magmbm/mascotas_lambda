const { Pool } = require('pg');



const pool = new Pool({

    connectionString: "postgresql://postgres.bvnqhgqcvvnaufseuhye:c0nTraec201@aws-0-us-east-2.pooler.supabase.com:5432/postgres",

    ssl: { rejectUnauthorized: false }

});



exports.handler = async (event) => {

    const client = await pool.connect();

    

    try {

        for (const record of event.Records) {

            const body = JSON.parse(record.body);

            console.log("Procesando producto de SQS:", body);



            const queryText = `

                INSERT INTO mascotas (id_mascota, nombre_mascota, edad_mascota, vacunado, especie, sexo, peso_mascota) 

                VALUES ($1, $2, $3, $4, $5, $6, $7) 

                RETURNING *;

            `;

            const values = [
                body.id_mascota, body.nombre_mascota, body.edad_mascota, 
                body.vacunado, body.especie, body.sexo, body.peso_mascota
            ];



            const res = await client.query(queryText, values);

            console.log("Producto insertado en PostgreSQL exitosamente:", res.rows[0]);

        }



        return { 

            statusCode: 200, 

            body: JSON.stringify("Productos procesados e insertados correctamente.") 

        };

    } catch (error) {

        console.error("Error al insertar en PostgreSQL:", error);

        throw error;

    } finally {

        client.release();

    }

};




