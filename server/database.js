const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id INTEGER,
    title TEXT NOT NULL,
    link TEXT NOT NULL UNIQUE,
    imageUrl TEXT,
    published_date TEXT,
    is_saved INTEGER DEFAULT 0,
    is_read INTEGER DEFAULT 0,
    FOREIGN KEY (source_id) REFERENCES sources(id)
  )`);
});

module.exports = db;