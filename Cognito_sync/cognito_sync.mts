export const handler = async (event : any) => {
    //
    if (event.triggerSource === "PostConfirmation_ConfirmSignUp") {
        const { sub, email_usuario, sapellido_usuario, papellido_usuario, nombre_usuario } = event.request.userAttributes;

        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

        const payload = {
            id_usuario: sub, // ID único de Cognito
            nombre_usuario: nombre_usuario,
            email_usuario : email_usuario,
            papellido_usuario: papellido_usuario,
            sapellido_usuario: sapellido_usuario
        };

        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/usuario`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_SERVICE_ROLE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                    'Prefer': 'resolution=merge-duplicates' // Inserta o actualiza si ya existe
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error("Error guardando en Supabase:", errorData);
            } else {
                console.log("Usuario creado con éxito en Supabase:", sub);
            }
        } catch (error) {
            console.error("Excepción en Lambda Supabase Trigger:", error);
        }
    }

    return event;
};