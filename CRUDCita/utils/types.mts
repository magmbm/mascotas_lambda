export type Cita = {
    id_cita: number,
    created_at: string,
    fecha_hora_cita: string,
    motivo_cita: string,
    fk_owner: number
}

export type CitaInsert = {
    fecha_hora_cita: string,
    motivo_cita: string,
    fk_owner: number
}

export type CitaUpdate = Partial<CitaInsert>
