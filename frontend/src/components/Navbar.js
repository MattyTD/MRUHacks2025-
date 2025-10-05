import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Squadpng from '../assets/SquadGoalsBeta.png';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <img src={Squadpng} alt="Squad Goals" className="navbar-logo" />
        <span className="navbar-title">Squad Goals</span>
      </Link>
      
      <div className="navbar-links">
        {user ? (
          <>
            <Link to="/owner" className="navbar-link navbar-board-hub" title="Board Hub">
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
                <path d="M3 3h18v18H3zM9 9h6v6H9z"></path>
                <path d="M9 3v18M15 3v18M3 9h18M3 15h18"></path>
              </svg>
            </Link>
            <div className="navbar-user-menu" ref={dropdownRef}>
            <button 
              className="navbar-user-button"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {user.profileImage ? (
                <img 
                  src={`http://localhost:5001${user.profileImage}`} 
                  alt="Profile" 
                  className="navbar-profile-image"
                />
              ) : (
                <div className="navbar-profile-placeholder">
                  <span>{user.name?.charAt(0)?.toUpperCase()}</span>
                </div>
              )}
            </button>
            
            {showDropdown && (
              <div className="navbar-dropdown">
                <div className="navbar-dropdown-header">
                  <span className="navbar-dropdown-name">{user.name}</span>
                </div>
                <Link 
                  to="/dashboard" 
                  className="navbar-dropdown-item"
                  onClick={() => setShowDropdown(false)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                  Dashboard
                </Link>
                <button 
                  className="navbar-dropdown-item navbar-dropdown-logout"
                  onClick={() => {
                    setShowDropdown(false);
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
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-link">
              Login
            </Link>
            <Link to="/register" className="navbar-link navbar-link-register">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
