import { METODOS_PERMITIDOS } from "./config/const.mts";
import { obtenerIdCita } from "./utils/parametros.mts";
import {
    responderError,
    respuestaNoValido,
    respuestaProhibido
} from "./utils/respuestas.mts";
import { obtenerCitaPorId, obtenerTodasLasCitas } from "./services/getCitaService.mts";

/**
 * Handler (controller) de la lambda de solo lectura de citas.
 * Solo acepta GET: con el header 'id_cita' devuelve una cita,
 * sin el header devuelve el listado completo.
 */

const revisionDeMetodo = (metodo: string): boolean => METODOS_PERMITIDOS.includes(metodo);

export const handler = async (event: any): Promise<unknown> => {
    try {
        const metodo = String(event?.method || event?.httpMethod || "").toUpperCase();
        const headers = event?.headers || event?.header || {};

        if (!revisionDeMetodo(metodo)) {
            return respuestaProhibido("Esta funcion solo permite el metodo GET");
        }

        switch (metodo) {
            case "GET": {
                const id = obtenerIdCita(headers);

                if (headers?.id_cita != null && id === undefined) {
                    return respuestaNoValido("El header 'id_cita' debe ser un numero valido");
                }

                if (id !== undefined) {
                    return await obtenerCitaPorId(id);
                }

                return await obtenerTodasLasCitas();
            }

            default:
                return respuestaProhibido("Esta funcion solo permite el metodo GET");
        }
    } catch (err) {
        return responderError(err);
    }
};
