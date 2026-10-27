export type Cita = {
    id_cita: number,
    created_at: string,
    fecha_hora_cita: string,
    motivo_cita: string,
    nombre_mascota: string,
    especie_mascota: string,
    fk_owner: number,
    fk_vet: number
}
