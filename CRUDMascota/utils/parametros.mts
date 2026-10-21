/**
 * Extraccion de parametros desde el evento recibido por la lambda.
 */
export const obtenerIdMascota = (headers: any): number | undefined => {
    const id = headers?.id_mascota ?? headers?.["id_mascota"];

    if (id === undefined || id === null || id === "") {
        return undefined;
    }

    const idNumero = parseInt(String(id), 10);

    return Number.isNaN(idNumero) ? undefined : idNumero;
};
