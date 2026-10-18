
const revision_de_metodo= (metodo : string)=> {
    switch (metodo) {
        case "PUT":
        case "DELETE":
        case "POST":
            return true;
        default:
            return false;
    }
}


export const handler= async (event : any) => {
    try {
        if (!revision_de_metodo(event.method)) {
            return {
                statusCode: 403,
                body : {
                    error : "Metodo no permitido para esta funcion"
                }
            }
        }


    } catch {
        return {
            statusCode : 500,
            body : {
                error : "No fue posible procesar la peticion"
            }
        }
    }
}