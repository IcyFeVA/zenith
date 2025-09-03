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

  // Insert sample sources if none exist
  db.get("SELECT COUNT(*) as count FROM sources", (err, row) => {
    if (row.count === 0) {
      const sampleSources = [
        { name: 'CNN', url: 'http://rss.cnn.com/rss/edition.rss' },
        { name: 'BBC News', url: 'http://feeds.bbci.co.uk/news/rss.xml' },
        { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
        { name: 'Wired', url: 'https://www.wired.com/feed/rss' }
      ];
      sampleSources.forEach((source, index) => {
        db.run('INSERT INTO sources (name, url) VALUES (?, ?)', [source.name, source.url], function() {
          // Insert a dummy article for each source
          const sourceId = this.lastID;
          db.run('INSERT OR IGNORE INTO articles (source_id, title, link, published_date) VALUES (?, ?, ?, ?)',
            [sourceId, `Sample Article from ${source.name}`, `https://example.com/${index}`, new Date().toISOString()]);
        });
      });
    }
  });
});

module.exports = db;