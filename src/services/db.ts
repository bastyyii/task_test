import Database from 'better-sqlite3';
const db = new Database('./database/tasks.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL CHECK(length(title) <= 100),
    description TEXT CHECK(length(description) <= 500),
    status TEXT DEFAULT 'pending',
    creationDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    updateDate DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export default db;
