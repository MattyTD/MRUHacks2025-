import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Squadpng from '../assets/SquadGoalsBeta.png';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <img src={Squadpng} alt="Squad Goals" className="navbar-logo" />
        <span className="navbar-title">Squad Goals</span>
      </Link>
      
      <div className="navbar-links">
        {user ? (
          <>
            <Link to="/owner" className="navbar-link navbar-username">
              {user.name}
            </Link>
            <Link to="/dashboard" className="navbar-link">
              Dashboard
            </Link>
            <button onClick={handleLogout} className="navbar-button">
              Logout
            </button>
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
