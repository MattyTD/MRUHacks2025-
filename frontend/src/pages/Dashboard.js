import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import MindMap from '../components/MindMap';

const Dashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLayer, setCurrentLayer] = useState('personal');
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/api/users');
        setUsers(res.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    console.log('Node clicked:', node);
  };

  const handleZoomChange = (zoomLevel) => {
    // Switch layers based on zoom level
    if (currentLayer === 'personal' && zoomLevel < 0.5) {
      setCurrentLayer('group');
    } else if (currentLayer === 'group' && zoomLevel > 1.5) {
      setCurrentLayer('personal');
    }
  };

  const switchToPersonalLayer = () => {
    setCurrentLayer('personal');
  };

  const switchToGroupLayer = () => {
    setCurrentLayer('group');
  };

  return (
    <div className="container">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1>Squad Goals</h1>
        <p>Welcome to your collaborative mind map, {user?.name}!</p>
      </div>

      {/* Layer Controls */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Mind Map Layers</h3>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button 
            onClick={switchToPersonalLayer}
            style={{
              backgroundColor: currentLayer === 'personal' ? '#007bff' : '#f8f9fa',
              color: currentLayer === 'personal' ? 'white' : '#007bff',
              border: '1px solid #007bff',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Personal Layer
          </button>
          <button 
            onClick={switchToGroupLayer}
            style={{
              backgroundColor: currentLayer === 'group' ? '#007bff' : '#f8f9fa',
              color: currentLayer === 'group' ? 'white' : '#007bff',
              border: '1px solid #007bff',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Group Layer
          </button>
        </div>
        <p style={{ fontSize: '14px', color: '#666' }}>
          {currentLayer === 'personal' 
            ? 'Your personal mind map with hobbies, interests, and memories connected by tags.'
            : 'Group mind map showing how all users\' personal maps connect through shared tags.'
          }
        </p>
      </div>

      {/* Mind Map Visualization */}
      <div className="card">
        <h3>Interactive Mind Map</h3>
        <MindMap 
          isPersonalLayer={currentLayer === 'personal'}
          userId={user?.id}
          onNodeClick={handleNodeClick}
          onZoomChange={handleZoomChange}
        />
      </div>

      {/* Selected Node Information */}
      {selectedNode && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h3>Selected Node: {selectedNode.label}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <strong>Type:</strong> {selectedNode.group || 'node'}
            </div>
            <div>
              <strong>Tags:</strong> {selectedNode.tags?.join(', ') || 'No tags'}
            </div>
            <div>
              <strong>Color:</strong> 
              <span style={{ 
                backgroundColor: selectedNode.color, 
                color: 'white', 
                padding: '2px 8px', 
                borderRadius: '4px',
                marginLeft: '8px'
              }}>
                {selectedNode.color}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* User Information */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>Your Profile</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <strong>Name:</strong> {user?.name}
          </div>
          <div>
            <strong>Email:</strong> {user?.email}
          </div>
          <div>
            <strong>Role:</strong> {user?.role}
          </div>
          <div>
            <strong>Status:</strong> {user?.isActive ? 'Active' : 'Inactive'}
          </div>
        </div>
      </div>

      {/* All Users */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>Collaborative Squad</h3>
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {users.map((userData) => (
              <div key={userData._id} style={{ 
                border: '1px solid #ddd', 
                borderRadius: '5px', 
                padding: '1rem',
                backgroundColor: '#f9f9f9'
              }}>
                <h4>{userData.name}</h4>
                <p><strong>Email:</strong> {userData.email}</p>
                <p><strong>Role:</strong> {userData.role}</p>
                <p><strong>Status:</strong> {userData.isActive ? 'Active' : 'Inactive'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
