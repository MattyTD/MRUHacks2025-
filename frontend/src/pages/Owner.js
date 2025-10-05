import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import './Owner.css';

const Owner = () => {
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [filteredBoards, setFilteredBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [newBoardColor, setNewBoardColor] = useState('#667EEA');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(80);
  const [personalMindMaps, setPersonalMindMaps] = useState([]);
  const [showMindMapSelector, setShowMindMapSelector] = useState(false);
  const [showMindMapPicker, setShowMindMapPicker] = useState(false);
  const [selectedMindMapId, setSelectedMindMapId] = useState(null);
  const [pendingOpenBoardId, setPendingOpenBoardId] = useState(null);
  const [boardType, setBoardType] = useState('personal'); // 'personal' or 'collective'

  // Safe color fallback + helpers
  const withFallbackColor = (color) => (typeof color === 'string' && color.trim() ? color : '#667EEA');
  const hexToRgba = (hex, alpha) => {
    const safe = withFallbackColor(hex).replace('#','');
    const r = parseInt(safe.substring(0,2), 16);
    const g = parseInt(safe.substring(2,4), 16);
    const b = parseInt(safe.substring(4,6), 16);
    const a = Math.min(Math.max(alpha, 0), 1);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };

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
    fetchPersonalMindMaps();
    
    // Listen for sidebar resize events
    const handleSidebarResize = (e) => {
      setSidebarWidth(e.detail);
    };
    
    window.addEventListener('sidebarResize', handleSidebarResize);
    // Refetch boards whenever window regains focus (coming back from editor)
    const handleFocus = () => { fetchBoards(); };
    const handleBoardsChanged = () => { fetchBoards(); };
    window.addEventListener('focus', handleFocus);
    window.addEventListener('boardsChanged', handleBoardsChanged);
    
    return () => {
      window.removeEventListener('sidebarResize', handleSidebarResize);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('boardsChanged', handleBoardsChanged);
    };
  }, []);

  // Keep filtered boards in sync with boards + active tab
  useEffect(() => {
    const filtered = (boards || []).filter(b => b.type === boardType);
    setFilteredBoards(filtered);
  }, [boards, boardType]);

  const fetchPersonalMindMaps = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/auth/personal-mindmaps', {
        headers: { 'x-auth-token': token }
      });
      const maps = response.data.mindMaps || [];
      setPersonalMindMaps(maps);
      return maps;
    } catch (err) {
      console.error('Error fetching personal mind maps:', err);
      return [];
    }
  };

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
    let filtered = boards;
    
    // Filter by board type first
    filtered = filtered.filter(board => board.type === boardType);
    
    // Then filter by search query
    if (query.trim()) {
      filtered = filtered.filter(board => 
        board.title.toLowerCase().includes(query.toLowerCase()) ||
        (board.description && board.description.toLowerCase().includes(query.toLowerCase()))
      );
    }
    
    setFilteredBoards(filtered);
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

    // Check if creating personal board without personal mind maps
    if (boardType === 'personal' && personalMindMaps.length === 0) {
      setShowCreateModal(false);
      setShowMindMapSelector(true);
      return;
    }
    
    // If creating a personal board and user has mind maps, prompt to pick one (unless already chosen)
    if (boardType === 'personal' && personalMindMaps.length > 0 && !selectedMindMapId) {
      setShowCreateModal(false);
      // Preselect first by default to streamline flow
      setSelectedMindMapId(personalMindMaps[0]?._id || null);
      setShowMindMapPicker(true);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/boards', {
        title: newBoardTitle,
        description: newBoardDescription,
        color: newBoardColor,
        type: boardType
      }, {
        headers: { 'x-auth-token': token }
      });
      
      let createdBoard = response.data;

      // If personal board with selected mind map: navigate directly to the generated map view
      if (boardType === 'personal' && selectedMindMapId) {
        const map = personalMindMaps.find(m => m._id === selectedMindMapId);
        // reset state/modals first
        setShowMindMapPicker(false);
        setSelectedMindMapId(null);
        handleCloseModal();
        // go straight to generated interactive network from the chosen personal map
        navigate(`/generated-map?mid=${encodeURIComponent(map?._id || '')}`, { state: { mindMap: map } });
        return;
      }

      setBoards([createdBoard, ...boards]);
      setFilteredBoards([createdBoard, ...filteredBoards]);
      // Reset selection/pickers and modal state
      setShowMindMapPicker(false);
      setSelectedMindMapId(null);
      handleCloseModal();
      
      // Navigate to editor only for collective boards
      navigate(`/board/${createdBoard._id}`);
    } catch (err) {
      console.error('Error creating board:', err);
      setError('Failed to create board');
    }
  };

  const handleBoardClick = async (boardId) => {
    const board = boards.find(b => b._id === boardId);
    if (board && board.type === 'personal') {
      // Always regenerate from a personal mind map
      let map = null;
      let maps = personalMindMaps;
      if (!maps || maps.length === 0) maps = await fetchPersonalMindMaps();
      if (board.importedFrom) {
        map = maps.find(m => m._id === board.importedFrom) || null;
      }
      // Try title match (board title == personal mind map name)
      if (!map && board.title) {
        const titleLc = String(board.title).trim().toLowerCase();
        map = maps.find(m => String(m.name).trim().toLowerCase() === titleLc) || null;
      }
      // If still unmapped and options exist, ask user which one once and persist association
      if (!map && maps && maps.length > 0) {
        setPendingOpenBoardId(boardId);
        setSelectedMindMapId(maps[0]._id);
        setShowMindMapPicker(true);
        return;
      }
      if (map) {
        navigate(`/generated-map?mid=${encodeURIComponent(map._id)}`, { state: { mindMap: map } });
        return;
      }
      // Fallback: open editor if user has no personal mind maps yet
      navigate(`/board/${boardId}`);
      return;
    }
    navigate(`/board/${boardId}`);
  };

  const handleConfirmOpenSelected = async () => {
    if (!pendingOpenBoardId || !selectedMindMapId) {
      setShowMindMapPicker(false);
      setPendingOpenBoardId(null);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/boards/${pendingOpenBoardId}`, { importedFrom: selectedMindMapId }, { headers: { 'x-auth-token': token } });
    } catch (err) {
      console.error('Failed to persist board association', err);
    }
    const chosen = personalMindMaps.find(m => m._id === selectedMindMapId);
    setShowMindMapPicker(false);
    setPendingOpenBoardId(null);
    setSelectedMindMapId(null);
    if (chosen) {
      navigate(`/generated-map?mid=${encodeURIComponent(chosen._id)}`, { state: { mindMap: chosen } });
    }
  };

  const handleDeleteBoard = async (boardId) => {
    if (!window.confirm('Are you sure you want to delete this board? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/boards/${boardId}`, {
        headers: { 'x-auth-token': token }
      });
      
      // Remove board from state
      setBoards(boards.filter(board => board._id !== boardId));
      setFilteredBoards(filteredBoards.filter(board => board._id !== boardId));
      
      alert('Board deleted successfully!');
    } catch (err) {
      console.error('Error deleting board:', err);
      alert('Failed to delete board');
    }
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

        {/* Board Type Toggle */}
        <div className="board-type-toggle">
          <div className="toggle-container">
            <button 
              className={`toggle-btn ${boardType === 'personal' ? 'active' : ''}`}
              onClick={() => {
                setBoardType('personal');
                handleSearch(''); // Trigger filtering
              }}
            >
              <span className="toggle-icon">🧠</span>
              Personal Relations
            </button>
            <button 
              className={`toggle-btn ${boardType === 'collective' ? 'active' : ''}`}
              onClick={() => {
                setBoardType('collective');
                handleSearch(''); // Trigger filtering
              }}
            >
              <span className="toggle-icon">👥</span>
              Collective Effort
            </button>
          </div>
          <div className="toggle-description">
            {boardType === 'personal' ? (
              <p>Create boards based on your personal mind map and connect with others through shared interests.</p>
            ) : (
              <p>Create collaborative boards where multiple users can contribute nodes and relationships.</p>
            )}
          </div>
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
                style={{ borderColor: withFallbackColor(board.color) }}
              >
                <div className="board-card-header" style={{ background: `linear-gradient(135deg, ${hexToRgba(board.color, 0.25)}, ${hexToRgba(board.color, 0.12)})` }}>
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
                  <button 
                    className="delete-board-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBoard(board._id);
                    }}
                    title="Delete Board"
                  >
                    🗑️
                  </button>
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
                <label>Board Type</label>
                <div className="board-type-selection">
                  <label className="board-type-option">
                    <input
                      type="radio"
                      name="boardType"
                      value="personal"
                      checked={boardType === 'personal'}
                      onChange={(e) => setBoardType(e.target.value)}
                    />
                    <span className="board-type-label">
                      <span className="board-type-icon">🧠</span>
                      Personal Relations
                      <small>Based on your personal mind map</small>
                    </span>
                  </label>
                  <label className="board-type-option">
                    <input
                      type="radio"
                      name="boardType"
                      value="collective"
                      checked={boardType === 'collective'}
                      onChange={(e) => setBoardType(e.target.value)}
                    />
                    <span className="board-type-label">
                      <span className="board-type-icon">👥</span>
                      Collective Effort
                      <small>Collaborative board creation</small>
                    </span>
                  </label>
                </div>
              </div>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    title="Current color"
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      border: '2px solid #fff',
                      boxShadow: '0 0 10px rgba(255,255,255,0.25)',
                      background: newBoardColor
                    }}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowColorPicker(true)}
                  >
                    Choose Color
                  </button>
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

      {/* Color Picker Modal */}
      {showColorPicker && (
        <div className="modal-overlay" onClick={() => setShowColorPicker(false)}>
          <div className="modal-content color-picker-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Select Board Color</h2>
              <button className="modal-close" onClick={() => setShowColorPicker(false)}>✕</button>
            </div>
            <div className="color-picker" style={{ marginTop: '10px' }}>
              {colorOptions.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`color-option ${newBoardColor === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => { setNewBoardColor(color); setShowColorPicker(false); }}
                />
              ))}
            </div>
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button className="btn-secondary" onClick={() => setShowColorPicker(false)}>Close</button>
            </div>
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

      {/* Personal Mind Map Selector Modal */}
      {showMindMapSelector && (
        <div className="modal-overlay" onClick={() => setShowMindMapSelector(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Personal Mind Map First</h2>
              <button className="modal-close" onClick={() => setShowMindMapSelector(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>To create a Personal Relations board, you need to have at least one personal mind map.</p>
              <p>Would you like to create a personal mind map now?</p>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowMindMapSelector(false)}>Cancel</button>
              <button onClick={() => {
                setShowMindMapSelector(false);
                navigate('/personal-mindmaps');
              }}>Create Mind Map</button>
            </div>
          </div>
        </div>
      )}

      {/* Personal Mind Map Picker (for importing into new personal board) */}
      {showMindMapPicker && (
        <div className="modal-overlay" onClick={() => { setShowMindMapPicker(false); setSelectedMindMapId(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Select Personal Mind Map</h2>
              <button className="modal-close" onClick={() => { setShowMindMapPicker(false); setSelectedMindMapId(null); }}>✕</button>
            </div>
            <div className="modal-body">
              <p>Choose one of your personal mind maps to generate the board (same layout as the welcome page).</p>
              <div className="mindmap-picker-list">
                {personalMindMaps.map(map => (
                  <label key={map._id} className={`mindmap-picker-item ${selectedMindMapId === map._id ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="selectedMindMap"
                      value={map._id}
                      checked={selectedMindMapId === map._id}
                      onChange={() => setSelectedMindMapId(map._id)}
                    />
                    <div className="mindmap-picker-content">
                      <div className="mindmap-picker-title">{map.name}</div>
                      <div className="mindmap-picker-meta">
                        <span>{map.nodes?.length || 0} nodes</span>
                        <span>{map.edges?.length || 0} connections</span>
                        <span>{map.levels ?? Math.max(...(map.nodes||[]).map(n => n.layer || 0), 0) + 1} levels</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => { setShowMindMapPicker(false); setSelectedMindMapId(null); setPendingOpenBoardId(null); }}>Cancel</button>
              <button 
                className="btn-primary"
                disabled={!selectedMindMapId}
                onClick={(e) => {
                  if (pendingOpenBoardId) {
                    // Persist association and open
                    (async () => {
                      try {
                        const token = localStorage.getItem('token');
                        await axios.put(`/api/boards/${pendingOpenBoardId}`, { importedFrom: selectedMindMapId }, { headers: { 'x-auth-token': token } });
                      } catch (_) {}
                      const chosen = personalMindMaps.find(m => m._id === selectedMindMapId);
                      setShowMindMapPicker(false);
                      setPendingOpenBoardId(null);
                      setSelectedMindMapId(null);
                      if (chosen) navigate(`/generated-map?mid=${encodeURIComponent(chosen._id)}`, { state: { mindMap: chosen } });
                    })();
                  } else {
                    // Create flow
                    setShowMindMapPicker(false);
                    handleSubmitBoard(e);
                  }
                }}
              >
                Use Selected Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Owner;

