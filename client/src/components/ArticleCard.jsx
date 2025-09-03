import React from 'react';

const ArticleCard = ({ article }) => {
  return (
    <div className="article-card">
      <h3>{article.title}</h3>
      <p>{article.link}</p>
      {article.imageUrl && <img src={article.imageUrl} alt={article.title} />}
    </div>
  );
};

export default ArticleCard;