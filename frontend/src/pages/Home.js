import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DemoMindMap from '../components/DemoMindMap';
import './Home.css';

const Home = () => {
  const [currentLayer, setCurrentLayer] = useState('group');
  const [isDemoVisible, setIsDemoVisible] = useState(false);
  const [heroAnimationComplete, setHeroAnimationComplete] = useState(false);

  // Trigger hero animation completion after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setHeroAnimationComplete(true);
    }, 2000); // Animation completes after 2 seconds
    
    return () => clearTimeout(timer);
  }, []);

  // Handle scroll to show demo
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Show demo when user scrolls down 60% of viewport height
      if (scrollPosition > windowHeight * 0.6) {
        setIsDemoVisible(true);
      } else {
        setIsDemoVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLayerChange = useCallback((newLayer) => {
    setCurrentLayer(newLayer);
  }, []);

  return (
    <div className="container">
      {/* Animated Hero Section */}
      <div className="animated-hero">
        {/* Animated nodes that slide across */}
        <div className="node-container">
          <div className="animated-node node-1" style={{ backgroundColor: '#FF6B6B' }}></div>
          <div className="animated-node node-2" style={{ backgroundColor: '#4ECDC4' }}></div>
          <div className="animated-node node-3" style={{ backgroundColor: '#95E1D3' }}></div>
          <div className="animated-node node-4" style={{ backgroundColor: '#F38181' }}></div>
          <div className="animated-node node-5" style={{ backgroundColor: '#AA96DA' }}></div>
          <div className="animated-node node-6" style={{ backgroundColor: '#FCBAD3' }}></div>
          <div className="animated-node node-7" style={{ backgroundColor: '#A8D8EA' }}></div>
          <div className="animated-node node-8" style={{ backgroundColor: '#FFD93D' }}></div>
        </div>

        {/* Logo text that appears after animation */}
        <div className={`hero-logo ${heroAnimationComplete ? 'visible' : ''}`}>
          <h1 className="logo-main">SG</h1>
          <h2 className="logo-subtitle">SQUAD GOALS</h2>
        </div>

        {/* Content that fades in after animation */}
        <div className={`hero-content ${heroAnimationComplete ? 'visible' : ''}`}>
          <p className="hero-tagline">Collaborative mind mapping for your squad</p>
          <div className="home-hero-buttons">
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Login
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className={`scroll-indicator ${heroAnimationComplete ? 'visible' : ''}`}>
          <span>Scroll to explore</span>
          <div className="scroll-arrow">↓</div>
        </div>
      </div>

      <div className="feature-grid">
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

      {/* Interactive Demo Section */}
      <div className={`demo-section ${isDemoVisible ? 'visible' : ''}`}>
        <div className="demo-header">
          <h2>See It In Action</h2>
          <p>
            Experience how Squad Goals works with this interactive demo. 
            Scroll to zoom between personal and group layers, and see how tags create meaningful connections.
          </p>
        </div>

        {/* Layer Indicator (display only) */}
        <div className="demo-layer-badges">
          <div className={`layer-badge ${currentLayer === 'personal' ? 'active' : ''}`}>
            <span className="badge-icon">👤</span>
            <span className="badge-text">Personal Layer</span>
          </div>
          <div className={`layer-badge ${currentLayer === 'group' ? 'active' : ''}`}>
            <span className="badge-icon">👥</span>
            <span className="badge-text">Group Layer</span>
          </div>
        </div>

        {/* Demo Description */}
        <div className="demo-description">
          <p>
            {currentLayer === 'personal' 
              ? '👆 This is your personal mind map! Each node represents a hobby, interest, or memory. Notice how nodes with similar tags (like "creative" or "technology") are connected. Try scrolling to zoom out and see how your personal map connects to others.'
              : '👆 This is the group view! Each large node represents a squad member\'s personal mind map. The connections show shared interests and tags between squad members. Scroll to zoom in and explore individual personal maps.'
            }
          </p>
        </div>

        {/* Demo Mind Map */}
        <div className="demo-map-container">
          <DemoMindMap 
            isPersonalLayer={currentLayer === 'personal'}
            onLayerChange={handleLayerChange}
          />
        </div>

        {/* Call to Action */}
        <div className="demo-cta">
          <h3>Ready to Build Your Squad's Mind Map?</h3>
          <p>Join your friends and start creating connections that matter.</p>
          <div className="demo-cta-buttons">
            <Link to="/register" className="btn btn-primary">
              Start Your Squad
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Join Existing Squad
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
