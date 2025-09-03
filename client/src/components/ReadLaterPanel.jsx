import React from 'react';

const ReadLaterPanel = ({ articles, onMarkRead, onClearRead, onClose }) => {
  return (
    <div className="read-later-panel">
      <div className="panel-content">
        <h2>Read Later</h2>
        <button onClick={onClose} className="close-btn">Close</button>
        <button onClick={onClearRead} className="clear-btn">Clear All Read</button>
        <div className="saved-articles">
          {articles.map(article => (
            <div key={article.id} className={`saved-article ${article.is_read ? 'read' : ''}`}>
              <h3>
                <a href={article.link} target="_blank" rel="noopener noreferrer">
                  {article.title}
                </a>
              </h3>
              <p>{new Date(article.published_date).toLocaleDateString()}</p>
              {!article.is_read && (
                <button onClick={() => onMarkRead(article.id)}>Mark as Read</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReadLaterPanel;