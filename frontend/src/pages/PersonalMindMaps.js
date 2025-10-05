import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import PersonalMindMapCreator from '../components/PersonalMindMapCreator';
import './PersonalMindMaps.css';

const PersonalMindMaps = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mindMaps, setMindMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreator, setShowCreator] = useState(false);
  const [editingMindMap, setEditingMindMap] = useState(null);

  useEffect(() => {
    fetchPersonalMindMaps();
  }, []);

  const fetchPersonalMindMaps = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/auth/personal-mindmaps', {
        headers: { 'x-auth-token': token }
      });
      setMindMaps(response.data.mindMaps || []);
    } catch (err) {
      console.error('Error fetching personal mind maps:', err);
      setError('Failed to load personal mind maps');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingMindMap(null);
    setShowCreator(true);
  };

  const handleEdit = (mindMap) => {
    setEditingMindMap(mindMap);
    setShowCreator(true);
  };

  const handleDelete = async (mindMapId) => {
    if (!window.confirm('Are you sure you want to delete this personal mind map? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/auth/personal-mindmaps/${mindMapId}`);
      setMindMaps(mindMaps.filter(map => map._id !== mindMapId));
      alert('Personal mind map deleted successfully!');
    } catch (err) {
      console.error('Error deleting personal mind map:', err);
      alert('Failed to delete personal mind map');
    }
  };

  const handleGenerateGroupMap = (mindMap) => {
    navigate('/generated-map', { state: { mindMap } });
  };

  const handleCreatorComplete = async (mindMapData) => {
    try {
      const token = localStorage.getItem('token');
      
      if (editingMindMap) {
        // Update existing mind map
        await axios.put(`/api/auth/personal-mindmaps/${editingMindMap._id}`, mindMapData, {
          headers: { 'x-auth-token': token }
        });
        
        setMindMaps(mindMaps.map(map => 
          map._id === editingMindMap._id 
            ? { ...map, ...mindMapData, updatedAt: new Date().toISOString() }
            : map
        ));
      } else {
        // Create new mind map
        const response = await axios.post('/api/auth/create-personal-mindmap', mindMapData, {
          headers: { 'x-auth-token': token }
        });
        
        setMindMaps([response.data.personalMindMap, ...mindMaps]);
      }
      
      setShowCreator(false);
      setEditingMindMap(null);
      alert(`Personal mind map ${editingMindMap ? 'updated' : 'created'} successfully!`);
    } catch (err) {
      console.error('Error saving personal mind map:', err);
      alert('Failed to save personal mind map');
    }
  };

  const handleCreatorCancel = () => {
    setShowCreator(false);
    setEditingMindMap(null);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="personal-mindmaps-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your personal mind maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="personal-mindmaps-container">
      <div className="personal-mindmaps-header">
        <div className="header-content">
          <h1>Personal Mind Maps</h1>
          <p>Create and manage your individual mind maps that can be used in collaborative boards</p>
        </div>
        <button className="create-mindmap-btn" onClick={handleCreateNew}>
          <span className="btn-icon">🧠</span>
          Create New Mind Map
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="mindmaps-grid">
        {mindMaps.length === 0 ? (
          <div className="no-mindmaps">
            <div className="no-mindmaps-icon">🧠</div>
            <h3>No Personal Mind Maps Yet</h3>
            <p>Create your first personal mind map to get started with collaborative boards!</p>
            <button className="create-first-mindmap-btn" onClick={handleCreateNew}>
              Create Your First Mind Map
            </button>
          </div>
        ) : (
          mindMaps.map(mindMap => (
            <div key={mindMap._id} className="mindmap-card">
              <div className="mindmap-card-header">
                <div className="mindmap-info">
                  <h3>{mindMap.name}</h3>
                  <span className={`mindmap-context ${mindMap.context}`}>
                    {mindMap.context === 'recreational' ? '🎮' : '💼'} {mindMap.context}
                  </span>
                </div>
                <div className="mindmap-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEdit(mindMap)}
                    title="Edit Mind Map"
                  >
                    ✏️
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(mindMap._id)}
                    title="Delete Mind Map"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className="mindmap-card-body">
                <div className="mindmap-stats">
                  <div className="stat">
                    <span className="stat-number">{mindMap.nodes?.length || 0}</span>
                    <span className="stat-label">Nodes</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{mindMap.edges?.length || 0}</span>
                    <span className="stat-label">Connections</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{mindMap.levels || 3}</span>
                    <span className="stat-label">Levels</span>
                  </div>
                </div>
                
                <div className="mindmap-legend">
                  <h4>Legend:</h4>
                  <div className="legend-items">
                    {Object.entries(mindMap.legend || {}).slice(0, 3).map(([key, value]) => (
                      <div key={key} className="legend-item">
                        <div 
                          className="legend-color" 
                          style={{ backgroundColor: value.color }}
                        ></div>
                        <span>{value.name}</span>
                      </div>
                    ))}
                    {(Object.keys(mindMap.legend || {}).length > 3) && (
                      <span className="more-legend">+{Object.keys(mindMap.legend || {}).length - 3} more</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mindmap-card-footer">
                <span className="mindmap-date">
                  {editingMindMap?._id === mindMap._id ? 'Updated' : 'Created'} {formatDate(mindMap.updatedAt || mindMap.createdAt)}
                </span>
                <div className="mindmap-footer-actions">
                  <button className="generate-map-btn" onClick={() => handleGenerateGroupMap(mindMap)}>
                    Generate Group Map
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreator && (
        <PersonalMindMapCreator
          onComplete={handleCreatorComplete}
          onCancel={handleCreatorCancel}
          initialData={editingMindMap}
        />
      )}
    </div>
  );
};

export default PersonalMindMaps;
