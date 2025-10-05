import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import PersonalMindMapCreator from '../components/PersonalMindMapCreator';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBoards: 0,
    mostVisitedBoards: [],
    mostCollaborativeUsers: [],
    totalConnections: 0,
    totalNodes: 0
  });
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [newBoardColor, setNewBoardColor] = useState('#667EEA');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showPersonalMindMapCreator, setShowPersonalMindMapCreator] = useState(false);
  const [hasPersonalMindMap, setHasPersonalMindMap] = useState(false);
  const fileInputRef = useRef(null);

  // Board color options (same as Owner page)
  const colorOptions = [
    '#667EEA', // Purple
    '#FF6B9D', // Pink
    '#4FD1C5', // Teal
    '#F6AD55', // Orange
    '#FC8181', // Red
    '#63B3ED', // Blue
    '#68D391', // Green
    '#D6BCFA', // Lavender
  ];

  const checkPersonalMindMap = useCallback(async () => {
    try {
      const response = await axios.get('/api/auth/personal-mindmap');
      setHasPersonalMindMap(!!response.data.personalMindMap);
    } catch (error) {
      console.error('Error checking personal mind map:', error);
      setHasPersonalMindMap(false);
    }
  }, []);

  const fetchDashboardStats = useCallback(async () => {
    try {
      // Check if user has personal mind map
      await checkPersonalMindMap();

      // Fetch user's boards
      const boardsRes = await axios.get('/api/boards');
      const boards = boardsRes.data;

      // Calculate stats
      const totalBoards = boards.length;
      const mostVisitedBoards = boards
        .sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0))
        .slice(0, 3);

      // Get collaborators only from user's boards with proper counting
      const collaboratorMap = new Map();

      boards.forEach(board => {
        if (board.collaborators && Array.isArray(board.collaborators)) {
          board.collaborators.forEach(collaborator => {
            if (collaborator._id !== user.id) {
              if (collaboratorMap.has(collaborator._id)) {
                // Increment collaboration count
                const existing = collaboratorMap.get(collaborator._id);
                existing.collaborationCount += 1;
              } else {
                // Add new collaborator
                collaboratorMap.set(collaborator._id, {
                  _id: collaborator._id,
                  name: collaborator.name || 'Unknown User',
                  collaborationCount: 1
                });
              }
            }
          });
        }
      });

      // Convert Map to Array and sort by collaboration count
      const sortedCollaborators = Array.from(collaboratorMap.values())
        .sort((a, b) => (b.collaborationCount || 0) - (a.collaborationCount || 0))
        .slice(0, 3);

      const totalConnections = boards.reduce((sum, board) => sum + (board.connections || 0), 0);
      const totalNodes = boards.reduce((sum, board) => sum + (board.nodes?.length || 0), 0);

      setStats({
        totalBoards,
        mostVisitedBoards,
        mostCollaborativeUsers: sortedCollaborators,
        totalConnections,
        totalNodes
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, checkPersonalMindMap]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const handleProfileImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await axios.post('/api/auth/upload-profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setProfileImage(response.data.profileImageUrl);
      
    } catch (error) {
      console.error('Error uploading profile image:', error);
      alert('Failed to upload profile image');
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Quick Actions handlers
  const handleCreateNewBoard = () => {
    console.log('Create New Board button clicked!');
    
    // Check if user has personal mind map first
    if (!hasPersonalMindMap) {
      setShowPersonalMindMapCreator(true);
      return;
    }
    
    console.log('Current showCreateModal state:', showCreateModal);
    setShowCreateModal(true);
    console.log('Setting showCreateModal to true');
  };

  const handleBrowseBoards = () => {
    console.log('Browse Boards button clicked!');
    navigate('/owner');
  };

  const handleInviteCollaborators = () => {
    console.log('Invite Collaborators button clicked!');
    console.log('Current showInviteModal state:', showInviteModal);
    setShowInviteModal(true);
    console.log('Setting showInviteModal to true');
  };

  // Create Board Modal handlers
  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setNewBoardTitle('');
    setNewBoardDescription('');
    setNewBoardColor('#667EEA');
  };

  const handleSubmitBoard = async (e) => {
    e.preventDefault();
    
    if (!newBoardTitle.trim()) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/boards', {
        title: newBoardTitle,
        description: newBoardDescription,
        color: newBoardColor
      }, {
        headers: { 'x-auth-token': token }
      });
      
      // Refresh stats after creating board
      await fetchDashboardStats();
      handleCloseCreateModal();
      
      // Navigate to the new board
      navigate(`/board/${response.data._id}`);
    } catch (err) {
      console.error('Error creating board:', err);
      alert('Failed to create board');
    }
  };

  // Invite Collaborators Modal handlers
  const handleCloseInviteModal = () => {
    setShowInviteModal(false);
    setInviteEmail('');
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    
    if (!inviteEmail.trim()) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/auth/send-friend-request', {
        email: inviteEmail
      }, {
        headers: { 'x-auth-token': token }
      });
      
      alert('Friend request sent successfully!');
      handleCloseInviteModal();
    } catch (err) {
      console.error('Error sending friend request:', err);
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert('Failed to send friend request');
      }
    }
  };

  // Personal Mind Map Creator handlers
  const handlePersonalMindMapComplete = async (mindMapData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/auth/create-personal-mindmap', mindMapData, {
        headers: { 'x-auth-token': token }
      });
      
      setShowPersonalMindMapCreator(false);
      setHasPersonalMindMap(true);
      
      // Show success message and then proceed to create board
      alert('Personal mind map created successfully! Now you can create collaborative boards.');
      
      // Automatically open board creation modal
      setTimeout(() => {
        setShowCreateModal(true);
      }, 1000);
      
    } catch (err) {
      console.error('Error creating personal mind map:', err);
      alert('Failed to create personal mind map');
    }
  };

  const handlePersonalMindMapCancel = () => {
    setShowPersonalMindMapCreator(false);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  console.log('Dashboard render - showCreateModal:', showCreateModal, 'showInviteModal:', showInviteModal);

  return (
    <div className="dashboard-container">
      {/* Background nodes */}
      <div className="dashboard-background-nodes">
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
      </div>

      <div className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <div className="user-profile-section">
            <div className="user-info">
              <div className="profile-image-container">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="profile-image" />
                ) : (
                  <div className="profile-image-placeholder">
                    <span>{user?.name?.charAt(0)?.toUpperCase()}</span>
                  </div>
                )}
                <button 
                  className="upload-image-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload Profile Image"
                >
                  📷
                </button>
              </div>
              <div className="user-details">
                <h2>{user?.name}</h2>
                <p>{user?.email}</p>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {/* Total Boards */}
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>{stats.totalBoards}</h3>
              <p>Total Boards</p>
            </div>
          </div>

          {/* Total Nodes */}
          <div className="stat-card">
            <div className="stat-icon">🔗</div>
            <div className="stat-content">
              <h3>{stats.totalNodes}</h3>
              <p>Total Nodes</p>
            </div>
          </div>

          {/* Total Connections */}
          <div className="stat-card">
            <div className="stat-icon">🌐</div>
            <div className="stat-content">
              <h3>{stats.totalConnections}</h3>
              <p>Total Connections</p>
            </div>
          </div>

          {/* Most Visited Boards */}
          <div className="stat-card large">
            <div className="stat-header">
              <div className="stat-icon">⭐</div>
              <h3>Most Visited Boards</h3>
            </div>
            <div className="stat-list">
              {stats.mostVisitedBoards.length > 0 ? (
                stats.mostVisitedBoards.map((board, index) => (
                  <div 
                    key={board._id} 
                    className="stat-item clickable-board"
                    onClick={() => navigate(`/board/${board._id}`)}
                    title={`Click to open ${board.title}`}
                  >
                    <span className="rank">#{index + 1}</span>
                    <span className="name">{board.title}</span>
                    <span className="count">{board.visitCount || 0} visits</span>
                  </div>
                ))
              ) : (
                <p className="no-data">No boards yet</p>
              )}
            </div>
          </div>

          {/* Most Collaborative Users */}
          <div className="stat-card large">
            <div className="stat-header">
              <div className="stat-icon">👥</div>
              <h3>Most Collaborative Users</h3>
            </div>
            <div className="stat-list">
              {stats.mostCollaborativeUsers.length > 0 ? (
                stats.mostCollaborativeUsers.map((user, index) => (
                  <div key={user._id} className="stat-item">
                    <span className="rank">#{index + 1}</span>
                    <span className="name">{user.name}</span>
                    <span className="count">{user.collaborationCount || 0} collaborations</span>
                  </div>
                ))
              ) : (
                <p className="no-data">No collaborations yet</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="stat-card large">
            <div className="stat-header">
              <div className="stat-icon">⚡</div>
              <h3>Quick Actions</h3>
            </div>
            <div className="quick-actions">
              <button className="action-btn primary" onClick={handleCreateNewBoard}>
                <span className="action-icon">➕</span>
                Create New Board
              </button>
              <button className="action-btn secondary" onClick={handleBrowseBoards}>
                <span className="action-icon">🔍</span>
                Browse Boards
              </button>
              <button className="action-btn secondary" onClick={handleInviteCollaborators}>
                <span className="action-icon">👥</span>
                Invite Collaborators
              </button>
            </div>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleProfileImageUpload}
          accept="image/*"
          style={{ display: 'none' }}
        />

        {/* Create Board Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={handleCloseCreateModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create New Board</h2>
                <button className="modal-close" onClick={handleCloseCreateModal}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmitBoard}>
                <div className="form-group">
                  <label>Board Title *</label>
                  <input
                    type="text"
                    value={newBoardTitle}
                    onChange={(e) => setNewBoardTitle(e.target.value)}
                    placeholder="Enter board title"
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={newBoardDescription}
                    onChange={(e) => setNewBoardDescription(e.target.value)}
                    placeholder="Enter board description (optional)"
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>Board Color</label>
                  <div className="color-picker">
                    {colorOptions.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`color-option ${newBoardColor === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewBoardColor(color)}
                      />
                    ))}
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={handleCloseCreateModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create Board
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Invite Collaborators Modal */}
        {showInviteModal && (
          <div className="modal-overlay" onClick={handleCloseInviteModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Invite Collaborators</h2>
                <button className="modal-close" onClick={handleCloseInviteModal}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSendInvite}>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter collaborator's email"
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <p className="invite-description">
                    Send a friend request to collaborate on your boards. They'll be able to view and edit your shared boards.
                  </p>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={handleCloseInviteModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Send Invite
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Personal Mind Map Creator */}
        {showPersonalMindMapCreator && (
          <PersonalMindMapCreator
            onComplete={handlePersonalMindMapComplete}
            onCancel={handlePersonalMindMapCancel}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
