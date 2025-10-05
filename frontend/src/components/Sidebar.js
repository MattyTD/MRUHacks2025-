import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Squadpng from '../assets/SquadGoalsBeta.png';
import './Sidebar.css';

const Sidebar = ({ onCreateBoard, onSearch }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarWidth, setSidebarWidth] = useState(80);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  const startResizing = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const stopResizing = () => {
    setIsResizing(false);
  };

  const resize = (e) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth >= 60 && newWidth <= 400) {
        setSidebarWidth(newWidth);
        // Dispatch custom event for Owner component to update margin
        window.dispatchEvent(new CustomEvent('sidebarResize', { detail: newWidth }));
      }
    }
  };

  useEffect(() => {
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResizing);

    return () => {
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing]);

  return (
    <div className="sidebar" ref={sidebarRef} style={{ width: `${sidebarWidth}px` }}>
      <div className="sidebar-logo" onClick={() => navigate('/')} title="Go to Home">
        <img src={Squadpng} alt="Squad Goals Logo" className="sidebar-logo-image" />
      </div>
      
      <div className="sidebar-actions">
        <button 
          className="sidebar-button create-button" 
          onClick={onCreateBoard}
          title="Create New Board"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        
        <div className="sidebar-search">
          <svg 
            className="search-icon"
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="sidebar-search-input"
          />
        </div>
      </div>
      
      <div className="sidebar-bottom">
        <button className="sidebar-button icon-button" title="Account">
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </button>
        
        <button className="sidebar-button icon-button" title="Settings">
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 1v6m0 6v6m-9-9h6m6 0h6"></path>
            <path d="m4.93 4.93 4.24 4.24m5.66 0 4.24-4.24m0 14.14-4.24-4.24m-5.66 0-4.24 4.24"></path>
          </svg>
        </button>
      </div>
      
      <div 
        className="sidebar-resize-handle" 
        onMouseDown={startResizing}
      />
    </div>
  );
};

export default Sidebar;

