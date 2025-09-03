import React from 'react';

const Header = ({ onToggleReadLater, onToggleManageSources }) => {
  return (
    <header className="header">
      <h1>Zenith News Dashboard</h1>
      <p>AI, Tech, Gadgets & Open-Source News</p>
      <div className="header-buttons">
        <button onClick={onToggleManageSources}>Manage Sources</button>
        <button onClick={onToggleReadLater}>Read Later</button>
      </div>
    </header>
  );
};

export default Header;