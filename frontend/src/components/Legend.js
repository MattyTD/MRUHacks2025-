import React from 'react';
import { getTagColorPairs } from '../utils/tagColors';
import './Legend.css';

const Legend = ({ tags, title = "Connection Tags" }) => {
  const tagColorPairs = getTagColorPairs(tags);

  if (tagColorPairs.length === 0) {
    return null;
  }

  return (
    <div className="legend-container">
      <h4 className="legend-title">{title}</h4>
      <div className="legend-items">
        {tagColorPairs.map(({ tag, color }) => (
          <div key={tag} className="legend-item">
            <div 
              className="legend-color"
              style={{ backgroundColor: color }}
            />
            <span className="legend-label">{tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Legend;

