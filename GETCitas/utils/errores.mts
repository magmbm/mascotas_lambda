/**
 * Errores de negocio (dominio).
 * No contienen informacion de HTTP: el mapeo a status code es
 * responsabilidad exclusiva del handler (ver utils/respuestas.mts).
 */

export class ErrorValidacion extends Error {
    constructor(mensaje: string) {
        super(mensaje);
        this.name = "ErrorValidacion";
    }
}

export class ErrorNoEncontrado extends Error {
    constructor(mensaje: string) {
        super(mensaje);
        this.name = "ErrorNoEncontrado";
    }
}
