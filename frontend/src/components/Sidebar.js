import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Squadpng from '../assets/SquadGoalsBeta.png';
import './Sidebar.css';

const Sidebar = ({ onCreateBoard, onSearch }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarWidth, setSidebarWidth] = useState(80);
  const [isResizing, setIsResizing] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const sidebarRef = useRef(null);
  const profileDropdownRef = useRef(null);

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

  // Handle click outside for profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="sidebar" ref={sidebarRef} style={{ width: `${sidebarWidth}px` }}>
      <div className="sidebar-logo" onClick={() => navigate('/')} title="Go to Home">
        <img src={Squadpng} alt="Squad Goals Logo" className="sidebar-logo-image" />
      </div>
      
      <div className="sidebar-actions">
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
        
        <button 
          className="sidebar-button personal-mindmap-button" 
          onClick={() => navigate('/personal-mindmaps')}
          title="Personal Mind Maps"
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
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1 .34-4.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path>
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0-.34-4.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"></path>
          </svg>
        </button>
      </div>
      
      <div className="sidebar-bottom">
        <div className="sidebar-profile-menu" ref={profileDropdownRef}>
          <button 
            className="sidebar-button icon-button" 
            title="Account"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          >
            {user?.profileImage ? (
              <img 
                src={`http://localhost:5001${user.profileImage}`} 
                alt="Profile" 
                className="sidebar-profile-image"
              />
            ) : (
              <div className="sidebar-profile-placeholder">
                <span>{user?.name?.charAt(0)?.toUpperCase()}</span>
              </div>
            )}
          </button>
          
          {showProfileDropdown && (
            <div className="sidebar-dropdown">
              <div className="sidebar-dropdown-header">
                <span className="sidebar-dropdown-name">{user?.name}</span>
              </div>
              <button 
                className="sidebar-dropdown-item"
                onClick={() => {
                  setShowProfileDropdown(false);
                  navigate('/dashboard');
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                Dashboard
              </button>
              <button 
                className="sidebar-dropdown-item sidebar-dropdown-logout"
                onClick={() => {
                  setShowProfileDropdown(false);
                  handleLogout();
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16,17 21,12 16,7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
        
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

