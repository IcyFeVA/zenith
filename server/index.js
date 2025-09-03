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
    const sources = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM sources', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const articlesBySource = {};

    for (const source of sources) {
      try {
        const feed = await parser.parseURL(source.url);
        articlesBySource[source.id] = feed.items.map(item => ({
          title: item.title,
          link: item.link,
          imageUrl: item.enclosure ? item.enclosure.url : '',
          published_date: item.pubDate
        }));
      } catch (error) {
        console.error(`Error fetching from ${source.url}:`, error.message);
        articlesBySource[source.id] = [];
      }
    }

    res.json(articlesBySource);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});