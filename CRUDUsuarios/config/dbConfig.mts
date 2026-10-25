import { Pool } from "pg";
import {
    DB_BASE_DATOS,
    DB_HOST,
    DB_POOL_CONNECTION_TIMEOUT_MS,
    DB_POOL_IDLE_TIMEOUT_MS,
    DB_POOL_MAX_CONEXIONES,
    DB_PUERTO,
    DB_SSL_REJECT_UNAUTHORIZED,
    DB_USUARIO,
    obtenerPasswordDB
} from "./const.mts";

/**
 * VIM IV
 * Configuracion del pool de conexiones a la base de datos.
 * El pool es un singleton reutilizado entre invocaciones: no se abre
 * una conexion nueva por cada request.
 */
export const pool: Pool = new Pool({
    host: DB_HOST,
    port: DB_PUERTO,
    database: DB_BASE_DATOS,
    user: DB_USUARIO,
    password: obtenerPasswordDB(),
    ssl: { rejectUnauthorized: DB_SSL_REJECT_UNAUTHORIZED },
    max: DB_POOL_MAX_CONEXIONES,
    idleTimeoutMillis: DB_POOL_IDLE_TIMEOUT_MS,
    connectionTimeoutMillis: DB_POOL_CONNECTION_TIMEOUT_MS
});

pool.on("error", (err) => {
    console.error("Error inesperado en el pool de PostgreSQL:", err);
});
