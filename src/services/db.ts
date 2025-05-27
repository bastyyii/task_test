import Database from 'better-sqlite3';
const db = new Database('./database/tasks.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL CHECK(length(titulo) <= 100),
    descripcion TEXT CHECK(length(descripcion) <= 500),
    status TEXT DEFAULT 'pendiente',
    fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fechaActualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export default db;
