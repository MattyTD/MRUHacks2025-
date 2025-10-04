import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DemoMindMap from '../components/DemoMindMap';

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

      {/* Interactive Demo Section */}
      <div style={{ 
        marginTop: '4rem',
        padding: '3rem 0',
        backgroundColor: '#f8f9fa',
        borderRadius: '15px',
        opacity: isDemoVisible ? 1 : 0,
        transform: isDemoVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.6s ease-in-out'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#343434' }}>
            See It In Action
          </h2>
          <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
            Experience how Squad Goals works with this interactive demo. 
            Scroll to zoom between personal and group layers, and see how tags create meaningful connections.
          </p>
        </div>

        {/* Demo Controls */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '1rem', 
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={() => setCurrentLayer('personal')}
            style={{
              backgroundColor: currentLayer === 'personal' ? '#007bff' : '#f8f9fa',
              color: currentLayer === 'personal' ? 'white' : '#007bff',
              border: '2px solid #007bff',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
          >
            Personal Layer
          </button>
          <button 
            onClick={() => setCurrentLayer('group')}
            style={{
              backgroundColor: currentLayer === 'group' ? '#007bff' : '#f8f9fa',
              color: currentLayer === 'group' ? 'white' : '#007bff',
              border: '2px solid #007bff',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
          >
            Group Layer
          </button>
        </div>

        {/* Demo Description */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '2rem',
          padding: '0 2rem'
        }}>
          <p style={{ 
            fontSize: '16px', 
            color: '#555',
            backgroundColor: 'white',
            padding: '1rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {currentLayer === 'personal' 
              ? '👆 This is your personal mind map! Each node represents a hobby, interest, or memory. Notice how nodes with similar tags (like "creative" or "technology") are connected. Try scrolling to zoom out and see how your personal map connects to others.'
              : '👆 This is the group view! Each large node represents a squad member\'s personal mind map. The connections show shared interests and tags between squad members. Scroll to zoom in and explore individual personal maps.'
            }
          </p>
        </div>

        {/* Demo Mind Map */}
        <div style={{ 
          maxWidth: '1000px', 
          margin: '0 auto',
          padding: '0 2rem'
        }}>
          <DemoMindMap 
            isPersonalLayer={currentLayer === 'personal'}
            onLayerChange={handleLayerChange}
          />
        </div>

        {/* Call to Action */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '3rem',
          padding: '0 2rem'
        }}>
          <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#343434' }}>
            Ready to Build Your Squad's Mind Map?
          </h3>
          <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '2rem' }}>
            Join your friends and start creating connections that matter.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link 
              to="/register" 
              className="btn btn-primary" 
              style={{ 
                fontSize: '1.2rem', 
                padding: '15px 30px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              Start Your Squad
            </Link>
            <Link 
              to="/login" 
              className="btn btn-secondary" 
              style={{ 
                fontSize: '1.2rem', 
                padding: '15px 30px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              Join Existing Squad
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
