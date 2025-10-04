import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Network } from 'vis-network/standalone';
import { DataSet } from 'vis-data/standalone';
import { getTagColor, getUniqueTags } from '../utils/tagColors';
import Legend from './Legend';
import './MindMap.css';

const MindMap = ({ 
  isPersonalLayer = true, 
  userId = null, 
  onNodeClick = null,
  onZoomChange = null,
  onLayerChange = null 
}) => {
  const networkRef = useRef(null);
  const containerRef = useRef(null);
  const nodesRef = useRef(new DataSet([]));
  const edgesRef = useRef(new DataSet([]));
  const [currentZoom, setCurrentZoom] = useState(1);
  const [activeGroupNodeId, setActiveGroupNodeId] = useState(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);

  // Constants for configuration
  const PERSONAL_LAYER_ZOOM_THRESHOLD = 0.5;
  const GROUP_LAYER_ZOOM_THRESHOLD = 1.5;
  const DEFAULT_NODE_SIZE = 20;
  const DEFAULT_EDGE_WIDTH = 2;

  // Personal mind map data for each user - in production, this would come from API
  // Memoized to prevent recreation on every render
  const personalMindMaps = useMemo(() => ({
    'user1': [
      { 
        id: 'user1-1', 
        label: 'Photography', 
        color: '#FF6B6B',
        tags: ['hobby', 'creative', 'art'],
        size: DEFAULT_NODE_SIZE,
        group: 'hobby'
      },
      { 
        id: 'user1-2', 
        label: 'Travel Memory: Japan', 
        color: '#45B7D1',
        tags: ['memory', 'travel', 'culture'],
        size: DEFAULT_NODE_SIZE,
        group: 'memory'
      },
      { 
        id: 'user1-3', 
        label: 'Painting', 
        color: '#FECA57',
        tags: ['hobby', 'creative', 'art'],
        size: DEFAULT_NODE_SIZE,
        group: 'hobby'
      },
      { 
        id: 'user1-4', 
        label: 'Paris Memory', 
        color: '#A1C4FD',
        tags: ['memory', 'travel', 'culture'],
        size: DEFAULT_NODE_SIZE,
        group: 'memory'
      }
    ],
    'user2': [
      { 
        id: 'user2-1', 
        label: 'Cooking', 
        color: '#4ECDC4',
        tags: ['hobby', 'life-skill', 'creative'],
        size: DEFAULT_NODE_SIZE,
        group: 'hobby'
      },
      { 
        id: 'user2-2', 
        label: 'Guitar', 
        color: '#FECA57',
        tags: ['hobby', 'music', 'creative'],
        size: DEFAULT_NODE_SIZE,
        group: 'hobby'
      },
      { 
        id: 'user2-3', 
        label: 'Soccer', 
        color: '#96CEB4',
        tags: ['hobby', 'sports', 'health'],
        size: DEFAULT_NODE_SIZE,
        group: 'hobby'
      },
      { 
        id: 'user2-4', 
        label: 'Concert Memory', 
        color: '#FF9FF3',
        tags: ['memory', 'music', 'entertainment'],
        size: DEFAULT_NODE_SIZE,
        group: 'memory'
      }
    ],
    'user3': [
      { 
        id: 'user3-1', 
        label: 'Programming', 
        color: '#96CEB4',
        tags: ['skill', 'career', 'technology'],
        size: DEFAULT_NODE_SIZE,
        group: 'skill'
      },
      { 
        id: 'user3-2', 
        label: 'Gaming', 
        color: '#FF9FF3',
        tags: ['hobby', 'technology', 'entertainment'],
        size: DEFAULT_NODE_SIZE,
        group: 'hobby'
      },
      { 
        id: 'user3-3', 
        label: 'Hackathon Win', 
        color: '#FF6B6B',
        tags: ['memory', 'career', 'technology'],
        size: DEFAULT_NODE_SIZE,
        group: 'memory'
      },
      { 
        id: 'user3-4', 
        label: 'AI Research', 
        color: '#45B7D1',
        tags: ['skill', 'technology', 'career'],
        size: DEFAULT_NODE_SIZE,
        group: 'skill'
      }
    ]
  }), [DEFAULT_NODE_SIZE]);

  // Utility function to generate connections based on shared tags
  // Creates separate colored edges for each shared tag
  const generateTagBasedConnections = useCallback((nodes) => {
    const connections = [];
    const nodeArray = Array.isArray(nodes) ? nodes : nodes.get();
    
    for (let i = 0; i < nodeArray.length; i++) {
      for (let j = i + 1; j < nodeArray.length; j++) {
        const node1 = nodeArray[i];
        const node2 = nodeArray[j];
        
        // Find shared tags between the two nodes
        const sharedTags = node1.tags?.filter(tag => 
          node2.tags?.includes(tag)
        ) || [];
        
        // Create a separate edge for each shared tag with its specific color
        sharedTags.forEach((tag, index) => {
          connections.push({
            from: node1.id,
            to: node2.id,
            color: {
              color: getTagColor(tag),
              highlight: getTagColor(tag),
              hover: getTagColor(tag),
              opacity: 0.8
            },
            width: DEFAULT_EDGE_WIDTH,
            title: `Connection: ${tag}`,
            smooth: {
              type: 'curvedCW',
              roundness: 0.1 + (index * 0.15) // Offset multiple edges
            }
          });
        });
      }
    }
    
    return connections;
  }, [DEFAULT_EDGE_WIDTH]);

  // Get personal nodes for a specific user (or default if no user specified)
  const getPersonalNodes = useCallback((groupNodeId = null) => {
    const targetUserId = groupNodeId || userId || 'user1';
    return personalMindMaps[targetUserId] || personalMindMaps['user1'];
  }, [userId, personalMindMaps]);

  const getPersonalEdges = useCallback((groupNodeId = null) => {
    const personalNodes = getPersonalNodes(groupNodeId);
    return generateTagBasedConnections(personalNodes);
  }, [getPersonalNodes, generateTagBasedConnections]);

  const getGroupNodes = useCallback(() => [
    { 
      id: 'user1', 
      label: 'Alice\'s Mind', 
      color: '#FF6B6B',
      tags: ['photography', 'travel', 'art'],
      size: DEFAULT_NODE_SIZE * 2,
      group: 'user'
    },
    { 
      id: 'user2', 
      label: 'Bob\'s Mind', 
      color: '#4ECDC4',
      tags: ['cooking', 'music', 'sports'],
      size: DEFAULT_NODE_SIZE * 2,
      group: 'user'
    },
    { 
      id: 'user3', 
      label: 'Charlie\'s Mind', 
      color: '#45B7D1',
      tags: ['programming', 'gaming', 'technology'],
      size: DEFAULT_NODE_SIZE * 2,
      group: 'user'
    }
  ], [DEFAULT_NODE_SIZE]);

  const getGroupEdges = useCallback(() => {
    const groupNodes = getGroupNodes();
    return generateTagBasedConnections(groupNodes);
  }, [getGroupNodes, generateTagBasedConnections]);

  // Network options based on layer type
  const getNetworkOptions = () => ({
    nodes: {
      shape: 'dot',
      font: {
        size: 14,
        color: '#343434',
        strokeWidth: 2,
        strokeColor: '#ffffff',
        multi: true,
        bold: true
      },
      borderWidth: 2,
      shadow: {
        enabled: true,
        color: 'rgba(0,0,0,0.2)',
        size: 10,
        x: 5,
        y: 5
      },
      scaling: {
        min: 10,
        max: 30,
        label: {
          enabled: true,
          min: 14,
          max: 20,
          maxVisible: 20,
          drawThreshold: 5
        }
      }
    },
    edges: {
      width: DEFAULT_EDGE_WIDTH,
      smooth: {
        enabled: true,
        type: 'curvedCW',
        roundness: 0.2
      },
      length: 200,
      scaling: {
        min: 1,
        max: 3
      },
      arrows: {
        to: {
          enabled: false
        }
      }
    },
    physics: {
      enabled: true,
      stabilization: { 
        iterations: 200,
        updateInterval: 25
      },
      barnesHut: {
        gravitationalConstant: -2000,
        centralGravity: 0.3,
        springLength: 120,
        springConstant: 0.04,
        damping: 0.09,
        avoidOverlap: 1
      }
    },
    interaction: {
      hover: true,
      tooltipDelay: 300,
      hideEdgesOnDrag: false,
      hideEdgesOnZoom: false,
      zoomView: true,
      dragView: true
    },
    layout: {
      improvedLayout: true,
      randomSeed: 2,
      hierarchical: {
        enabled: false
      }
    }
  });

  // Initialize network once on mount
  useEffect(() => {
    if (!containerRef.current || networkRef.current) return;

    // Load initial data based on current layer (only if DataSet is empty)
    if (nodesRef.current.length === 0) {
      const initialNodeData = isPersonalLayer 
        ? getPersonalNodes(activeGroupNodeId) 
        : getGroupNodes();
      const initialEdgeData = isPersonalLayer 
        ? getPersonalEdges(activeGroupNodeId) 
        : getGroupEdges();

      nodesRef.current.add(initialNodeData);
      edgesRef.current.add(initialEdgeData);
    }

    const options = getNetworkOptions();

    // Create network instance with initial data
    networkRef.current = new Network(containerRef.current, {
      nodes: nodesRef.current,
      edges: edgesRef.current
    }, options);

    // Event listeners for hover detection
    networkRef.current.on('hoverNode', (params) => {
      setHoveredNodeId(params.node);
    });

    networkRef.current.on('blurNode', () => {
      setHoveredNodeId(null);
    });

    // Event listeners for click
    networkRef.current.on('click', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const node = nodesRef.current.get(nodeId);
        if (onNodeClick) {
          onNodeClick(node);
        }
      }
    });

    // Event listeners for zoom
    networkRef.current.on('zoom', (params) => {
      const newZoom = params.scale;
      setCurrentZoom(newZoom);
      
      if (onZoomChange) {
        onZoomChange(newZoom);
      }
    });

    // Cleanup
    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, [onNodeClick, onZoomChange]); // Only re-run if callbacks change

  // Handle zoom-based layer switching
  useEffect(() => {
    if (!onLayerChange) return;

    // Auto-switch layers based on zoom level AND if hovering over a node
    if (isPersonalLayer && currentZoom < PERSONAL_LAYER_ZOOM_THRESHOLD) {
      // Switch to group layer when zooming out from personal layer
      onLayerChange('group');
      setActiveGroupNodeId(null);
    } else if (!isPersonalLayer && currentZoom > GROUP_LAYER_ZOOM_THRESHOLD) {
      // Only switch to personal layer if hovering over a group node
      if (hoveredNodeId) {
        setActiveGroupNodeId(hoveredNodeId);
        onLayerChange('personal');
      }
    }
  }, [currentZoom, isPersonalLayer, hoveredNodeId, onLayerChange, PERSONAL_LAYER_ZOOM_THRESHOLD, GROUP_LAYER_ZOOM_THRESHOLD]);

  // Update network data when layer or active node changes
  useEffect(() => {
    if (!networkRef.current) return;

    // Get new data based on current layer
    const nodeData = isPersonalLayer 
      ? getPersonalNodes(activeGroupNodeId) 
      : getGroupNodes();
    const edgeData = isPersonalLayer 
      ? getPersonalEdges(activeGroupNodeId) 
      : getGroupEdges();

    // Update the DataSets
    nodesRef.current.clear();
    nodesRef.current.add(nodeData);
    edgesRef.current.clear();
    edgesRef.current.add(edgeData);

    // Let the network stabilize with smooth animation
    if (networkRef.current) {
      networkRef.current.stabilize();
    }
  }, [isPersonalLayer, activeGroupNodeId, getPersonalNodes, getPersonalEdges, getGroupNodes, getGroupEdges]);

  // Calculate unique tags for legend
  const legendTags = useMemo(() => {
    const nodeData = isPersonalLayer 
      ? getPersonalNodes(activeGroupNodeId) 
      : getGroupNodes();
    return getUniqueTags(nodeData);
  }, [isPersonalLayer, activeGroupNodeId, getPersonalNodes, getGroupNodes]);

  return (
    <div className="mindmap-container">
      <div ref={containerRef} className="mindmap-canvas" />
      
      {/* Layer indicator */}
      <div className="mindmap-layer-indicator">
        {isPersonalLayer 
          ? `Personal Layer: ${activeGroupNodeId ? activeGroupNodeId : 'Default'}` 
          : 'Group Layer'} | Zoom: {currentZoom.toFixed(2)}
      </div>

      {/* Legend */}
      <Legend tags={legendTags} title="Connection Tags" />
    </div>
  );
};

export default MindMap;
