import React, { useState, useRef, useEffect, useCallback } from 'react';
import './VisualMindMapEditor.css';

const VisualMindMapEditor = ({ onComplete, onCancel, initialData = null }) => {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState(null);
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [showLayerModal, setShowLayerModal] = useState(false);
  const [showConnectionLegendModal, setShowConnectionLegendModal] = useState(false);
  const [isDraggingFromToolbar, setIsDraggingFromToolbar] = useState(false);
  const [nodeForm, setNodeForm] = useState({ 
    label: '', 
    description: '', 
    color: '#FF6B9D', 
    layer: 1,
    parentId: null 
  });
  const [layers, setLayers] = useState([]);
  const [connectionTypes, setConnectionTypes] = useState([]);
  const [editingConnectionType, setEditingConnectionType] = useState(null);
  const [editingConnectionName, setEditingConnectionName] = useState('');
  const [selectedConnectionType, setSelectedConnectionType] = useState(null);
  const [mindMapName, setMindMapName] = useState(initialData?.name || '');
  const [mindMapContext, setMindMapContext] = useState(initialData?.context || 'recreational');
  const [showNameModal, setShowNameModal] = useState(!initialData);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, node: null });
  const [showConnectionTypeModal, setShowConnectionTypeModal] = useState(false);
  const [newConnectionType, setNewConnectionType] = useState({ name: '', color: '#FF6B9D' });
  const [connectionContextMenu, setConnectionContextMenu] = useState({ show: false, x: 0, y: 0, connectionType: null });
  const [isNodeToolSelected, setIsNodeToolSelected] = useState(false);
  const [legendWidth, setLegendWidth] = useState(250);
  const [isResizingLegend, setIsResizingLegend] = useState(false);
  const [currentLayer, setCurrentLayer] = useState(0);
  const [currentParentNode, setCurrentParentNode] = useState(null);
  const [showNodeSelectionModal, setShowNodeSelectionModal] = useState(false);
  const [connectionStartNode, setConnectionStartNode] = useState(null);
  const [showConnectionTypeSelectionModal, setShowConnectionTypeSelectionModal] = useState(false);
  const [pendingConnectionTarget, setPendingConnectionTarget] = useState(null);

  useEffect(() => {
    if (initialData) {
      setNodes(initialData.nodes || []);
      setEdges(initialData.edges || []);
      setMindMapName(initialData.name || '');
      setMindMapContext(initialData.context || 'recreational');
      // Load connection types from initial data, falling back to legend
      if (Array.isArray(initialData.connectionTypes) && initialData.connectionTypes.length > 0) {
        setConnectionTypes(initialData.connectionTypes);
      } else if (initialData.legend && typeof initialData.legend === 'object') {
        const fromLegend = Object.values(initialData.legend).map((entry) => ({
          id: entry.id || `type-${entry.name?.toLowerCase() || Date.now()}`,
          name: entry.name,
          color: entry.color,
          description: entry.description || 'Imported from legend'
        }));
        setConnectionTypes(fromLegend);
      }
      // Load layers if provided
      if (Array.isArray(initialData.layers)) {
        setLayers(initialData.layers);
      }
      setShowNameModal(false);
    }
  }, [initialData]);

  const handleCanvasClick = useCallback((e) => {
    // Close context menus if clicking on empty space
    setContextMenu({ show: false, x: 0, y: 0, node: null });
    setConnectionContextMenu({ show: false, x: 0, y: 0, connectionType: null });
    
    // If node tool is selected, create a node at click position
    if (isNodeToolSelected) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newNode = {
        id: `node-${Date.now()}`,
        x,
        y,
        label: 'New Node',
        description: '',
        color: '#FF6B9D',
        layer: currentLayer,
        radius: 40,
        parentId: currentParentNode?.id || null
      };
      
      setNodes([...nodes, newNode]);
      setNodeForm({ 
        label: 'New Node', 
        description: '', 
        color: '#FF6B9D', 
        layer: currentLayer,
        parentId: currentParentNode?.id || null 
      });
      setSelectedNode(newNode);
      setShowNodeModal(true);
      setIsNodeToolSelected(false); // Deselect after creating node
      return;
    }
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on existing node (only check visible nodes)
    const clickedNode = nodes.find(node => {
      const belongsToCurrentLayer = node.layer === currentLayer;
      const belongsToCurrentParent = currentParentNode ? node.parentId === currentParentNode.id : node.parentId === null;
      
      if (!belongsToCurrentLayer || !belongsToCurrentParent) return false;
      
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) <= node.radius;
    });

    if (clickedNode) {
      if (isConnecting && connectionStart && connectionStart.id !== clickedNode.id) {
        // Create connection
        const newEdge = {
          id: `edge-${Date.now()}`,
          from: connectionStart.id,
          to: clickedNode.id,
          type: selectedConnectionType?.id || 'relates',
          color: selectedConnectionType?.color || '#FF6B9D',
          label: selectedConnectionType?.name || 'Relates to'
        };
        setEdges([...edges, newEdge]);
        setIsConnecting(false);
        setConnectionStart(null);
        setSelectedConnectionType(null);
      } else {
        setSelectedNode(clickedNode);
      }
      return;
    }

    // Canvas click does nothing unless node tool is selected
  }, [nodes, edges, isConnecting, connectionStart, selectedConnectionType, isNodeToolSelected]);

  const handleNodeDoubleClick = useCallback((e, node) => {
    e.stopPropagation();
    
    // Navigate to the node's layer and set it as the current parent
    setCurrentLayer(node.layer + 1);
    setCurrentParentNode(node);
    setSelectedNode(node);
  }, []);

  const handleGoBackToParent = useCallback(() => {
    if (currentParentNode) {
      // Find the parent of the current parent
      const grandParent = nodes.find(n => n.id === currentParentNode.parentId);
      if (grandParent) {
        setCurrentParentNode(grandParent);
        setCurrentLayer(grandParent.layer + 1);
      } else {
        // Go back to root layer
        setCurrentParentNode(null);
        setCurrentLayer(0);
      }
    } else {
      // Already at root layer
      setCurrentLayer(0);
    }
  }, [currentParentNode, nodes]);

  const handleNodeSelectionForConnection = useCallback((targetNode) => {
    if (!connectionStartNode) return;
    
    // Check if there are any connection types available
    if (connectionTypes.length === 0) {
      alert('No connection types available. Please create a connection type first.');
      setShowNodeSelectionModal(false);
      setConnectionStartNode(null);
      return;
    }
    
    // Store the target node and show connection type selection modal
    setPendingConnectionTarget(targetNode);
    setShowNodeSelectionModal(false);
    setShowConnectionTypeSelectionModal(true);
  }, [connectionStartNode, connectionTypes]);

  const handleConnectionTypeSelection = useCallback((connectionType) => {
    if (!connectionStartNode || !pendingConnectionTarget) return;
    
    // Check if a connection of this type already exists between these nodes
    const existingConnection = edges.find(edge => 
      ((edge.from === connectionStartNode.id && edge.to === pendingConnectionTarget.id) ||
       (edge.from === pendingConnectionTarget.id && edge.to === connectionStartNode.id)) &&
      edge.type === connectionType.id
    );
    
    if (existingConnection) {
      alert(`A "${connectionType.name}" connection already exists between these nodes.`);
      setShowConnectionTypeSelectionModal(false);
      setConnectionStartNode(null);
      setPendingConnectionTarget(null);
      return;
    }
    
    // Create connection with the selected connection type
    const newEdge = {
      id: `edge-${Date.now()}`,
      from: connectionStartNode.id,
      to: pendingConnectionTarget.id,
      type: connectionType.id,
      color: connectionType.color,
      label: connectionType.name
    };
    
    setEdges(prev => [...prev, newEdge]);
    
    // Close modal and reset state
    setShowConnectionTypeSelectionModal(false);
    setConnectionStartNode(null);
    setPendingConnectionTarget(null);
  }, [connectionStartNode, pendingConnectionTarget, edges]);

  const handleNodeRightClick = useCallback((e, node) => {
    e.preventDefault();
    e.stopPropagation();
    
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      node: node
    });
  }, []);

  const handleContextMenuAction = useCallback((action) => {
    if (!contextMenu.node) return;
    
    if (action === 'edit') {
      setSelectedNode(contextMenu.node);
      setNodeForm({ 
        label: contextMenu.node.label, 
        description: contextMenu.node.description, 
        color: contextMenu.node.color, 
        layer: contextMenu.node.layer,
        parentId: contextMenu.node.parentId 
      });
      setShowNodeModal(true);
    } else if (action === 'delete') {
      setNodes(nodes.filter(n => n.id !== contextMenu.node.id));
      setEdges(edges.filter(e => e.from !== contextMenu.node.id && e.to !== contextMenu.node.id));
    } else if (action === 'connect') {
      // Show node selection popup for connections
      setShowNodeSelectionModal(true);
      setConnectionStartNode(contextMenu.node);
    }
    
    setContextMenu({ show: false, x: 0, y: 0, node: null });
  }, [contextMenu, nodes, edges]);

  const handleConnectionTypeRightClick = useCallback((e, connectionType) => {
    e.preventDefault();
    e.stopPropagation();
    
    setConnectionContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      connectionType: connectionType
    });
  }, []);

  const handleConnectionContextMenuAction = useCallback((action) => {
    if (!connectionContextMenu.connectionType) return;
    
    if (action === 'edit') {
      setNewConnectionType({ 
        name: connectionContextMenu.connectionType.name, 
        color: connectionContextMenu.connectionType.color 
      });
      setShowConnectionTypeModal(true);
      // Don't clear connectionContextMenu yet - we need it for the modal
    } else if (action === 'delete') {
      if (connectionTypes.length <= 1) {
        alert('You must have at least one connection type');
        return;
      }
      
      // Remove the connection type
      setConnectionTypes(connectionTypes.filter(type => type.id !== connectionContextMenu.connectionType.id));
      
      // Remove all edges that use this connection type
      setEdges(edges.filter(edge => edge.type !== connectionContextMenu.connectionType.id));
      
      setConnectionContextMenu({ show: false, x: 0, y: 0, connectionType: null });
    }
  }, [connectionContextMenu, connectionTypes, edges]);

  const handleNodeDrag = useCallback((e) => {
    if (!selectedNode || !isDragging) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setNodes(nodes.map(node => 
      node.id === selectedNode.id 
        ? { ...node, x: x - dragOffset.x, y: y - dragOffset.y }
        : node
    ));
  }, [selectedNode, isDragging, dragOffset, nodes]);

  const handleNodeMouseDown = useCallback((e, node) => {
    e.stopPropagation();
    setSelectedNode(node);
    setIsDragging(true);
    
    const rect = canvasRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left - node.x,
      y: e.clientY - rect.top - node.y
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleNodeSubmit = useCallback(() => {
    if (!nodeForm.label.trim() || !selectedNode) return;

    const updatedNodes = nodes.map(node => 
      node.id === selectedNode.id 
        ? { 
            ...node, 
            label: nodeForm.label,
            description: nodeForm.description,
            color: layers.find(l => l.id === nodeForm.layer)?.color || nodeForm.color,
            layer: nodeForm.layer,
            parentId: nodeForm.parentId
          }
        : node
    );

    setNodes(updatedNodes);
    setShowNodeModal(false);
    setSelectedNode(null);
  }, [nodeForm, selectedNode, nodes, layers]);

  const handleConnectNodes = useCallback(() => {
    if (nodes.length < 2) return;
    setShowConnectionLegendModal(true);
  }, [nodes.length]);

  const handleConnectionTypeSelect = useCallback((connectionType) => {
    setSelectedConnectionType(connectionType);
    setShowConnectionLegendModal(false);
    setIsConnecting(true);
    setConnectionStart(selectedNode);
    setIsNodeToolSelected(false); // Deselect node tool when selecting connection type
  }, [selectedNode]);

  const handleToolbarNodeDrag = useCallback((e) => {
    e.preventDefault();
    setIsDraggingFromToolbar(true);
    // Set drag data
    e.dataTransfer.setData('text/plain', 'node');
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  const handleToolbarNodeDragEnd = useCallback((e) => {
    setIsDraggingFromToolbar(false);
  }, []);

  const handleCanvasDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleCanvasDrop = useCallback((e) => {
    e.preventDefault();
    
    if (e.dataTransfer.getData('text/plain') === 'node') {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newNode = {
        id: `node-${Date.now()}`,
        x,
        y,
        label: 'New Node',
        description: '',
        color: '#FF6B9D',
        layer: 0,
        radius: 40,
        parentId: null
      };
      
      setNodes([...nodes, newNode]);
      setNodeForm({ 
        label: 'New Node', 
        description: '', 
        color: '#FF6B9D', 
        layer: 0,
        parentId: null 
      });
      setSelectedNode(newNode);
      setShowNodeModal(true);
    }
  }, [nodes]);

  const handleNodeToolClick = useCallback(() => {
    setIsNodeToolSelected(!isNodeToolSelected);
    setSelectedConnectionType(null); // Deselect connection type when selecting node tool
  }, [isNodeToolSelected]);

  const handleAddConnectionType = useCallback(() => {
    setNewConnectionType({ name: '', color: '#FF6B9D' });
    setShowConnectionTypeModal(true);
  }, []);

  const handleSaveConnectionType = useCallback(() => {
    if (!newConnectionType.name.trim()) return;
    
    // Check if we're editing an existing connection type
    const isEditing = connectionContextMenu.connectionType;
    
    if (isEditing) {
      // Update existing connection type
      setConnectionTypes(connectionTypes.map(type => 
        type.id === connectionContextMenu.connectionType.id 
          ? { ...type, name: newConnectionType.name.trim(), color: newConnectionType.color }
          : type
      ));
      setConnectionContextMenu({ show: false, x: 0, y: 0, connectionType: null });
    } else {
      // Create new connection type
      const connectionType = {
        id: `type-${Date.now()}`,
        name: newConnectionType.name.trim(),
        color: newConnectionType.color,
        description: 'Custom connection type'
      };
      setConnectionTypes([...connectionTypes, connectionType]);
    }
    
    setShowConnectionTypeModal(false);
    setNewConnectionType({ name: '', color: '#FF6B9D' });
  }, [newConnectionType, connectionTypes, connectionContextMenu]);

  const handleCancelConnectionType = useCallback(() => {
    setShowConnectionTypeModal(false);
    setNewConnectionType({ name: '', color: '#FF6B9D' });
    setConnectionContextMenu({ show: false, x: 0, y: 0, connectionType: null });
  }, []);

  const handleLegendResizeStart = useCallback((e) => {
    e.preventDefault();
    setIsResizingLegend(true);
  }, []);

  const handleLegendResize = useCallback((e) => {
    if (!isResizingLegend) return;
    
    const newWidth = e.clientX;
    const minWidth = 200;
    const maxWidth = 400;
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setLegendWidth(newWidth);
    }
  }, [isResizingLegend]);

  const handleLegendResizeEnd = useCallback(() => {
    setIsResizingLegend(false);
  }, []);

  const handleEditConnectionType = useCallback((connectionType) => {
    setEditingConnectionType(connectionType);
    setEditingConnectionName(connectionType.name);
  }, []);

  const handleSaveConnectionTypeEdit = useCallback(() => {
    if (!editingConnectionName.trim()) return;
    
    setConnectionTypes(connectionTypes.map(type => 
      type.id === editingConnectionType.id 
        ? { ...type, name: editingConnectionName.trim() }
        : type
    ));
    setEditingConnectionType(null);
    setEditingConnectionName('');
  }, [editingConnectionName, editingConnectionType, connectionTypes]);

  const handleCancelEditConnectionType = useCallback(() => {
    setEditingConnectionType(null);
    setEditingConnectionName('');
  }, []);

  const handleDeleteConnectionType = useCallback((connectionTypeId) => {
    if (connectionTypes.length <= 1) {
      alert('You must have at least one connection type');
      return;
    }
    setConnectionTypes(connectionTypes.filter(type => type.id !== connectionTypeId));
  }, [connectionTypes]);

  const handleLayerSubmit = useCallback(() => {
    // Layer management logic here
    setShowLayerModal(false);
  }, []);

  const handleSave = useCallback(() => {
    if (!mindMapName.trim()) {
      alert('Please enter a mind map name');
      return;
    }

    const mindMapData = {
      name: mindMapName.trim(),
      context: mindMapContext,
      nodes,
      edges,
      connectionTypes,
      layers,
      legend: connectionTypes.reduce((acc, connectionType) => {
        acc[connectionType.name.toLowerCase()] = {
          name: connectionType.name,
          color: connectionType.color,
          id: connectionType.id
        };
        return acc;
      }, {}),
      levels: Math.max(...nodes.map(node => node.layer || 0)) + 1
    };

    onComplete(mindMapData);
  }, [mindMapName, mindMapContext, nodes, edges, connectionTypes, layers, onComplete]);

  // Add mouse event listeners for legend resizing
  useEffect(() => {
    if (isResizingLegend) {
      const handleMouseMove = (e) => handleLegendResize(e);
      const handleMouseUp = () => handleLegendResizeEnd();
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizingLegend, handleLegendResize, handleLegendResizeEnd]);

  const renderNode = useCallback((node) => {
    // Only render nodes that belong to the current layer and parent
    const belongsToCurrentLayer = node.layer === currentLayer;
    const belongsToCurrentParent = currentParentNode ? node.parentId === currentParentNode.id : node.parentId === null;
    
    if (!belongsToCurrentLayer || !belongsToCurrentParent) {
      return null;
    }

    const layer = layers.find(l => l.id === node.layer);
    const isSelected = selectedNode?.id === node.id;
    const isConnectingFrom = isConnecting && connectionStart?.id === node.id;
    
    return (
      <div
        key={node.id}
        className={`node ${isSelected ? 'selected' : ''} ${isConnectingFrom ? 'connecting' : ''}`}
        style={{
          left: node.x - node.radius,
          top: node.y - node.radius,
          width: node.radius * 2,
          height: node.radius * 2,
          backgroundColor: node.color,
          borderColor: isSelected ? '#FF6B9D' : node.color,
          borderWidth: isSelected ? '3px' : '2px',
          zIndex: node.layer
        }}
        onMouseDown={(e) => handleNodeMouseDown(e, node)}
        onDoubleClick={(e) => handleNodeDoubleClick(e, node)}
        onContextMenu={(e) => handleNodeRightClick(e, node)}
      >
        <div className="node-content">
          <div className="node-label">{node.label}</div>
          {node.description && (
            <div className="node-description">{node.description}</div>
          )}
          <div className="node-layer">
            {node.layer === 0 ? 'Root' : `L${node.layer}`}
          </div>
        </div>
        {node.parentId && (
          <div className="node-parent-indicator">📁</div>
        )}
      </div>
    );
  }, [selectedNode, isConnecting, connectionStart, layers, handleNodeMouseDown, handleNodeDoubleClick, handleNodeRightClick, currentLayer, currentParentNode]);

  const renderEdge = useCallback((edge) => {
    const fromNode = nodes.find(n => n.id === edge.from);
    const toNode = nodes.find(n => n.id === edge.to);
    
    if (!fromNode || !toNode) return null;

    // Only render edges between nodes that are currently visible
    const fromNodeVisible = fromNode.layer === currentLayer && 
      (currentParentNode ? fromNode.parentId === currentParentNode.id : fromNode.parentId === null);
    const toNodeVisible = toNode.layer === currentLayer && 
      (currentParentNode ? toNode.parentId === currentParentNode.id : toNode.parentId === null);
    
    if (!fromNodeVisible || !toNodeVisible) return null;

    // Find all edges between the same two nodes to calculate offset
    const edgesBetweenSameNodes = edges.filter(e => 
      (e.from === edge.from && e.to === edge.to) || 
      (e.from === edge.to && e.to === edge.from)
    );
    
    // Calculate offset for multiple edges between same nodes
    const edgeIndex = edgesBetweenSameNodes.findIndex(e => e.id === edge.id);
    const totalEdges = edgesBetweenSameNodes.length;
    const offsetDistance = Math.max(10, totalEdges * 8); // Minimum 10px, then 8px per additional edge
    
    // Calculate perpendicular offset
    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return null; // Avoid division by zero
    
    // Perpendicular vector (rotated 90 degrees)
    const perpX = -dy / length;
    const perpY = dx / length;
    
    // Calculate offset for this specific edge
    const offsetX = perpX * (edgeIndex - (totalEdges - 1) / 2) * offsetDistance;
    const offsetY = perpY * (edgeIndex - (totalEdges - 1) / 2) * offsetDistance;
    
    // Apply offset to both start and end points
    const startX = fromNode.x + offsetX;
    const startY = fromNode.y + offsetY;
    const endX = toNode.x + offsetX;
    const endY = toNode.y + offsetY;

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
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke={edge.color}
          strokeWidth="3"
          strokeDasharray={edge.type === 'dashed' ? '5,5' : 'none'}
          markerEnd="url(#arrowhead)"
        />
      </svg>
    );
  }, [nodes, currentLayer, currentParentNode, edges]);

  const renderLayerIndicator = useCallback((layer) => {
    const layerNodes = nodes.filter(n => n.layer === layer.level);
    
    return (
      <div key={layer.id} className="layer-indicator" style={{ backgroundColor: layer.color }}>
        <div className="layer-info">
          <span className="layer-name">{layer.name}</span>
          <span className="layer-count">{layerNodes.length} nodes</span>
        </div>
        <div className="layer-description">{layer.description}</div>
      </div>
    );
  }, [nodes]);

  return (
    <div className="visual-mindmap-editor">
      {/* Name Modal */}
      {showNameModal && (
        <div className="modal-overlay" onClick={() => setShowNameModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create Your Personal Mind Map</h2>
            <div className="form-group">
              <label>Mind Map Name:</label>
              <input
                type="text"
                value={mindMapName}
                onChange={(e) => setMindMapName(e.target.value)}
                placeholder="Enter your mind map name"
              />
            </div>
            <div className="form-group">
              <label>Context:</label>
              <div className="context-options">
                <label>
                  <input
                    type="radio"
                    value="recreational"
                    checked={mindMapContext === 'recreational'}
                    onChange={() => setMindMapContext('recreational')}
                  />
                  🎮 Recreational
                </label>
                <label>
                  <input
                    type="radio"
                    value="professional"
                    checked={mindMapContext === 'professional'}
                    onChange={() => setMindMapContext('professional')}
                  />
                  💼 Professional
                </label>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowNameModal(false)}>Cancel</button>
              <button 
                onClick={() => setShowNameModal(false)}
                disabled={!mindMapName.trim()}
              >
                Start Creating
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Header */}
      <div className="editor-header">
        <div className="header-left">
          <h2>Visual Mind Map Editor</h2>
          <span className="mindmap-name">{mindMapName}</span>
        </div>
        <div className="header-right">
          <button 
            className="toolbar-btn"
            onClick={() => setShowLayerModal(true)}
          >
            🎨 Manage Layers
          </button>
          <button 
            className="toolbar-btn"
            onClick={handleConnectNodes}
            disabled={nodes.length < 2 || !selectedNode}
          >
            🔗 Connect Nodes
          </button>
          <button 
            className="toolbar-btn save-btn"
            onClick={handleSave}
          >
            💾 Save Mind Map
          </button>
          <button 
            className="toolbar-btn cancel-btn"
            onClick={onCancel}
          >
            ❌ Cancel
          </button>
        </div>
      </div>

      {/* Sidebar with Tools */}
      <div className="editor-sidebar" style={{ width: `${legendWidth}px` }}>
        <div className="sidebar-section">
          <h3>Create Nodes</h3>
          <div 
            className={`node-tool ${isNodeToolSelected ? 'selected' : ''}`}
            onClick={handleNodeToolClick}
            title={isNodeToolSelected ? "Click to deselect node tool" : "Click to select node tool, then click canvas to create nodes"}
          >
            <div className="node-tool-icon">⚪</div>
            <span>{isNodeToolSelected ? 'Selected' : 'Select Node Tool'}</span>
          </div>
        </div>

        <div className="sidebar-section">
          <h3>Connection Types</h3>
          <div className="connection-legend">
            {connectionTypes.map(connectionType => (
              <div
                key={connectionType.id}
                className={`connection-legend-item ${selectedConnectionType?.id === connectionType.id ? 'selected' : ''} ${editingConnectionType?.id === connectionType.id ? 'editing' : ''}`}
                onClick={() => !editingConnectionType && setSelectedConnectionType(connectionType)}
                onContextMenu={(e) => handleConnectionTypeRightClick(e, connectionType)}
                title={connectionType.description}
              >
                <div 
                  className="connection-color-square" 
                  style={{ backgroundColor: connectionType.color }}
                ></div>
                {editingConnectionType?.id === connectionType.id ? (
                  <input
                    type="text"
                    value={editingConnectionName}
                    onChange={(e) => setEditingConnectionName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveConnectionTypeEdit();
                      if (e.key === 'Escape') handleCancelEditConnectionType();
                    }}
                    autoFocus
                    className="connection-name-input"
                  />
                ) : (
                  <span className="connection-name">{connectionType.name}</span>
                )}
                <div className="connection-actions">
                  {editingConnectionType?.id === connectionType.id ? (
                    <>
                      <button 
                        className="edit-btn"
                        onClick={handleSaveConnectionTypeEdit}
                        title="Save"
                      >
                        ✓
                      </button>
                      <button 
                        className="edit-btn"
                        onClick={handleCancelEditConnectionType}
                        title="Cancel"
                      >
                        ✕
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            ))}
            <button 
              className="add-connection-btn"
              onClick={handleAddConnectionType}
              title="Add new connection type"
            >
              ➕ Add Type
            </button>
          </div>
        </div>
        <div 
          className="sidebar-resize-handle"
          onMouseDown={handleLegendResizeStart}
          title="Drag to resize sidebar width"
        ></div>
      </div>

      {/* Layer Indicators */}
      <div className="layer-indicators">
        {layers.map(renderLayerIndicator)}
      </div>

      {/* Canvas */}
      <div className="canvas-container">
        <div 
          ref={canvasRef}
          className="mindmap-canvas"
          onClick={handleCanvasClick}
          onMouseMove={isDragging ? handleNodeDrag : undefined}
          onMouseUp={handleMouseUp}
          onDragOver={handleCanvasDragOver}
          onDrop={handleCanvasDrop}
        >
          {/* Arrow marker definition */}
          <svg style={{ position: 'absolute', width: 0, height: 0 }}>
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="#4FD1C5"
                />
              </marker>
            </defs>
          </svg>

          {/* Render edges first (behind nodes) */}
          {edges.map(renderEdge)}
          
          {/* Render nodes */}
          {nodes.map(renderNode)}
        </div>
        {/* Floating Save Button - always accessible */}
        <button 
          className="floating-save-btn"
          onClick={handleSave}
          title="Save Personal Mind Map"
        >
          💾 Save
        </button>
      </div>

       {/* Context Menu */}
       {contextMenu.show && (
         <div 
           className="context-menu"
           style={{ left: contextMenu.x, top: contextMenu.y }}
         >
           <div className="context-menu-item" onClick={() => handleContextMenuAction('edit')}>
             <span className="icon">✏️</span>
             Edit Node
           </div>
           <div className="context-menu-item" onClick={() => handleContextMenuAction('connect')}>
             <span className="icon">🔗</span>
             Connect
           </div>
           <div className="context-menu-item" onClick={() => handleContextMenuAction('delete')}>
             <span className="icon">🗑️</span>
             Delete Node
           </div>
         </div>
       )}

       {/* Connection Context Menu */}
       {connectionContextMenu.show && (
         <div 
           className="context-menu"
           style={{ left: connectionContextMenu.x, top: connectionContextMenu.y }}
         >
           <div className="context-menu-item" onClick={() => handleConnectionContextMenuAction('edit')}>
             <span className="icon">✏️</span>
             Edit Connection Type
           </div>
           {connectionTypes.length > 1 && (
             <div className="context-menu-item" onClick={() => handleConnectionContextMenuAction('delete')}>
               <span className="icon">🗑️</span>
               Delete Connection Type
             </div>
           )}
         </div>
       )}

      {/* Connection Type Creation Modal */}
      {showConnectionTypeModal && (
        <div className="modal-overlay" onClick={handleCancelConnectionType}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{connectionContextMenu.connectionType ? 'Edit Connection Type' : 'Create New Connection Type'}</h3>
              <button className="close-btn" onClick={handleCancelConnectionType}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Connection Name:</label>
                <input
                  type="text"
                  value={newConnectionType.name}
                  onChange={(e) => setNewConnectionType({...newConnectionType, name: e.target.value})}
                  placeholder="Enter connection name"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Connection Color:</label>
                <div className="color-picker-container">
                  <input
                    type="color"
                    value={newConnectionType.color}
                    onChange={(e) => setNewConnectionType({...newConnectionType, color: e.target.value})}
                    className="color-picker"
                  />
                  <div 
                    className="color-preview"
                    style={{ backgroundColor: newConnectionType.color }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={handleCancelConnectionType}>
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handleSaveConnectionType}
                disabled={!newConnectionType.name.trim()}
              >
                {connectionContextMenu.connectionType ? 'Update Connection Type' : 'Create Connection Type'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Node Selection Modal for Connections */}
      {showNodeSelectionModal && (
        <div className="modal-overlay" onClick={() => setShowNodeSelectionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Select Node to Connect</h3>
              <button className="close-btn" onClick={() => setShowNodeSelectionModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Choose a node to connect to <strong>{connectionStartNode?.label}</strong>:</p>
              <div className="node-selection-list">
                {nodes
                  .filter(node => {
                    // Only show nodes in the current layer and parent
                    const belongsToCurrentLayer = node.layer === currentLayer;
                    const belongsToCurrentParent = currentParentNode ? node.parentId === currentParentNode.id : node.parentId === null;
                    return belongsToCurrentLayer && belongsToCurrentParent && node.id !== connectionStartNode?.id;
                  })
                  .map(node => (
                    <div 
                      key={node.id}
                      className="node-selection-item"
                      onClick={() => handleNodeSelectionForConnection(node)}
                    >
                      <div 
                        className="node-preview"
                        style={{ backgroundColor: node.color }}
                      ></div>
                      <span className="node-label">{node.label}</span>
                    </div>
                  ))}
              </div>
              {nodes.filter(node => {
                const belongsToCurrentLayer = node.layer === currentLayer;
                const belongsToCurrentParent = currentParentNode ? node.parentId === currentParentNode.id : node.parentId === null;
                return belongsToCurrentLayer && belongsToCurrentParent && node.id !== connectionStartNode?.id;
              }).length === 0 && (
                <p className="no-nodes-message">No other nodes available to connect to in this layer.</p>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowNodeSelectionModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connection Type Selection Modal */}
      {showConnectionTypeSelectionModal && (
        <div className="modal-overlay" onClick={() => setShowConnectionTypeSelectionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Select Connection Type</h3>
              <button className="close-btn" onClick={() => setShowConnectionTypeSelectionModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Choose a connection type for connecting <strong>{connectionStartNode?.label}</strong> to <strong>{pendingConnectionTarget?.label}</strong>:</p>
              <div className="connection-type-selection-list">
                {connectionTypes.map(connectionType => {
                  // Check if this connection type already exists between these nodes
                  const existingConnection = edges.find(edge => 
                    ((edge.from === connectionStartNode?.id && edge.to === pendingConnectionTarget?.id) ||
                     (edge.from === pendingConnectionTarget?.id && edge.to === connectionStartNode?.id)) &&
                    edge.type === connectionType.id
                  );
                  
                  const isDisabled = !!existingConnection;
                  
                  return (
                    <div 
                      key={connectionType.id}
                      className={`connection-type-selection-item ${isDisabled ? 'disabled' : ''}`}
                      onClick={() => !isDisabled && handleConnectionTypeSelection(connectionType)}
                      title={isDisabled ? `"${connectionType.name}" connection already exists between these nodes` : ''}
                    >
                      <div 
                        className="connection-type-preview"
                        style={{ backgroundColor: connectionType.color }}
                      ></div>
                      <span className="connection-type-label">{connectionType.name}</span>
                      {isDisabled && <span className="already-exists">✓ Already exists</span>}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowConnectionTypeSelectionModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
        <div className="instructions">
          <h3>How to Use:</h3>
          <ul>
            <li>Click node tool to select, then click canvas to create nodes</li>
            <li>Double-click nodes to navigate to lower level</li>
            <li>Right-click nodes for edit/delete/connect options</li>
            <li>Drag nodes to reposition them</li>
            <li>Right-click node → Connect → Select target → Choose connection type</li>
            <li>Right-click connection types to edit/delete them</li>
            <li>Manage layers to organize your mind map</li>
          </ul>
        </div>

      {/* Current Layer Display */}
      <div className="current-layer-display">
        <div className="layer-info">
          <span className="layer-label">Current Layer:</span>
          <span className="layer-value">L{currentLayer}</span>
        </div>
        {currentParentNode && (
          <div className="parent-info">
            <span className="parent-label">Parent:</span>
            <span className="parent-name">{currentParentNode.label}</span>
            <button 
              className="go-back-btn"
              onClick={handleGoBackToParent}
              title="Go back to parent layer"
            >
              ← Back
            </button>
          </div>
        )}
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
              <label>Description:</label>
              <textarea
                value={nodeForm.description}
                onChange={(e) => setNodeForm({...nodeForm, description: e.target.value})}
                placeholder="Enter node description"
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Node Color:</label>
              <div className="color-picker-container">
                <input
                  type="color"
                  value={nodeForm.color}
                  onChange={(e) => setNodeForm({...nodeForm, color: e.target.value})}
                  className="color-picker"
                />
                <span className="color-preview" style={{ backgroundColor: nodeForm.color }}></span>
              </div>
            </div>
            <div className="form-group">
              <label>Layer:</label>
              <select
                value={nodeForm.layer}
                onChange={(e) => setNodeForm({...nodeForm, layer: parseInt(e.target.value)})}
              >
                {layers.map(layer => (
                  <option key={layer.id} value={layer.id}>
                    {layer.name} - {layer.description}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Parent Node:</label>
              <select
                value={nodeForm.parentId || ''}
                onChange={(e) => setNodeForm({...nodeForm, parentId: e.target.value || null})}
              >
                <option value="">None (Root Level)</option>
                {nodes.filter(n => n.id !== selectedNode?.id).map(node => (
                  <option key={node.id} value={node.id}>
                    {node.label} (L{node.layer})
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowNodeModal(false)}>Cancel</button>
              <button onClick={handleNodeSubmit}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Layer Management Modal */}
      {showLayerModal && (
        <div className="modal-overlay" onClick={() => setShowLayerModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Manage Layers</h3>
            <div className="layers-list">
              {layers.map(layer => (
                <div key={layer.id} className="layer-item">
                  <div className="layer-color" style={{ backgroundColor: layer.color }}></div>
                  <div className="layer-details">
                    <div className="layer-name">{layer.name}</div>
                    <div className="layer-description">{layer.description}</div>
                  </div>
                  <div className="layer-count">
                    {nodes.filter(n => n.layer === layer.id).length} nodes
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowLayerModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Connection Legend Modal */}
      {showConnectionLegendModal && (
        <div className="modal-overlay" onClick={() => setShowConnectionLegendModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Select Connection Type</h3>
            <p>Choose the type of connection you want to create:</p>
            <div className="connection-types">
              {connectionTypes.map(connectionType => (
                <button
                  key={connectionType.id}
                  className="connection-type-btn"
                  style={{ borderColor: connectionType.color }}
                  onClick={() => handleConnectionTypeSelect(connectionType)}
                >
                  <div className="connection-color" style={{ backgroundColor: connectionType.color }}></div>
                  <div className="connection-details">
                    <div className="connection-name">{connectionType.name}</div>
                    <div className="connection-description">{connectionType.description}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowConnectionLegendModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualMindMapEditor;
