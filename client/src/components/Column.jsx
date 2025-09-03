import React from 'react';
import ArticleCard from './ArticleCard';

const Column = ({ source, articles, onToggleSave, onDeleteSource }) => {
  return (
    <div className="column">
      <div className="column-header">
        <h2>{source.name}</h2>
        <button onClick={() => onDeleteSource(source.id)} className="delete-btn">Delete</button>
      </div>
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} onToggleSave={onToggleSave} />
      ))}
    </div>
  );
};

export default Column;