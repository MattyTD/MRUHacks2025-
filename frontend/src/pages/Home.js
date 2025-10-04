import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container">
      <div style={{ 
        textAlign: 'center', 
        padding: '4rem 0',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '10px',
        margin: '2rem 0'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          Welcome to MRUHacks2025
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
          A modern MERN stack application built for the hackathon
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/register" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '12px 24px' }}>
            Get Started
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ fontSize: '1.1rem', padding: '12px 24px' }}>
            Login
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
        <div className="card">
          <h3>🚀 Modern Stack</h3>
          <p>Built with React, Node.js, Express, and MongoDB for a full-stack experience.</p>
        </div>
        
        <div className="card">
          <h3>🔐 Secure Authentication</h3>
          <p>JWT-based authentication with password hashing and protected routes.</p>
        </div>
        
        <div className="card">
          <h3>📱 Responsive Design</h3>
          <p>Mobile-first design that works perfectly on all devices and screen sizes.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
