export type Cita = {
    id_cita: number,
    created_at: string,
    fecha_hora_cita: string,
    fk_motivo: Motivo,
    nombre_mascota: string,
    especie_mascota: string,
    fk_owner: number,
    fk_vet: number
}

export type Motivo = {
    id_motivo : number,
    titulo_motivo : string,
    desc_motivo : string,
    precio_motivo : number
}

//