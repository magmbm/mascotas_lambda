export const handler = async (event : any) => {
    // Ejecutar solo cuando el usuario confirme su registro (Sign Up)
    if (event.triggerSource === "PostConfirmation_ConfirmSignUp") {
        const { sub, email, name, 'custom:phone': customPhone } = event.request.userAttributes;

        const SUPABASE_URL = 
        const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

        const payload = {
            id: sub, // ID único de Cognito
            email: email,
            full_name: name || null,
            phone: customPhone || null,
            created_at: new Date().toISOString()
        };

        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
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