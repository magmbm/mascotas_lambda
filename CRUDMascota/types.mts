export type Mascota = {
    id_mascota: number,
    nombre_mascota: string,
    peso_mascota: number,
    especie: string,
    edad_mascota: number,
    vacunado: boolean,
    sexo: string
}

export type MascotaInsert = {
    nombre_mascota: string,
    peso_mascota: number,
    especie: string,
    edad_mascota: number,
    vacunado: boolean,
    sexo: string
}

export type MascotaUpdate = Partial<MascotaInsert>
