const express = require('express');
const cors = require('cors');
const db = require('./database');
const Parser = require('rss-parser');

const app = express();
const parser = new Parser();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// GET /api/sources
app.get('/api/sources', (req, res) => {
  db.all('SELECT * FROM sources', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST /api/sources
app.post('/api/sources', (req, res) => {
  const { name, url } = req.body;
  if (!name || !url) {
    return res.status(400).json({ error: 'Name and URL are required' });
  }
  db.run('INSERT INTO sources (name, url) VALUES (?, ?)', [name, url], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID });
  });
});

// DELETE /api/sources/:id
app.delete('/api/sources/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM sources WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ deleted: this.changes });
  });
});

// GET /api/articles
app.get('/api/articles', async (req, res) => {
  try {
    // First, fetch and save new articles from RSS
    const sources = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM sources', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    for (const source of sources) {
      try {
        const feed = await parser.parseURL(source.url);
        for (const item of feed.items.slice(0, 10)) { // Limit to 10 per source
          const existing = await new Promise((resolve) => {
            db.get('SELECT id FROM articles WHERE link = ?', [item.link], (err, row) => {
              resolve(row);
            });
          });

          if (!existing) {
            // Insert new article
            db.run('INSERT INTO articles (source_id, title, link, imageUrl, published_date) VALUES (?, ?, ?, ?, ?)',
              [source.id, item.title, item.link, item.enclosure ? item.enclosure.url : '', item.pubDate]);
          }
        }
      } catch (error) {
        console.error(`Error fetching from ${source.url}:`, error.message);
      }
    }

    // Then, return all articles from DB, grouped by source
    const articles = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM articles ORDER BY published_date DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const articlesBySource = {};
    articles.forEach(article => {
      if (!articlesBySource[article.source_id]) {
        articlesBySource[article.source_id] = [];
      }
      articlesBySource[article.source_id].push(article);
    });

    res.json(articlesBySource);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/articles/saved
app.get('/api/articles/saved', (req, res) => {
  db.all('SELECT * FROM articles WHERE is_saved = 1 ORDER BY published_date DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// PUT /api/articles/:id/toggle-save
app.put('/api/articles/:id/toggle-save', (req, res) => {
  const { id } = req.params;
  db.get('SELECT is_saved FROM articles WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Article not found' });
    }
    const newSaved = row.is_saved ? 0 : 1;
    db.run('UPDATE articles SET is_saved = ? WHERE id = ?', [newSaved, id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id, is_saved: newSaved });
    });
  });
});

// PUT /api/articles/:id/mark-read
app.put('/api/articles/:id/mark-read', (req, res) => {
  const { id } = req.params;
  db.run('UPDATE articles SET is_read = 1 WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id, is_read: 1 });
  });
});

// POST /api/articles/clear-read
app.post('/api/articles/clear-read', (req, res) => {
  db.run('UPDATE articles SET is_read = 0 WHERE is_saved = 1 AND is_read = 1', function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ cleared: this.changes });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});