import { obtenerMascotaPorId, obtenerTodasLasMascotas } from "./services/getMascotaService.mts";
import { obtenerIdMascota } from "./utils/parametros.mts";
import { responderError, respuestaOk, respuestaProhibido } from "./utils/respuestas.mts";
import type { RespuestaLambda } from "./utils/respuestas.mts";

/**
 * Handler (controller) de la lambda de consulta.
 * Solo resuelve el metodo HTTP, delega la logica de negocios en el servicio
 * y arma la respuesta HTTP.
 */
export const handler = async (event: any): Promise<RespuestaLambda> => {
    try {
        const metodo = String(event?.method || event?.httpMethod || "").toUpperCase();
        const headers = event?.headers || event?.header || {};

        if (metodo !== "GET") {
            return respuestaProhibido("Metodo no permitido para esta funcion");
        }

        switch (metodo) {
            case "GET": {
                const id = obtenerIdMascota(headers);

                if (id === undefined) {
                    const mascotas = await obtenerTodasLasMascotas();

                    return respuestaOk(mascotas);
                }

                const mascota = await obtenerMascotaPorId(id);

                return respuestaOk(mascota);
            }
            default:
                return respuestaProhibido("Metodo no permitido para esta funcion");
        }
    } catch (err) {
        return responderError(err);
    }
};
