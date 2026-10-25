export type Usuario = {
    id_usuario: number,
    nombre_usuario: string,
    papellido_usuario: string,
    sapellido_usuario: string,
    email_usuario: string,
    numrun_usuario: number,
    dvrun_usuario: string
}

export type UsuarioInsert = {
    nombre_usuario: string,
    papellido_usuario: string,
    sapellido_usuario: string,
    email_usuario: string,
    numrun_usuario: number,
    dvrun_usuario: string
}

export type UsuarioUpdate = Partial<UsuarioInsert>
