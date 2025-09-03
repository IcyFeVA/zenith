import React from 'react';

const ArticleCard = ({ article, onToggleSave }) => {
  return (
    <div className="article-card">
      {article.imageUrl && <img src={article.imageUrl} alt={article.title} />}
      <h3>
        <a href={article.link} target="_blank" rel="noopener noreferrer">
          {article.title}
        </a>
      </h3>
      <p>{new Date(article.published_date).toLocaleDateString()}</p>
      <button onClick={() => onToggleSave(article.id)} className="save-btn">
        {article.is_saved ? 'Unsave' : 'Save'}
      </button>
    </div>
  );
};

export default ArticleCard;