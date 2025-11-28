# Laravel Eloquent POC: Lazy vs. Eager Loading

Este proyecto es una Prueba de Concepto (POC) de una aplicación Laravel diseñada para demostrar y comparar el comportamiento de la carga perezosa (Lazy Loading) y la carga ansiosa (Eager Loading) de relaciones en Eloquent, destacando el problema de "N+1 queries" y cómo mitigarlo.

## Contenido de la POC

*   **Modelos:** `User`, `Post`, `Comment`, `Tag` con sus relaciones bien definidas.
*   **Migraciones y Seeders:** Para configurar la base de datos y poblarla con datos de ejemplo interconectados.
*   **Rutas de Demostración:**
    *   `/test-orm` (Carga Ansiosa): Muestra cómo cargar relaciones de manera eficiente.
    *   `/lazy-orm` (Carga Perezosa): Demuestra el problema de "N+1 queries".
*   **Logging de Consultas:** Configurado para mostrar todas las consultas SQL ejecutadas directamente en los logs de Docker, con marcadores claros para cada demostración.
*   **Tests de Funcionalidad:** Para verificar que las rutas funcionan y devuelven la estructura de datos esperada.

## Puntos Clave del Código y Documentación

Toda la lógica de carga de datos se encuentra en el fichero `routes/web.php`.

*   **Lazy Loading**: La ruta `/lazy-orm` demuestra la carga perezosa. Primero obtiene todos los usuarios (`App\Models\User::all()`) y luego, dentro de un bucle, accede a las relaciones de cada usuario (ej: `$user->posts`). Cada uno de estos accesos dispara una nueva consulta a la base de datos, causando el problema N+1.
*   **Eager Loading**: La ruta `/test-orm` demuestra la carga ansiosa. La transición a este modo se logra utilizando el método `with()` antes de ejecutar la consulta (`App\Models\User::with([...])->get()`). Esto le indica a Eloquent que cargue todas las relaciones especificadas en un número mínimo y optimizado de consultas.

### Documentación Oficial de Eloquent

Para una explicación más profunda sobre cómo Eloquent maneja la carga de relaciones, consulta la documentación oficial. El concepto de "Lazy Loading" es el comportamiento por defecto, mientras que "Eager Loading" es la solución explícita al problema de N+1.

*   **Eager Loading en Laravel Eloquent**: [Documentación de Eager Loading](https://laravel.com/docs/eloquent-relationships#eager-loading)

## Configuración del Entorno

Asegúrate de tener Docker y Docker Compose instalados en tu sistema.

**¡Configuración Simplificada!**

Hemos configurado un `entrypoint.sh` en el contenedor `app` que automatiza todos los pasos de configuración inicial, incluyendo:
*   Creación del archivo `.env` a partir de `.env.example` (si no existe).
*   Instalación de dependencias de Composer.
*   Generación de la clave de aplicación de Laravel.
*   Ejecución de las migraciones de la base de datos.
*   Establecimiento de permisos correctos para los directorios de Laravel.

Por lo tanto, solo necesitas ejecutar un comando para levantar el entorno completo:

1.  **Iniciar Contenedores Docker:**
    Este comando construirá las imágenes (si es necesario) y levantará los servicios (`app` y `web`) en segundo plano.
    ```bash
    docker compose up -d --build
    ```
    Una vez que los contenedores estén levantados, el servicio `app` ejecutará automáticamente el `entrypoint.sh` para configurar la aplicación.

---

## Demostración: Lazy Loading vs. Eager Loading

El objetivo principal de esta POC es observar la diferencia en el número y la naturaleza de las consultas SQL que se disparan en la base de datos al usar carga perezosa y carga ansiosa.

### Cómo funcionan los logs de consultas:

Hemos configurado `app/Providers/AppServiceProvider.php` para interceptar todas las consultas SQL de Eloquent y enviarlas a `stderr`. Esto significa que puedes ver todas las consultas directamente en los logs de tu contenedor Docker.

Para monitorear los logs en tiempo real, abre una terminal separada y ejecuta:

```bash
docker logs -f vb_orm_poc_app
```

Deja esta terminal abierta para observar las consultas a medida que realizas los siguientes pasos.

### 1. Carga Ansiosa (Eager Loading) - Eficiente

**Dónde se configura:** La carga ansiosa se implementa en la ruta `/test-orm` (definida en `routes/web.php`) utilizando el método `with()` de Eloquent:

```php
// routes/web.php
Route::get('/test-orm', function () {
    // Carga ansiosa de usuarios con sus posts, y los comentarios y tags de cada post.
    $users = App\Models\User::with(['posts.comments', 'posts.tags'])->get();
    return response()->json($users);
});
```

**Pasos de Demostración:**

1.  Asegúrate de que estás monitoreando los logs de Docker (ver arriba).
2.  Abre tu navegador y visita: `http://localhost:8080/test-orm`
3.  **Observa los logs en la terminal:**
    Verás un marcador `--- Starting EAGER Loading for /test-orm ---`, seguido de un pequeño número de consultas SQL (típicamente 4-5):
    *   Una consulta para obtener todos los usuarios.
    *   Una consulta para obtener todos los posts relacionados con esos usuarios.
    *   Una consulta para obtener todos los comentarios relacionados con esos posts.
    *   Una consulta para obtener todos los tags relacionados con esos posts (a través de la tabla pivote).
    *   Finalmente, un marcador `--- Finished EAGER Loading for /test-orm ---

    Esto demuestra cómo la carga ansiosa resuelve el "N+1 problem" ejecutando un número fijo y mínimo de consultas.

### 2. Carga Perezosa (Lazy Loading) - Problema N+1

**Dónde se configura:** La carga perezosa se implementa en la ruta `/lazy-orm` (definida en `routes/web.php`) accediendo a las relaciones dentro de bucles, sin usar `with()`:

```php
// routes/web.php
Route::get('/lazy-orm', function () {
    $users = App\Models\User::all(); // Carga todos los usuarios (1 consulta)
    // ... luego itera sobre cada usuario y cada post para acceder a sus relaciones.
    // Cada acceso a $user->posts, $post->comments, $post->tags disparará una nueva consulta.
    return response()->json($data); // La respuesta JSON es la misma que /test-orm
});
```

**Pasos de Demostración:**

1.  Asegúrate de que estás monitoreando los logs de Docker (ver arriba).
2.  Abre tu navegador y visita: `http://localhost:8080/lazy-orm`
3.  **Observa los logs en la terminal:**
    Verás un marcador `--- Starting LAZY Loading for /lazy-orm ---`, seguido de un **gran número** de mensajes que detallan cada paso y consulta:
    *   Un mensaje para "Fetching all users..." y la consulta `SELECT * from "users"`.
    *   Para cada usuario:
        *   Un mensaje indicando el procesamiento del usuario.
        *   Un mensaje "Fetching posts for User ID: X (LAZY LOAD)" y **una consulta SQL para los posts de *ese* usuario.**
        *   Para cada post de ese usuario:
            *   Un mensaje indicando el procesamiento del post.
            *   Un mensaje "Fetching comments for Post ID: Y (LAZY LOAD)" y **una consulta SQL para los comentarios de *ese* post.**
            *   Un mensaje "Fetching tags for Post ID: Y (LAZY LOAD)" y **una consulta SQL para los tags de *ese* post.**
    *   Finalmente, un marcador `--- Finished LAZY Loading for /lazy-orm ---

    La cantidad de consultas será significativamente mayor que en el caso de carga ansiosa, demostrando el problema de "N+1 queries" donde N puede ser el número de usuarios, posts o comentarios.

---

## Limpieza

Para detener y eliminar los contenedores Docker, ejecuta:

```bash
docker compose down
```
