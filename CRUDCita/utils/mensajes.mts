/**
 * Desempaquetado de eventos SQS/SNS y normalizacion de los mensajes
 * que envia el BFF (Spring Boot) hacia la forma de la tabla citas.
 *
 * Flujo soportado:
 *   BFF -> SNS -> SQS -> Lambda
 *
 * Tambien soporta:
 *   - SQS con entrega directa del mensaje (sin envoltura SNS)
 *   - SNS invocando la lambda directamente
 */

/**
 * Alias de los nombres que puede usar el BFF para cada campo.
 * Permite aceptar tanto camelCase de Java como snake_case de la BD.
 */
const ALIAS_CAMPOS: Record<string, string> = {
    id: "id_cita",
    citaId: "id_cita",
    idCita: "id_cita",
    fecha: "fecha_hora_cita",
    fechaHora: "fecha_hora_cita",
    fechaHoraCita: "fecha_hora_cita",
    fecha_hora: "fecha_hora_cita",
    motivo: "motivo_cita",
    motivoCita: "motivo_cita",
    nombre: "nombre_mascota",
    nombreMascota: "nombre_mascota",
    mascotaNombre: "nombre_mascota",
    especie: "especie_mascota",
    especieMascota: "especie_mascota",
    especie_mascota: "especie_mascota",
    mascotaEspecie: "especie_mascota",
    owner: "fk_owner",
    ownerId: "fk_owner",
    idOwner: "fk_owner",
    fkOwner: "fk_owner",
    propietarioId: "fk_owner",
    idPropietario: "fk_owner",
    vet: "fk_vet",
    vetId: "fk_vet",
    idVet: "fk_vet",
    fkVet: "fk_vet",
    veterinarioId: "fk_vet",
    idVeterinario: "fk_vet"
};

const CAMPOS_CITA = [
    "id_cita",
    "fecha_hora_cita",
    "motivo_cita",
    "nombre_mascota",
    "especie_mascota",
    "fk_owner",
    "fk_vet"
];

const CAMPOS_NUMERICOS = ["id_cita", "fk_owner", "fk_vet"];

/** Convierte camelCase a snake_case: fechaHoraCita -> fecha_hora_cita */
const aSnakeCase = (clave: string): string =>
    clave.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();

/** Parsea un string JSON; si no es JSON valido devuelve el valor original. */
const parsearJson = (valor: unknown): unknown => {
    if (typeof valor !== "string") {
        return valor;
    }

    try {
        return JSON.parse(valor);
    } catch {
        return valor;
    }
};

/** Parsea strings JSON anidados (mensajes doblemente serializados). */
const parsearHastaObjeto = (valor: unknown): unknown => {
    let actual = valor;

    for (let intento = 0; intento < 3 && typeof actual === "string"; intento++) {
        actual = parsearJson(actual);
    }

    return actual;
};

/**
 * Normaliza las claves del mensaje a las columnas de la tabla citas
 * y convierte los ids enviados como texto a numero.
 */
export const normalizarCita = (datos: unknown): unknown => {
    const parseado = parsearHastaObjeto(datos);

    if (!parseado || typeof parseado !== "object" || Array.isArray(parseado)) {
        return parseado;
    }

    const normalizado: Record<string, unknown> = {};

    for (const [clave, valor] of Object.entries(parseado as Record<string, unknown>)) {
        const destino = ALIAS_CAMPOS[clave] ?? aSnakeCase(clave);
        normalizado[destino] = valor;
    }

    for (const campo of CAMPOS_NUMERICOS) {
        const valor = normalizado[campo];

        if (typeof valor === "string" && valor.trim() !== "" && !Number.isNaN(Number(valor))) {
            normalizado[campo] = Number(valor);
        }
    }

    return normalizado;
};

const tieneCamposDeCita = (valor: unknown): boolean =>
    !!valor &&
    typeof valor === "object" &&
    !Array.isArray(valor) &&
    Object.keys(valor as Record<string, unknown>).some((clave) => CAMPOS_CITA.includes(clave));

const MESES_ES: Record<string, number> = {
    enero: 1,
    febrero: 2,
    marzo: 3,
    abril: 4,
    mayo: 5,
    junio: 6,
    julio: 7,
    agosto: 8,
    septiembre: 9,
    setiembre: 9,
    octubre: 10,
    noviembre: 11,
    diciembre: 12
};

const dosDigitos = (valor: number): string => String(valor).padStart(2, "0");

/**
 * Convierte la fecha enviada por el frontend a un timestamp sin zona.
 * Soporta dd/mm/yyyy, dd-mm-yyyy, yyyy-mm-dd, "30 de octubre de 2026"
 * y formatos ISO con hora. Si solo viene la fecha se usa 00:00.
 */
export const normalizarFecha = (valor: string): string | undefined => {
    const texto = valor.trim();

    const conHora = texto.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})(?:\s+(\d{1,2}):(\d{2}))?$/);

    if (conHora) {
        const anio = conHora[3].length === 2 ? `20${conHora[3]}` : conHora[3];
        const hora = conHora[4] ?? "00";
        const minuto = conHora[5] ?? "00";

        return `${anio}-${dosDigitos(Number(conHora[2]))}-${dosDigitos(Number(conHora[1]))}T${dosDigitos(Number(hora))}:${minuto}:00`;
    }

    const iso = texto.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ](\d{1,2}):(\d{2}))?/);

    if (iso) {
        const hora = iso[4] ?? "00";
        const minuto = iso[5] ?? "00";

        return `${iso[1]}-${dosDigitos(Number(iso[2]))}-${dosDigitos(Number(iso[3]))}T${dosDigitos(Number(hora))}:${minuto}:00`;
    }

    const largo = texto.match(/^(\d{1,2})\s+de\s+([a-záéíóúñ]+)\s+de\s+(\d{4})$/i);

    if (largo) {
        const mes = MESES_ES[largo[2].toLowerCase()];

        if (mes) {
            return `${largo[3]}-${dosDigitos(mes)}-${dosDigitos(Number(largo[1]))}T00:00:00`;
        }
    }

    return undefined;
};

/** Convierte las lineas "Clave: valor" del mensaje en un mapa. */
const parsearLineas = (texto: string): Record<string, string> => {
    const campos: Record<string, string> = {};

    for (const linea of texto.split(/\r?\n/)) {
        const separador = linea.indexOf(":");

        if (separador <= 0) {
            continue;
        }

        const clave = linea.slice(0, separador).trim().toLowerCase();
        const valor = linea.slice(separador + 1).trim();

        if (clave && valor) {
            campos[clave] = valor;
        }
    }

    return campos;
};

/**
 * Interpreta el mensaje de texto plano que arma el frontend:
 *
 *   Nueva solicitud de cita
 *   Mascota: Firulais (Perro)
 *   Motivo: Control
 *   Fecha preferida: 30/10/2026
 *   Dueno: correo@ejemplo.cl
 */
export const parsearMensajeTexto = (texto: string): Record<string, unknown> | undefined => {
    if (typeof texto !== "string" || !texto.includes(":")) {
        return undefined;
    }

    const campos = parsearLineas(texto);

    const mascota = campos["mascota"];
    const motivo = campos["motivo"];
    const fecha = campos["fecha preferida"] ?? campos["fecha"];
    const owner = campos["dueño"] ?? campos["dueno"] ?? campos["owner"] ?? campos["email"];

    if (!mascota && !motivo && !fecha) {
        return undefined;
    }

    const resultado: Record<string, unknown> = {};

    if (mascota) {
        const coincidencia = mascota.match(/^(.*?)\s*\((.*)\)\s*$/);

        if (coincidencia) {
            resultado.nombre_mascota = coincidencia[1].trim();
            resultado.especie_mascota = coincidencia[2].trim();
        } else {
            resultado.nombre_mascota = mascota.trim();
        }
    }

    if (motivo) {
        resultado.motivo_cita = motivo.trim();
    }

    if (fecha && fecha.toLowerCase() !== "sin fecha seleccionada") {
        const fechaNormalizada = normalizarFecha(fecha);

        if (fechaNormalizada) {
            resultado.fecha_hora_cita = fechaNormalizada;
        }
    }

    if (owner && owner.toLowerCase() !== "no disponible") {
        resultado.email_owner = owner.trim();
    }

    // Los ids de las FK deben venir en el mensaje como numeros enteros.
    const idOwner =
        campos["id dueno"] ??
        campos["id dueño"] ??
        campos["id_owner"] ??
        campos["idowner"] ??
        campos["id owner"] ??
        campos["owner id"] ??
        campos["fk_owner"] ??
        campos["id propietario"] ??
        campos["idpropietario"] ??
        campos["propietario id"];

    const idVet =
        campos["id vet"] ??
        campos["id_vet"] ??
        campos["idvet"] ??
        campos["id veterinario"] ??
        campos["id_veterinario"] ??
        campos["veterinario id"] ??
        campos["fk_vet"];

    if (idOwner !== undefined && idOwner.trim() !== "" && !Number.isNaN(Number(idOwner))) {
        resultado.fk_owner = Number(idOwner);
    }

    if (idVet !== undefined && idVet.trim() !== "" && !Number.isNaN(Number(idVet))) {
        resultado.fk_vet = Number(idVet);
    }

    return resultado;
};

/**
 * Extrae el payload de negocio desde un registro de SQS o de SNS.
 * Desenvuelve SNS dentro de SQS y acepta tanto JSON (camelCase o
 * snake_case) como el mensaje de texto plano que arma el frontend.
 */
export const extraerMensaje = (record: any): unknown => {
    let mensaje: unknown;

    // SNS invocando la lambda directamente
    if (record?.Sns?.Message !== undefined) {
        mensaje = record.Sns.Message;
    } else {
        mensaje = parsearHastaObjeto(record?.body);

        // Envoltura SNS dentro de SQS
        if (
            mensaje &&
            typeof mensaje === "object" &&
            !Array.isArray(mensaje) &&
            (mensaje as Record<string, unknown>).Message !== undefined
        ) {
            mensaje = parsearHastaObjeto((mensaje as Record<string, unknown>).Message);
        }
    }

    let normalizado = normalizarCita(mensaje);

    // Mensajes de texto plano armados por el frontend
    if (typeof normalizado === "string") {
        return parsearMensajeTexto(normalizado) ?? normalizado;
    }

    if (!tieneCamposDeCita(normalizado) && normalizado && typeof normalizado === "object") {
        const contenedor = normalizado as Record<string, unknown>;
        const anidado =
            contenedor.payload ??
            contenedor.data ??
            contenedor.datos ??
            contenedor.mensaje ??
            contenedor.cita ??
            contenedor.body;

        if (anidado !== undefined) {
            const desanidado = normalizarCita(anidado);

            return typeof desanidado === "string"
                ? parsearMensajeTexto(desanidado) ?? desanidado
                : desanidado;
        }
    }

    return normalizado;
};

/** Operacion a ejecutar: usa el campo del mensaje o asume POST. */
export const obtenerOperacion = (mensaje: any): string => {
    const operacion =
        mensaje?.method ??
        mensaje?.httpMethod ??
        mensaje?.operacion ??
        mensaje?.accion ??
        mensaje?.action ??
        "POST";

    return String(operacion).toUpperCase();
};

/** Id de la cita incluido en el mensaje (para PUT y DELETE). */
export const obtenerIdMensaje = (mensaje: any): number | undefined => {
    const id = mensaje?.id_cita;

    if (id === undefined || id === null || id === "") {
        return undefined;
    }

    const idNumero = Number(id);

    return Number.isInteger(idNumero) && idNumero > 0 ? idNumero : undefined;
};
