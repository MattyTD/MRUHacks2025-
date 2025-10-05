import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './BoardEditor.css';

const BoardEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canvasRef = useRef(null);
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [showEdgeModal, setShowEdgeModal] = useState(false);
  const [nodeForm, setNodeForm] = useState({ label: '', color: '#FF6B9D', description: '' });
  const [edgeForm, setEdgeForm] = useState({ from: '', to: '', type: '', color: '#4FD1C5' });
  const [theme, setTheme] = useState('dark');
  const [personalMindMaps, setPersonalMindMaps] = useState([]);
  const [showMindMapSelector, setShowMindMapSelector] = useState(false);
  const [legend, setLegend] = useState({});
  const [autoRouted, setAutoRouted] = useState(false);

  // Ensure nodes have positions; if missing, lay them out in concentric circles by layer
  const generatePositionsIfMissing = (rawNodes) => {
    const missing = (rawNodes || []).some(n => typeof n.x !== 'number' || typeof n.y !== 'number');
    if (!missing) return rawNodes || [];

    const width = 1000;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;

    const byLayer = new Map();
    (rawNodes || []).forEach(n => {
      const l = n.layer ?? 0;
      if (!byLayer.has(l)) byLayer.set(l, []);
      byLayer.get(l).push(n);
    });

    const laidOut = (rawNodes || []).map(n => ({ ...n }));
    Array.from(byLayer.entries()).forEach(([layer, layerNodes]) => {
      const radius = 120 + Number(layer) * 140;
      const count = layerNodes.length || 1;
      layerNodes.forEach((node, idx) => {
        const angle = (idx / count) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        const i = laidOut.findIndex(nn => nn.id === node.id);
        if (i !== -1) {
          laidOut[i].x = x;
          laidOut[i].y = y;
        }
      });
    });

    return laidOut;
  };

  useEffect(() => {
    fetchBoard();
    if (board?.type === 'personal') {
      fetchPersonalMindMaps();
    }
  }, [id]);

  const fetchBoard = async () => {
    try {
      const response = await axios.get(`/api/boards/${id}`);
      setBoard(response.data);
      setNodes(generatePositionsIfMissing(response.data.nodes || []));
      setEdges(response.data.edges || []);
      setTheme(response.data.theme || 'dark');
      setLegend(response.data.legend || {});
    } catch (err) {
      console.error('Error fetching board:', err);
      setError('Failed to load board');
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonalMindMaps = async () => {
    try {
      const response = await axios.get('/api/auth/personal-mindmaps');
      const maps = response.data.mindMaps || [];
      setPersonalMindMaps(maps);
      return maps;
    } catch (err) {
      console.error('Error fetching personal mind maps:', err);
      return [];
    }
  };

  // Auto-redirect: For personal boards, regenerate the map immediately from the linked personal mind map
  useEffect(() => {
    const run = async () => {
      if (autoRouted) return;
      if (!board) return;
      if (board.type !== 'personal') return;
      setAutoRouted(true);

      let maps = personalMindMaps;
      if (!maps || maps.length === 0) maps = await fetchPersonalMindMaps();
      let map = null;
      if (board.importedFrom) map = maps.find(m => m._id === board.importedFrom) || null;
      if (!map) {
        // Fallback to building from board contents if original map not found
        map = {
          _id: board.importedFrom || board._id,
          name: board.title || 'Generated Map',
          context: 'recreational',
          nodes: board.nodes || [],
          edges: board.edges || [],
          legend: board.legend || {},
          connectionTypes: board.connectionTypes || []
        };
      }
      navigate(`/generated-map?mid=${encodeURIComponent(map._id || board._id)}`, { state: { mindMap: map } });
    };
    run();
  }, [board, personalMindMaps, autoRouted, navigate]);

  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on existing node
    const clickedNode = nodes.find(node => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) <= 30;
    });

    if (clickedNode) {
      setSelectedNode(clickedNode);
      return;
    }

    // If clicking on empty space, add new node
    if (board?.type === 'collective' || (board?.type === 'personal' && personalMindMaps.length > 0)) {
      const newNode = {
        id: `node-${Date.now()}`,
        x,
        y,
        label: 'New Node',
        color: '#FF6B9D',
        description: ''
      };
      setNodes([...nodes, newNode]);
      setNodeForm({ label: 'New Node', color: '#FF6B9D', description: '' });
      setShowNodeModal(true);
    } else if (board?.type === 'personal' && personalMindMaps.length === 0) {
      setShowMindMapSelector(true);
    }
  };

  const handleNodeDrag = (e) => {
    if (!selectedNode) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setNodes(nodes.map(node => 
      node.id === selectedNode.id 
        ? { ...node, x: x - dragOffset.x, y: y - dragOffset.y }
        : node
    ));
  };

  const handleNodeMouseDown = (e, node) => {
    e.stopPropagation();
    setSelectedNode(node);
    setIsDragging(true);
    
    const rect = canvasRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left - node.x,
      y: e.clientY - rect.top - node.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleNodeSubmit = async () => {
    if (!nodeForm.label.trim()) return;

    const updatedNodes = nodes.map(node => 
      node.id === selectedNode?.id 
        ? { ...node, ...nodeForm }
        : node
    );

    setNodes(updatedNodes);
    setShowNodeModal(false);
    setSelectedNode(null);
    await saveBoard({ nodes: updatedNodes });
  };

  const handleEdgeSubmit = async () => {
    if (!edgeForm.from || !edgeForm.to || !edgeForm.type) return;

    const newEdge = {
      id: `edge-${Date.now()}`,
      from: edgeForm.from,
      to: edgeForm.to,
      type: edgeForm.type,
      color: edgeForm.color
    };

    const updatedEdges = [...edges, newEdge];
    setEdges(updatedEdges);
    setShowEdgeModal(false);
    setEdgeForm({ from: '', to: '', type: '', color: '#4FD1C5' });
    await saveBoard({ edges: updatedEdges });
  };

  const saveBoard = async (updates) => {
    try {
      await axios.put(`/api/boards/${id}`, {
        ...updates,
        theme
      });
    } catch (err) {
      console.error('Error saving board:', err);
      alert('Failed to save board');
    }
  };

  const handleThemeChange = async (newTheme) => {
    setTheme(newTheme);
    await saveBoard({ theme: newTheme });
  };

  const handleMindMapImport = (mindMap) => {
    const computedNodes = generatePositionsIfMissing(mindMap.nodes || []);
    setNodes(computedNodes);
    setEdges(mindMap.edges || []);
    setLegend(mindMap.legend || {});
    setShowMindMapSelector(false);
    saveBoard({ 
      nodes: computedNodes, 
      edges: mindMap.edges || [],
      legend: mindMap.legend || {},
      importedFrom: mindMap._id 
    });
  };

  const renderNode = (node) => {
    const isSelected = selectedNode?.id === node.id;
    
    return (
      <div
        key={node.id}
        className={`node ${isSelected ? 'selected' : ''}`}
        style={{
          left: node.x - 30,
          top: node.y - 30,
          backgroundColor: node.color,
          borderColor: isSelected ? '#FF6B9D' : node.color
        }}
        onMouseDown={(e) => handleNodeMouseDown(e, node)}
      >
        <div className="node-label">{node.label}</div>
        {node.description && (
          <div className="node-description">{node.description}</div>
        )}
      </div>
    );
  };

  const renderEdge = (edge) => {
    const fromNode = nodes.find(n => n.id === edge.from);
    const toNode = nodes.find(n => n.id === edge.to);
    
    if (!fromNode || !toNode) return null;

    return (
      <svg
        key={edge.id}
        className="edge"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1
        }}
      >
        <line
          x1={fromNode.x}
          y1={fromNode.y}
          x2={toNode.x}
          y2={toNode.y}
          stroke={edge.color}
          strokeWidth="3"
          strokeDasharray={edge.type === 'dashed' ? '5,5' : 'none'}
        />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="board-editor-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading board editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="board-editor-container">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/owner')}>Back to Boards</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`board-editor-container ${theme}`}>
      <div className="board-editor-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/owner')}>
            ← Back to Boards
          </button>
          <h1>{board?.title}</h1>
          <p>{board?.description}</p>
        </div>
        
        <div className="header-right">
          <div className="theme-selector">
            <label>Theme:</label>
            <select value={theme} onChange={(e) => handleThemeChange(e.target.value)}>
              <option value="dark">Dark Bubbled</option>
              <option value="light">White</option>
            </select>
          </div>
          
          <div className="board-stats">
            <span>{nodes.length} nodes</span>
            <span>{edges.length} connections</span>
          </div>
        </div>
      </div>

      <div className="board-editor-toolbar">
        <div className="toolbar-left">
          <button 
            className="toolbar-btn"
            onClick={() => setShowNodeModal(true)}
          >
            ➕ Add Node
          </button>
          <button 
            className="toolbar-btn"
            onClick={() => setShowEdgeModal(true)}
            disabled={nodes.length < 2}
          >
            🔗 Add Connection
          </button>
          {board?.type === 'personal' && (
            <button 
              className="toolbar-btn"
              onClick={() => setShowMindMapSelector(true)}
            >
              🧠 Import Mind Map
            </button>
          )}
        </div>
        
        <div className="toolbar-right">
          <button 
            className="toolbar-btn save-btn"
            onClick={() => saveBoard({ nodes, edges })}
          >
            💾 Save Board
          </button>
        </div>
      </div>

      <div className="board-canvas-container">
        <div 
          ref={canvasRef}
          className="board-canvas"
          onClick={handleCanvasClick}
          onMouseMove={isDragging ? handleNodeDrag : undefined}
          onMouseUp={handleMouseUp}
        >
          {edges.map(renderEdge)}
          {nodes.map(renderNode)}
        </div>
      </div>

      {/* Node Modal */}
      {showNodeModal && (
        <div className="modal-overlay" onClick={() => setShowNodeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Node</h3>
            <div className="form-group">
              <label>Label:</label>
              <input
                type="text"
                value={nodeForm.label}
                onChange={(e) => setNodeForm({...nodeForm, label: e.target.value})}
                placeholder="Enter node label"
              />
            </div>
            <div className="form-group">
              <label>Color:</label>
              <input
                type="color"
                value={nodeForm.color}
                onChange={(e) => setNodeForm({...nodeForm, color: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Description:</label>
              <textarea
                value={nodeForm.description}
                onChange={(e) => setNodeForm({...nodeForm, description: e.target.value})}
                placeholder="Enter node description"
                rows="3"
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowNodeModal(false)}>Cancel</button>
              <button onClick={handleNodeSubmit}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Edge Modal */}
      {showEdgeModal && (
        <div className="modal-overlay" onClick={() => setShowEdgeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add Connection</h3>
            <div className="form-group">
              <label>From Node:</label>
              <select
                value={edgeForm.from}
                onChange={(e) => setEdgeForm({...edgeForm, from: e.target.value})}
              >
                <option value="">Select source node</option>
                {nodes.map(node => (
                  <option key={node.id} value={node.id}>{node.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>To Node:</label>
              <select
                value={edgeForm.to}
                onChange={(e) => setEdgeForm({...edgeForm, to: e.target.value})}
              >
                <option value="">Select target node</option>
                {nodes.map(node => (
                  <option key={node.id} value={node.id}>{node.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Connection Type:</label>
              <select
                value={edgeForm.type}
                onChange={(e) => setEdgeForm({...edgeForm, type: e.target.value})}
              >
                <option value="">Select type</option>
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
              </select>
            </div>
            <div className="form-group">
              <label>Color:</label>
              <input
                type="color"
                value={edgeForm.color}
                onChange={(e) => setEdgeForm({...edgeForm, color: e.target.value})}
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowEdgeModal(false)}>Cancel</button>
              <button onClick={handleEdgeSubmit}>Add Connection</button>
            </div>
          </div>
        </div>
      )}

      {/* Mind Map Selector Modal */}
      {showMindMapSelector && (
        <div className="modal-overlay" onClick={() => setShowMindMapSelector(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Select Personal Mind Map</h3>
            <p>Choose a personal mind map to import into this board:</p>
            <div className="mindmap-list">
              {personalMindMaps.map(mindMap => (
                <div 
                  key={mindMap._id} 
                  className="mindmap-item"
                  onClick={() => handleMindMapImport(mindMap)}
                >
                  <h4>{mindMap.name}</h4>
                  <p>{mindMap.context} • {mindMap.nodes?.length || 0} nodes</p>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowMindMapSelector(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardEditor;
