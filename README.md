# Prueba tecnica full stack SCM Logistics
## Marc Corbalan
---

Total horas invertidas:


### Stack tecnologico escogido:
Lenguajes: Python y JavaScript

Backend:
- fastapi
Frontend: 
-React Vue 3
Despliege:
- Docker

### Tradeoffs del proyecto:
- Credenciales HARDCODEDS, deberian ir en una variable de entorno i leerse a traves de alli. Por acelerar el proceso se dejan hardcodeados, pero en produccion esta prohibido hardcodear ningun elemento.
- Las variables secundarias deberian ir en su propio archivo config y llamarlas desde alli a cualquier parte del codigo, para tener mas transversabilidad (limites i demas variables que puedan usarse en varias partes del codigo)


## Ejercicio 1 - Backend: filtros dinamicos seguros:
- Hay que hacer un diccionario para limitar los tipos de operaciones permitidas y tener los casos bajo control. creando una clase y un diccionario tenemos todos los casos controlados y como debe operar cada caso, de esta manera los tenemos fuertementetipados.
- Creamos las clases que necesitamos para filtrar de manera dinamica, de esta manera si se tiene que aplicar mas filtros se puede hacer mucho mas sencillo aplicando los modelos a otra clase.
- Se ha tipado todo para poder ejercer estados mas facilmente, se compone de Field, operator, i value
- Se ha separado responsabilidades entre las clases y la logica. de esta manera se peud ereutilizar el codigo para otros modelos.
- Se evita la inyeccion de sql a traves de cadenas de texto, se utiliza el ORM para validas los datos y genera una whitelist. Los operadores tambien estan estrictamente limitados, i cualquier cosa indebida devuelve un 400
- Limites establecidos con variables constantes.maximo de filtros por peticion i maximos resultados
- A MEJORAR: otros operadores logicos, mas condiciones, sorting, paginacion... etc, colocar en schemas algunas clases para que se comparta en todo el codigo
- (he echo un solo commit para esta solucion por que creo que deberia procederse a una solucion inmediata en este tipo de casos como es un agujero de seguridad, y de esa solucion ir mejorando el commit)

## Bootstrap de datos:
- Añadido un comando para poder añadir muchos datos para pruebas del frontend o el docs de fastapi... se ha limitado a cuantos y si ya hay data disponible
 Ejecturalo:
```bash

python -m app.seed

```
o
```bash
python app/seed.py
```
# Mover los archivos, clean architecture:
Se ha movido los archivos pertenientes a su carpeta monorepo backend i se ha iniciado el proyecto de vue en vite en su carpeta correspondiente de frontend. de esta manera el codigo es mas limpio i legible a largo plazo, aun se podria abstraer mas pero creo que es sobreingeneria para el proyecto, con esto es mas que suficiente para que se entienda.

## Ejercicio 2 - Frontend: Frontend: login y consumo del API
