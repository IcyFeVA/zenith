import React, { useState } from 'react';

const SourceManager = ({ sources, onAddSource, onDeleteSource, onClose }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && url) {
      onAddSource(name, url);
      setName('');
      setUrl('');
    }
  };

  return (
    <div className="source-manager">
      <div className="source-manager-content">
        <h2>Manage Sources</h2>
        <button onClick={onClose} className="close-btn">Close</button>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Source Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="url"
            placeholder="RSS URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <button type="submit">Add Source</button>
        </form>
        <ul>
          {sources.map(source => (
            <li key={source.id}>
              {source.name} - {source.url}
              <button onClick={() => onDeleteSource(source.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SourceManager;