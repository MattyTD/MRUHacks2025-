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
          Squad Goals
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
          Collaborative mind mapping for your squad - connect ideas, memories, and interests
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
          <h3>🧠 Personal Mind Maps</h3>
          <p>Create nodes for hobbies, interests, and memories. Connect them with tags to build your personal knowledge network.</p>
        </div>
        
        <div className="card">
          <h3>👥 Collaborative Layers</h3>
          <p>Zoom out to see how your personal map connects with your squad's maps through shared interests and tags.</p>
        </div>
        
        <div className="card">
          <h3>🏷️ Tag-Based Connections</h3>
          <p>Automatic connections based on shared tags create meaningful relationships between ideas and people.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
