# Sequelize POC: Carga Perezosa (Lazy Loading) vs. Carga Ansiosa (Eager Loading)

Este proyecto demuestra los conceptos de **Carga Perezosa (Lazy Loading)** y **Carga Ansiosa (Eager Loading)** utilizando el ORM Sequelize con una base de datos SQLite. Ilustra cómo se obtienen las relaciones entre modelos de la base de datos y resalta el "problema N+1" que puede surgir con la carga perezosa.

## Estructura del Proyecto

*   `src/models/`: Define los modelos de Sequelize (User, Post, Comment, Tag) y sus asociaciones.
*   `src/database.js`: Configura la instancia de Sequelize y se conecta a la base de datos SQLite.
*   `src/setup.js`: Inicializa la base de datos, sincroniza los modelos y carga datos de ejemplo en la base de datos.
*   `src/eager-loading-example.js`: Demuestra la obtención de datos con todos los modelos relacionados en una sola consulta optimizada utilizando carga ansiosa (`include`).
*   `src/lazy-loading-example.js`: Demuestra la obtención de datos donde los modelos relacionados se cargan bajo demanda, lo que lleva a múltiples consultas (el problema N+1).

## Cómo Ejecutar (usando Docker)

El proyecto está configurado para ejecutarse completamente dentro de contenedores Docker, por lo que no necesita instalar Node.js o Sequelize directamente en su máquina.

1.  **Navegue al directorio del proyecto:**
    ```bash
    cd sequelize-poc
    ```

2.  **Construya y Ejecute la aplicación (inicie el servidor API):**
    Este comando construirá la imagen de Docker (si no ha sido construida o si se detectan cambios), iniciará el contenedor Docker en modo separado (detached) y lanzará el servidor API. El servidor configurará automáticamente la base de datos y cargará los datos de ejemplo al iniciar.
    ```bash
    docker compose up --build -d
    ```

3.  **Verifique el estado del contenedor:** (Opcional)
    Verifique si el contenedor está en ejecución:
    ```bash
    docker ps
    ```
    Debería ver `sequelize-app` listado como "Up".

4.  **Acceda a los Endpoints:**
    Una vez que el servidor esté en ejecución, puede acceder a los ejemplos de carga ansiosa y perezosa a través de solicitudes HTTP:

    *   **Carga Ansiosa (Eager Loading):** Abra su navegador web o use una herramienta como `curl` para acceder:
        ```
        http://localhost:3000/eager-load
        ```
    *   **Carga Perezosa (Lazy Loading):** Abra su navegador web o use una herramienta como `curl` para acceder:
        ```
        http://localhost:3000/lazy-load
        ```
    Verá la salida JSON de los datos obtenidos por cada método.

5.  **Verifique los Logs de SQL:**
    Para ver las consultas SQL ejecutadas por la aplicación (ilustrando la diferencia entre carga perezosa y ansiosa), use:
    ```bash
    docker logs sequelize-app
    ```

6.  **Detenga y Limpie:**
    Para detener el contenedor Docker en ejecución y eliminar sus recursos:
    ```bash
    docker compose down
    ```

## Puntos Clave del Código y Documentación

*   **Lazy Loading**: El ejemplo de carga perezosa se encuentra en `src/lazy-loading-example.js`. La carga de relaciones se dispara con llamadas a métodos `get<Association>()`, como `await user.getPosts()`, que ejecutan consultas adicionales bajo demanda.
*   **Eager Loading**: El cambio a carga ansiosa se realiza en `src/eager-loading-example.js`. En lugar de llamadas a métodos `get`, se utiliza la opción `include` dentro de la consulta principal (`User.findAll`). Esto le indica a Sequelize que obtenga las relaciones deseadas en la misma consulta inicial.

### Documentación Oficial de Sequelize

*   **Lazy Loading**: [Conceptos Básicos de Asociaciones: Carga Perezosa](https://sequelize.org/docs/v6/core-concepts/assocs/#lazy-loading-example)
*   **Eager Loading**: [Conceptos Básicos de Asociaciones: Carga Ansiosa](https://sequelize.org/docs/v6/core-concepts/assocs/#eager-loading)

## Entendiendo la Carga Perezosa vs. Carga Ansiosa

*   **Carga Perezosa (Lazy Loading):** Los datos relacionados (por ejemplo, las publicaciones de un usuario) solo se obtienen de la base de datos cuando se accede a ellos explícitamente. Aunque aparentemente eficiente para accesos individuales, iterar a través de una colección de objetos principales y acceder a una colección relacionada en cada uno resultará en un "problema N+1" (N consultas para los datos relacionados + 1 consulta para los datos principales). Esto puede degradar significativamente el rendimiento.
*   **Carga Ansiosa (Eager Loading):** Los datos relacionados se obtienen junto con los datos principales, generalmente utilizando operaciones `JOIN` de SQL, en una o pocas consultas optimizadas. Esto evita el problema N+1 y es generalmente el método preferido para cargar datos relacionados cuando se sabe que se necesitarán.

La salida de la consola del servidor API (disponible a través de `docker logs sequelize-app`) ilustrará claramente la diferencia en el número y tipo de consultas a la base de datos ejecutadas para cada enfoque.

