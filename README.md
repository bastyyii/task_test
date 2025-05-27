# To-Do List en Tiempo Real

Proyecto simple de lista de tareas pendientes en tiempo real usando Node.js, Express, TypeScript, SQLite y WebSockets (Socket.IO).

Tecnologías utilizadas: Node.js, Express, TypeScript, SQLite, Socket.IO, HTML y JavaScript (frontend básico).

## Descripción del diseño
-Opté por la estructura MVC porque, aunque el proyecto es pequeño, esta organización facilita la 
    escalabilidad, mantenibilidad y separación de responsabilidades. Si el proyecto creciera en complejidad, esta base permitiría integraciones más avanzadas sin necesidad de una reestructuración profunda.
-Además, la validación de datos como el title y el id se realiza mediante middlewares personalizados. Esta decisión 
    se tomó para centralizar la lógica de validación, mejorar la reutilización del código y facilitar la extensión futura (por ejemplo, agregar validaciones para otros campos, autenticación, etc.).

-También se eligió usar TypeScript en lugar de JavaScript por varias razones:
    Tipado estático: ayuda a detectar errores en tiempo de desarrollo, mejorando la fiabilidad del código.
    Mejor experiencia de desarrollo: con autocompletado, refactorización segura y documentación en el IDE.
    Escalabilidad: el uso de interfaces y tipos facilita el crecimiento del proyecto con mayor confianza y menos errores.


## Instalación

Clona el repositorio y navega al directorio del proyecto:

```bash
git clone <URL_DEL_REPOSITORIO>
cd <nombre-del-proyecto>
```

Instala las dependencias:

```bash
npm install
```

Ejecuta el servidor en modo desarrollo:

```bash
npm run dev
```

La aplicación correrá en: http://localhost:3000

## Endpoints de la API

GET `/tasks`: Obtener todas las tareas  
POST `/tasks`: Crear una nueva tarea  
Body (JSON):  
```json
{ "title": "string", "description": "string" }
```

PUT `/tasks/:id`: Cambiar el estado de una tarea  
Body (JSON):  
```json
{ "status": "pending" | "completed" }
```

DELETE `/tasks/:id`: Eliminar una tarea

## Cómo probar la aplicación

Desde Postman o Thunder Client(Para una mejor visualización de errores del backend, ya que el frontend tambien incluye comprobaciones):

GET `http://localhost:3000/tasks` → lista de tareas  
POST `http://localhost:3000/tasks` con body JSON:  
```json
{ "title": "Mi tarea nueva", "description": "Descripción opcional" }
```

PUT `http://localhost:3000/tasks/1` con body JSON:  
```json
{ "status": "completed" }
```

DELETE `http://localhost:3000/tasks/1` para eliminar una tarea

Desde el frontend:

1. Abre el navegador en `http://localhost:3000`
2. Llena el formulario con título y descripción
3. Haz clic en “Agregar”
4. La lista se actualizará automáticamente
5. Puedes cambiar el estado o eliminar tareas con los botones correspondientes

Todo esto ocurre en tiempo real gracias a WebSockets.

## WebSockets

Eventos que el servidor emite a todos los clientes conectados:
- `newTask`: cuando se crea una nueva tarea
- `taskUpdated`: cuando se actualiza el estado de una tarea
- `taskDeleted`: cuando se elimina una tarea
- `tasksUpdated`: envía la lista completa actualizada

## Para ejecutar test
npm test

## .gitignore

Incluye este archivo para evitar subir archivos innecesarios al repositorio:

```
node_modules/
dist/
logs/
*.log
npm-debug.log*
.env
*.sqlite
*.sqlite3
```

## Autor

Bastián Valdivia
Linkedin: https://www.linkedin.com/in/bastian-valdivia-b61b75236/
correo: bastivaldi15@gmail.com

