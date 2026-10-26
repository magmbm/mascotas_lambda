/**
 * Respuestas HTTP de la lambda (formato proxy de API Gateway).
 * Este modulo es el unico que conoce los status codes y solo debe ser
 * importado por los handlers: servicios y repositorios no saben de HTTP.
 */
import { ErrorNoEncontrado, ErrorValidacion } from "./errores.mts";

export type RespuestaLambda = {
    statusCode: number;
    body: string;
};

export const respuestaOk = (data: unknown): RespuestaLambda => ({
    statusCode: 200,
    body: JSON.stringify(data)
});

export const respuestaNoValido = (mensaje: string): RespuestaLambda => ({
    statusCode: 400,
    body: JSON.stringify({ error: mensaje })
});

export const respuestaProhibido = (mensaje: string): RespuestaLambda => ({
    statusCode: 403,
    body: JSON.stringify({ error: mensaje })
});

export const respuestaNoEncontrado = (mensaje: string): RespuestaLambda => ({
    statusCode: 404,
    body: JSON.stringify({ error: mensaje })
});

export const respuestaError = (mensaje: string): RespuestaLambda => ({
    statusCode: 500,
    body: JSON.stringify({ error: mensaje })
});

/**
 * Traduce un error de negocio a su equivalente HTTP.
 * Unico punto del proyecto donde se decide el status code de un error.
 */
export const responderError = (err: unknown): RespuestaLambda => {
    if (err instanceof ErrorValidacion) {
        return respuestaNoValido(err.message);
    }

    if (err instanceof ErrorNoEncontrado) {
        return respuestaNoEncontrado(err.message);
    }

    return respuestaError("No fue posible procesar la peticion: " + err);
};
