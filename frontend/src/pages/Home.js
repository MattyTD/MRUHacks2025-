import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DemoMindMap from '../components/DemoMindMap';
import './Home.css';

const Home = () => {
  const [currentLayer, setCurrentLayer] = useState('personal');
  const [isDemoVisible, setIsDemoVisible] = useState(false);

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
      <div className="home-hero">
        <img src={"../assets/SquadGoalsBeta.png"}alt={""}width={100}height={100}/>
        <h1>Squad Goals</h1>
        <p>Collaborative mind mapping for your squad - connect ideas, memories, and interests</p>
        <div className="home-hero-buttons">
          <Link to="/register" className="btn btn-primary">
            Get Started
          </Link>
          <Link to="/login" className="btn btn-secondary">
            Login
          </Link>
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

        {/* Demo Controls */}
        <div className="demo-controls">
          <button 
            onClick={() => setCurrentLayer('personal')}
            className={currentLayer === 'personal' ? 'active' : ''}
          >
            Personal Layer
          </button>
          <button 
            onClick={() => setCurrentLayer('group')}
            className={currentLayer === 'group' ? 'active' : ''}
          >
            Group Layer
          </button>
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
