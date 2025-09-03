import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Column from './components/Column';
import ReadLaterPanel from './components/ReadLaterPanel';
import SourceManager from './components/SourceManager';

function App() {
  const [sources, setSources] = useState([]);
  const [articlesBySource, setArticlesBySource] = useState({});
  const [savedArticles, setSavedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReadLater, setShowReadLater] = useState(false);
  const [showManageSources, setShowManageSources] = useState(false);

  const fetchData = () => {
    Promise.all([
      fetch('/api/sources').then(res => res.json()),
      fetch('/api/articles').then(res => res.json()),
      fetch('/api/articles/saved').then(res => res.json())
    ]).then(([sourcesData, articlesData, savedData]) => {
      setSources(sourcesData);
      setArticlesBySource(articlesData);
      setSavedArticles(savedData);
      setLoading(false);
    }).catch(error => {
      console.error('Error fetching data:', error);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleSave = async (articleId) => {
    try {
      const response = await fetch(`/api/articles/${articleId}/toggle-save`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const markRead = async (articleId) => {
    try {
      await fetch(`/api/articles/${articleId}/mark-read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      fetchData();
    } catch (error) {
      console.error('Error marking read:', error);
    }
  };

  const clearRead = async () => {
    try {
      await fetch('/api/articles/clear-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      fetchData();
    } catch (error) {
      console.error('Error clearing read:', error);
    }
  };

  const addSource = async (name, url) => {
    try {
      await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, url })
      });
      fetchData();
      setShowManageSources(false);
    } catch (error) {
      console.error('Error adding source:', error);
    }
  };

  const deleteSource = async (sourceId) => {
    try {
      await fetch(`/api/sources/${sourceId}`, {
        method: 'DELETE'
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting source:', error);
    }
  };

  if (loading) {
    return <div className="App">Loading...</div>;
  }

  return (
    <div className="App">
      <Header
        onToggleReadLater={() => setShowReadLater(!showReadLater)}
        onToggleManageSources={() => setShowManageSources(!showManageSources)}
      />
      {showManageSources && (
        <SourceManager
          sources={sources}
          onAddSource={addSource}
          onDeleteSource={deleteSource}
          onClose={() => setShowManageSources(false)}
        />
      )}
      <div className="columns-container">
        {sources.map(source => (
          <Column
            key={source.id}
            source={source}
            articles={articlesBySource[source.id] || []}
            onToggleSave={toggleSave}
            onDeleteSource={deleteSource}
          />
        ))}
      </div>
      {showReadLater && (
        <ReadLaterPanel
          articles={savedArticles}
          onMarkRead={markRead}
          onClearRead={clearRead}
          onClose={() => setShowReadLater(false)}
        />
      )}
    </div>
  );
}

export default App;