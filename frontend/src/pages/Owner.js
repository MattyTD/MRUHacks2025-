import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import './Owner.css';

const Owner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [filteredBoards, setFilteredBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [newBoardColor, setNewBoardColor] = useState('#667EEA');
  const [sidebarWidth, setSidebarWidth] = useState(80);

  // Board color options
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

  useEffect(() => {
    fetchBoards();
    
    // Listen for sidebar resize events
    const handleSidebarResize = (e) => {
      setSidebarWidth(e.detail);
    };
    
    window.addEventListener('sidebarResize', handleSidebarResize);
    
    return () => {
      window.removeEventListener('sidebarResize', handleSidebarResize);
    };
  }, []);

  const fetchBoards = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/boards', {
        headers: { 'x-auth-token': token }
      });
      setBoards(response.data);
      setFilteredBoards(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching boards:', err);
      setError('Failed to load boards');
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    if (!query.trim()) {
      setFilteredBoards(boards);
    } else {
      const filtered = boards.filter(board => 
        board.title.toLowerCase().includes(query.toLowerCase()) ||
        (board.description && board.description.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredBoards(filtered);
    }
  };

  const handleCreateBoard = () => {
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
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
      
      setBoards([response.data, ...boards]);
      setFilteredBoards([response.data, ...filteredBoards]);
      handleCloseModal();
    } catch (err) {
      console.error('Error creating board:', err);
      setError('Failed to create board');
    }
  };

  const handleBoardClick = (boardId) => {
    navigate(`/board/${boardId}`);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="owner-container">
        <Sidebar onCreateBoard={handleCreateBoard} onSearch={handleSearch} />
        <div className="owner-content" style={{ marginLeft: `${sidebarWidth}px` }}>
          <div className="loading-spinner">Loading your boards...</div>
        </div>
        <div className="owner-background-nodes" style={{ left: `${sidebarWidth}px` }}>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="bg-node"
              style={{
                backgroundColor: colorOptions[i % colorOptions.length],
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${60 + Math.random() * 40}px`,
                height: `${60 + Math.random() * 40}px`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="owner-container">
      <Sidebar onCreateBoard={handleCreateBoard} onSearch={handleSearch} />
      
      <div className="owner-content" style={{ marginLeft: `${sidebarWidth}px` }}>
        <div className="owner-header">
          <h1>My Boards</h1>
          <p>Create and manage your mind map boards</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="boards-grid">
          {filteredBoards.length === 0 ? (
            <div className="no-boards">
              <p>No boards yet. Create your first board to get started!</p>
              <button className="create-first-board-btn" onClick={handleCreateBoard}>
                Create Board
              </button>
            </div>
          ) : (
            filteredBoards.map(board => (
              <div
                key={board._id}
                className="board-card"
                onClick={() => handleBoardClick(board._id)}
                style={{ borderColor: board.color }}
              >
                <div className="board-card-header" style={{ background: `linear-gradient(135deg, ${board.color}40, ${board.color}20)` }}>
                  <h3>{board.title}</h3>
                </div>
                <div className="board-card-body">
                  {board.description && <p className="board-description">{board.description}</p>}
                  <div className="board-meta">
                    <span className="board-nodes-count">
                      {board.nodes?.length || 0} nodes
                    </span>
                    <span className="board-updated">
                      Updated {formatDate(board.updatedAt)}
                    </span>
                  </div>
                </div>
                <div className="board-card-footer">
                  <span className="board-owner">by {board.owner?.name || 'You'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Board Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Board</h2>
              <button className="modal-close" onClick={handleCloseModal}>
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
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
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

      {/* Background nodes */}
      <div className="owner-background-nodes" style={{ left: `${sidebarWidth}px` }}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="bg-node"
            style={{
              backgroundColor: colorOptions[i % colorOptions.length],
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${60 + Math.random() * 40}px`,
              height: `${60 + Math.random() * 40}px`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Owner;

