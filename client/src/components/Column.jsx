import React from 'react';
import ArticleCard from './ArticleCard';

const Column = ({ sourceId, articles }) => {
  return (
    <div className="column">
      <h2>Source {sourceId}</h2>
      {articles.map((article, index) => (
        <ArticleCard key={index} article={article} />
      ))}
    </div>
  );
};

export default Column;