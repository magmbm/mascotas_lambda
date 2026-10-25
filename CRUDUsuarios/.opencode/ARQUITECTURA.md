# Estructura en capas

- handler solo debe tener un swtich, actua a modo controller
- la logica de negocios debe vivir en archivos separados funcionales por cada operacion que tenga el swtich
- los servicios llaman a repositorios reutilizables con los metodos para acceder a la tabla SQL, los repositorios son por entidad
- archivo de const.mts: (dentro del directorio config) centralizacion de credenciales y valores
- archivo dbConfig.mts: configuracion para el pool a la DB

Ejemplo

index.mts
- Solo el handler y los switch
- Tiene la conversion del body al objeto requerido en json

MascotaService
-   save(): recibe el body envia a MascotaRepository.save()

MascotaRepository (utiliza el pool DB)
- save(): recibe el body y lo inserta en la tabla sql

- todas la funciones son camelcase
- Repositorios son PascalCase
- service son funcionales y son camelCase
- evitar let, preferir const
- preferir codigo funcional sobre iterativo
- las respuestas http solo las maneja el handler
- los servicios solo reciben json o primitivas, no conocen nada sobre http
- solo los repositorios conocen la implementacion SQL