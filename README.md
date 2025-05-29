# Real-Time To-Do List

A simple real-time to-do list project built with Node.js, Express, TypeScript, SQLite, and WebSockets (Socket.IO).

**Tech Stack:** Node.js, Express, TypeScript, SQLite, Socket.IO, HTML, and basic JavaScript (frontend).

## Design Overview

- This project uses the **MVC (Model-View-Controller)** architecture. While the project is relatively small, this structure promotes scalability, maintainability, and a clear separation of concerns. If the application grows in complexity, this architecture allows for smoother integration of advanced features without requiring a major refactor.
  
- **Custom middleware** is used to validate data such as `title` and `id`. This centralizes validation logic, improves code reusability, and makes it easier to extend the validation (e.g., adding checks for other fields or authentication).

- **TypeScript** was chosen over JavaScript for several reasons:
  - **Static typing** helps catch errors during development, improving code reliability.
  - **Enhanced developer experience** with autocomplete, safe refactoring, and inline documentation in IDEs.
  - **Scalability**: Interfaces and types make it easier to grow the codebase with confidence and fewer bugs.

## Installation

Clone the repository and navigate to the project directory:

```bash
git clone <REPOSITORY_URL>
cd <project-name>
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

The app will be running at: [http://localhost:3000](http://localhost:3000)

## API Endpoints

- `GET /tasks`: Retrieve all tasks  
- `POST /tasks`: Create a new task  
  **Body (JSON):**
  ```json
  { "title": "string", "description": "string" }
  ```

- `PUT /tasks/:id`: Update task status  
  **Body (JSON):**
  ```json
  { "status": "pending" | "completed" }
  ```

- `DELETE /tasks/:id`: Delete a task

## How to Test the Application

### Using Postman or Thunder Client  
(Recommended for better backend error handling and debugging. The frontend also includes basic validations.)

- `GET http://localhost:3000/tasks` → list all tasks  
- `POST http://localhost:3000/tasks` with JSON body:
  ```json
  { "title": "My new task", "description": "Optional description" }
  ```

- `PUT http://localhost:3000/tasks/1` with JSON body:
  ```json
  { "status": "completed" }
  ```

- `DELETE http://localhost:3000/tasks/1` to delete a task

### Using the FRONTEND

1. Open your browser at `http://localhost:3000`
2. Fill in the form with a title and optional description
3. Click "Add"
4. The list will update automatically
5. You can toggle the status or delete tasks using the corresponding buttons

All of this happens in real time thanks to WebSockets.

## WebSockets

Events emitted by the server to all connected clients:

- `newTask`: when a new task is created
- `taskUpdated`: when a task's status is updated
- `taskDeleted`: when a task is deleted
- `tasksUpdated`: sends the full updated task list

## Running Tests

```bash
npm test
```

## .gitignore

Make sure to include a `.gitignore` file to avoid pushing unnecessary files to the repository:

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

## Author

**Bastián Valdivia**  
[LinkedIn](https://www.linkedin.com/in/bastian-valdivia-b61b75236/)  
Email: bastivaldi15@gmail.com