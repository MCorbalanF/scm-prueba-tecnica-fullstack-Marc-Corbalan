# Prueba Técnica Full Stack – SCM Logistics

#### Autor: Marc Corbalán

---
> :warning: **⚠️ Aviso ⚠️**: Esta version del readme esta mejorada con IA, para ver los mensajes originales y una explicacion mas humana ver commits anteriores. Gracias.
---




## Resumen

### Tiempo invertido: aproximadamente 5–6 horas.

El objetivo de esta prueba ha sido desarrollar una solución funcional priorizando la seguridad, la mantenibilidad y una arquitectura escalable, manteniendo un equilibrio razonable con el tiempo disponible.

## Stack tecnológico
Lenguajes
- Python
- JavaScript
Backend
- FastAPI
- SQLAlchemy
- SQLite
Frontend
- Vue 3
- Vite
Contenerización
- Docker
- Docker Compose


## Consideraciones y decisiones técnicas

Durante el desarrollo se han tomado varias decisiones conscientes para optimizar el tiempo disponible sin comprometer la calidad de la solución.

- Algunas credenciales permanecen hardcodeadas únicamente por simplicidad durante la prueba. En un entorno real deberían almacenarse mediante variables de entorno y nunca formar parte del código fuente.
- Las constantes compartidas (límites, configuraciones, etc.) deberían centralizarse en un módulo de configuración (config) para evitar duplicidad y facilitar su mantenimiento.
- Se ha priorizado la seguridad y la mantenibilidad frente a implementar funcionalidades adicionales.
- Al tratarse de un stack parcialmente nuevo para mí (Vue 3), se ha dedicado parte del tiempo a consultar la documentación oficial para asegurar una implementación correcta.
- Debido al tiempo disponible, algunas mejoras han quedado identificadas como trabajo futuro.


## Ejercicio 1 — Backend: filtros dinámicos seguros

La implementación se ha diseñado con el objetivo de ser segura, reutilizable y fácilmente extensible.

### Decisiones tomadas
- Se ha creado un sistema de operadores permitido mediante un diccionario (whitelist), limitando completamente las operaciones que pueden ejecutarse.
- Cada filtro está modelado mediante clases tipadas (field, operator y value), facilitando su validación y reutilización.
- La lógica de construcción de filtros se encuentra desacoplada del modelo de datos, permitiendo reutilizarla fácilmente sobre otras entidades.
- Se utiliza SQLAlchemy para construir las consultas, evitando concatenación manual de SQL y reduciendo el riesgo de SQL Injection.
- Cualquier operador o campo no permitido devuelve automáticamente un HTTP 400.
- Se han definido límites mediante constantes para controlar:
número máximo de filtros por petición;
número máximo de resultados devueltos.

#### Posibles mejoras
- Soporte para operadores lógicos (AND / OR) más complejos.
- Ordenación dinámica.
- Paginación.
- Mayor reutilización de modelos compartidos dentro de schemas.
- Añadir una batería más amplia de pruebas automáticas.


## Bootstrap de datos

Se ha añadido un comando para generar automáticamente datos de prueba destinados al frontend y a la documentación interactiva de FastAPI.

El comando comprueba cuántos registros existen actualmente y únicamente genera los necesarios hasta alcanzar un total de 200 registros, evitando duplicados innecesarios.

Puede ejecutarse mediante:
```bash
python -m app.seed
```
o bien:

```bash
python app/seed.py
```


## Reestructuración del proyecto

Se ha reorganizado la estructura del repositorio siguiendo una distribución tipo monorepo:

- backend/
- frontend/

El frontend se ha inicializado como un proyecto independiente de Vue 3 + Vite.

Esta separación mejora:

- la organización del código;
- la mantenibilidad;
- la escalabilidad del proyecto;
- la independencia entre frontend y backend.

Aunque podría continuarse con una arquitectura todavía más desacoplada, se ha considerado suficiente para el alcance de esta prueba.

## Ejercicio 2 — Frontend

Se ha desarrollado completamente la aplicación solicitada utilizando Vue 3.

#### Trabajo realizado
- Eliminación de dependencias y archivos generados por defecto que no aportaban valor.
- Implementación del sistema de rutas.
- Separación del código por responsabilidades:
- - vistas;
- - componentes;
- - servicios API;
- - router;
- - utilidades.
- Organización pensada para facilitar la escalabilidad futura.
- Mejora de la interfaz de usuario apoyándome en herramientas de IA para acelerar la parte visual y poder dedicar más tiempo a aspectos de arquitectura y despliegue.
#### Posibles mejoras
- Configuración mediante variables de entorno (.env) para la URL base de la API y otros parámetros.
- Gestión centralizada del estado mediante Pinia en caso de crecimiento del proyecto.
- Mayor cobertura de pruebas.


## Docker y despliegue

Se han creado contenedores independientes para frontend y backend junto con un docker-compose.yml, permitiendo levantar el entorno completo con un único comando y facilitando la reproducibilidad entre distintos sistemas operativos.

Características
- Contenedor independiente para FastAPI.
- Contenedor independiente para Vue 3.
- Comunicación entre ambos mediante Docker Compose.
- Uso de .dockerignore para reducir el tamaño de las imágenes y evitar copiar archivos innecesarios.

Por simplicidad no se ha incluido un servidor Nginx ni un proxy inverso, ya que el objetivo de la prueba es facilitar la evaluación del proyecto. En un entorno de producción sería recomendable incorporar:

Nginx o Traefik.
HTTPS.
Gestión de cabeceras de seguridad.
Caché para recursos estáticos.
Configuración específica para producción.
Ejecución

Es necesario tener Docker Desktop instalado.

Desde la raíz del proyecto ejecutar:

```bash
docker compose build --no-cache
```
A continuación:


```bash
docker compose up
```


Una vez iniciados los contenedores, el frontend y el backend estarán disponibles para su evaluación desde el navegador.

## Conclusión

Durante esta prueba se ha buscado entregar una solución funcional, priorizando especialmente la seguridad, la organización del código y la facilidad de mantenimiento. Aunque existen aspectos susceptibles de ampliación, considero que la base implementada proporciona una arquitectura sólida y preparada para evolucionar de forma sencilla.