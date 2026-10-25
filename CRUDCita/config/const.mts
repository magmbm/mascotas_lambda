/**
 * Centralizacion de credenciales y valores de la aplicacion.
 * Toda la configuracion (conexion a la BD, nombres de tablas, metodos permitidos)
 * debe partir de este archivo.
 */

// --- Conexion a la base de datos (Supabase / Postgres) ---
export const DB_PROYECTO = "wppainfuspxreudrrsqy";
export const DB_REGION = "us-west-2";
export const DB_HOST = `aws-0-${DB_REGION}.pooler.supabase.com`;
export const DB_PUERTO = 5432;
export const DB_BASE_DATOS = "postgres";
export const DB_USUARIO = `postgres.${DB_PROYECTO}`;
export const DB_SSL_REJECT_UNAUTHORIZED = false;

// --- Variables de entorno ---
export const ENV_DB_PASSWORD = "SUPABASE_PASSWORD";
export const ENV_DB_PASSWORD_ALTERNATIVO = "SUPABASE_PASS";

// --- Pool de conexiones ---
export const DB_POOL_MAX_CONEXIONES = 10;
export const DB_POOL_IDLE_TIMEOUT_MS = 30000;
export const DB_POOL_CONNECTION_TIMEOUT_MS = 10000;

// --- Tablas ---
export const TABLA_CITAS = "citas";

// --- Columnas insertables/actualizables de la tabla citas ---
// id_cita y created_at los genera la base de datos.
export const COLUMNAS_CITA = [
    "fecha_hora_cita",
    "motivo_cita",
    "fk_owner",
    "fk_vet"
];

// --- Metodos HTTP soportados por la lambda CRUD ---
export const METODOS_PERMITIDOS: string[] = ["POST", "PUT", "DELETE", "GET"];

/**
 * Obtiene la password de la base de datos desde las variables de entorno.
 * Se aceptan dos nombres por compatibilidad historica con despliegues anteriores.
 */
export const obtenerPasswordDB = (): string => {
    const password = process.env[ENV_DB_PASSWORD] || process.env[ENV_DB_PASSWORD_ALTERNATIVO];

    if (!password) {
        throw new Error(
            `Falta la variable de entorno ${ENV_DB_PASSWORD} (o ${ENV_DB_PASSWORD_ALTERNATIVO}) requerida para conectar a la base de datos`
        );
    }

    return password;
};
