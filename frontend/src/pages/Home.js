import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DemoMindMap from '../components/DemoMindMap';
import { useAuth } from '../contexts/AuthContext';
import './Home.css';
import Squadpng from '../assets/SquadGoalsBeta.png';

const Home = () => {
  const { user } = useAuth();
  const [currentLayer, setCurrentLayer] = useState('group');
  const [isDemoVisible, setIsDemoVisible] = useState(false);
  const [heroAnimationComplete, setHeroAnimationComplete] = useState(false);

  // Generate 100 herd nodes
  const herdNodes = React.useMemo(() => {
    const colors = ['#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#A8D8EA', '#FFD93D', '#FF6B9D', '#C44569', '#F8B500', '#6C5CE7', '#FD79A8', '#A29BFE', '#00B894', '#FDCB6E'];
    const nodes = [];
    
    for (let i = 0; i < 100; i++) {
      nodes.push({
        id: i,
        color: colors[i % colors.length],
        top: `${Math.random() * 90 + 5}%`, // Random position between 5% and 95%
        delay: `${(i * 0.02).toFixed(2)}s` // Stagger by 0.02s
      });
    }
    
    return nodes;
  }, []);

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
      {/* Background nodes that persist throughout the page */}
      <div className="persistent-background-nodes">
        <div className="bg-node" style={{ backgroundColor: '#FF6B9D', top: '5%', left: '8%', width: '50px', height: '50px', animationDelay: '0s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#6C5CE7', top: '12%', left: '88%', width: '40px', height: '40px', animationDelay: '0.5s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#00B894', top: '18%', left: '15%', width: '45px', height: '45px', animationDelay: '1s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#FDCB6E', top: '25%', left: '92%', width: '55px', height: '55px', animationDelay: '1.5s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#C44569', top: '32%', left: '5%', width: '48px', height: '48px', animationDelay: '2s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#F8B500', top: '38%', left: '85%', width: '42px', height: '42px', animationDelay: '2.5s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#A29BFE', top: '45%', left: '10%', width: '52px', height: '52px', animationDelay: '3s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#FD79A8', top: '52%', left: '90%', width: '46px', height: '46px', animationDelay: '3.5s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#4ECDC4', top: '58%', left: '12%', width: '44px', height: '44px', animationDelay: '4s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#95E1D3', top: '65%', left: '87%', width: '50px', height: '50px', animationDelay: '4.5s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#FF6B6B', top: '72%', left: '8%', width: '48px', height: '48px', animationDelay: '5s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#AA96DA', top: '78%', left: '93%', width: '43px', height: '43px', animationDelay: '5.5s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#F38181', top: '85%', left: '15%', width: '47px', height: '47px', animationDelay: '6s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#A8D8EA', top: '92%', left: '85%', width: '45px', height: '45px', animationDelay: '6.5s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#FFD93D', top: '95%', left: '10%', width: '41px', height: '41px', animationDelay: '7s' }}></div>
        
        {/* Right side nodes */}
        <div className="bg-node" style={{ backgroundColor: '#FCBAD3', top: '8%', left: '70%', width: '38px', height: '38px', animationDelay: '0.7s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#FF6B9D', top: '22%', left: '25%', width: '44px', height: '44px', animationDelay: '1.4s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#6C5CE7', top: '35%', left: '75%', width: '49px', height: '49px', animationDelay: '2.1s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#00B894', top: '48%', left: '22%', width: '46px', height: '46px', animationDelay: '2.8s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#FDCB6E', top: '62%', left: '78%', width: '51px', height: '51px', animationDelay: '3.5s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#C44569', top: '75%', left: '28%', width: '43px', height: '43px', animationDelay: '4.2s' }}></div>
        <div className="bg-node" style={{ backgroundColor: '#F8B500', top: '88%', left: '72%', width: '47px', height: '47px', animationDelay: '4.9s' }}></div>
      </div>

      {/* Animated Hero Section */}
      <div className="animated-hero">
        {/* Animated nodes that slide across like a herd */}
        <div className="node-container">
          {/* 100 Herd nodes that pass by */}
          {herdNodes.map((node) => (
            <div 
              key={node.id}
              className="animated-node herd-node" 
              style={{ 
                backgroundColor: node.color, 
                top: node.top, 
                animationDelay: node.delay 
              }}
            ></div>
          ))}
          
          {/* Background nodes that stay behind */}
          <div className="animated-node background-stay node-bg-1" style={{ backgroundColor: '#FF6B9D', top: '15%', left: '10%' }}></div>
          <div className="animated-node background-stay node-bg-2" style={{ backgroundColor: '#6C5CE7', top: '28%', left: '85%' }}></div>
          <div className="animated-node background-stay node-bg-3" style={{ backgroundColor: '#00B894', top: '45%', left: '15%' }}></div>
          <div className="animated-node background-stay node-bg-4" style={{ backgroundColor: '#FDCB6E', top: '62%', left: '80%' }}></div>
          <div className="animated-node background-stay node-bg-5" style={{ backgroundColor: '#C44569', top: '75%', left: '20%' }}></div>
          <div className="animated-node background-stay node-bg-6" style={{ backgroundColor: '#F8B500', top: '88%', left: '75%' }}></div>
          <div className="animated-node background-stay node-bg-7" style={{ backgroundColor: '#A29BFE', top: '20%', left: '70%' }}></div>
          <div className="animated-node background-stay node-bg-8" style={{ backgroundColor: '#FD79A8', top: '52%', left: '25%' }}></div>
          <div className="animated-node background-stay node-bg-9" style={{ backgroundColor: '#4ECDC4', top: '35%', left: '90%' }}></div>
          <div className="animated-node background-stay node-bg-10" style={{ backgroundColor: '#95E1D3', top: '68%', left: '12%' }}></div>
        </div>

        {/* Logo text that appears after animation */}
        <div className={`hero-logo ${heroAnimationComplete ? 'visible' : ''}`}>
          <img src={Squadpng} alt="logo" width={200} height={200} />
          <h2 className="logo-subtitle">SQUAD GOALS</h2>
        </div>

        {/* Content that fades in after animation */}
        <div className={`hero-content ${heroAnimationComplete ? 'visible' : ''} ${user ? 'logged-in' : ''}`}>
          {user ? (
            <>
              <div className="welcome-user-section">
                <div className="welcome-profile-image">
                  {user.profileImage ? (
                    <img 
                      src={`http://localhost:5001${user.profileImage}`} 
                      alt="Profile" 
                      className="welcome-profile-img"
                    />
                  ) : (
                    <div className="welcome-profile-placeholder">
                      <span>{user.name?.charAt(0)?.toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <p className="hero-tagline">Welcome back, {user.name}! Ready to continue building your squad's mind map?</p>
              </div>
              <div className="home-hero-buttons">
                <Link to="/owner" className="btn btn-primary">
                  Go to Board Hub
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="hero-tagline">Collaborative mind mapping for your squad</p>
              <div className="home-hero-buttons">
                <Link to="/register" className="btn btn-primary">
                  Get Started
                </Link>
                <Link to="/login" className="btn btn-secondary">
                  Login
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Scroll indicator */}
        <div className={`scroll-indicator ${heroAnimationComplete ? 'visible' : ''}`}>
          <span>Scroll to explore</span>
          <div className="scroll-arrow">↓</div>
        </div>
      </div>

      {/* Feature Nodes Section */}
      <div className="feature-nodes-container">
        <div className="feature-node" style={{ 
          backgroundColor: '#FF6B9D', 
          top: '10%',
          left: '15%'
        }}>
          <div className="feature-node-content">
            <h3>🧠 Personal Mind Maps</h3>
            <p>Create nodes for hobbies, interests, and memories. Connect them with tags to build your personal knowledge network.</p>
          </div>
        </div>
        
        <div className="feature-node" style={{ 
          backgroundColor: '#6C5CE7',
          top: '45%',
          right: '20%'
        }}>
          <div className="feature-node-content">
            <h3>👥 Collaborative Layers</h3>
            <p>Zoom out to see how your personal map connects with your squad's maps through shared interests and tags.</p>
          </div>
        </div>
        
        <div className="feature-node" style={{ 
          backgroundColor: '#00B894',
          top: '75%',
          left: '25%'
        }}>
          <div className="feature-node-content">
            <h3>🏷️ Tag-Based Connections</h3>
            <p>Automatic connections based on shared tags create meaningful relationships between ideas and people.</p>
          </div>
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
          {user ? (
            <>
              <h3>Ready to Continue Building Your Squad's Mind Map?</h3>
              <p>Jump back into your boards and keep creating connections that matter.</p>
              <div className="demo-cta-buttons">
                <Link to="/owner" className="btn btn-primary">
                  Go to Board Hub
                </Link>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
