export type mascota= {
    id_mascota : number,
    nombre_mascota : string,
    peso_mascota : number,
    especie : string,
    edad_mascota : number,
    vacunado : boolean,
    sexo : string
}

export type mascota_insert= {
    nombre_mascota : string,
    peso_mascota : number,
    especie : string,
    edad_mascota : number,
    vacunado : boolean,
    sexo : string
}