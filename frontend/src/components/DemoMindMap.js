import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Network } from 'vis-network/standalone';
import { DataSet } from 'vis-data/standalone';
import { getTagColor, getUniqueTags } from '../utils/tagColors';
import Legend from './Legend';
import './DemoMindMap.css';

const DemoMindMap = ({ 
  isPersonalLayer = true, 
  onLayerChange = null 
}) => {
  const networkRef = useRef(null);
  const containerRef = useRef(null);
  const nodesRef = useRef(new DataSet([]));
  const edgesRef = useRef(new DataSet([]));
  const [currentZoom, setCurrentZoom] = useState(1);
  const [activeGroupNodeId, setActiveGroupNodeId] = useState(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);

  // Constants for demo configuration
  const PERSONAL_LAYER_ZOOM_THRESHOLD = 0.5;
  const GROUP_LAYER_ZOOM_THRESHOLD = 1.5;
  const DEFAULT_NODE_SIZE = 25;
  const DEFAULT_EDGE_WIDTH = 3;

  // Personal mind map data for each user (group node) - memoized to prevent recreation
  const personalMindMaps = useMemo(() => ({
    'alice': [
      { 
        id: 'alice-1', 
        label: 'Photography', 
        color: '#FF6B6B',
        tags: ['hobby', 'creative', 'art'],
        size: DEFAULT_NODE_SIZE,
        group: 'hobby',
        title: 'Hobby: Photography\nTags: hobby, creative, art'
      },
      { 
        id: 'alice-2', 
        label: 'Japan Trip', 
        color: '#45B7D1',
        tags: ['memory', 'travel', 'culture'],
        size: DEFAULT_NODE_SIZE,
        group: 'memory',
        title: 'Memory: Japan Trip\nTags: memory, travel, culture'
      },
      { 
        id: 'alice-3', 
        label: 'Painting', 
        color: '#FECA57',
        tags: ['hobby', 'creative', 'art'],
        size: DEFAULT_NODE_SIZE,
        group: 'hobby',
        title: 'Hobby: Painting\nTags: hobby, creative, art'
      },
      { 
        id: 'alice-4', 
        label: 'Paris Memory', 
        color: '#A1C4FD',
        tags: ['memory', 'travel', 'culture'],
        size: DEFAULT_NODE_SIZE,
        group: 'memory',
        title: 'Memory: Paris Trip\nTags: memory, travel, culture'
      }
    ],
    'bob': [
      { 
        id: 'bob-1', 
        label: 'Cooking', 
        color: '#4ECDC4',
        tags: ['hobby', 'life-skill', 'creative'],
        size: DEFAULT_NODE_SIZE,
        group: 'hobby',
        title: 'Hobby: Cooking\nTags: hobby, life-skill, creative'
      },
      { 
        id: 'bob-2', 
        label: 'Guitar', 
        color: '#FECA57',
        tags: ['hobby', 'music', 'creative'],
        size: DEFAULT_NODE_SIZE,
        group: 'hobby',
        title: 'Hobby: Guitar\nTags: hobby, music, creative'
      },
      { 
        id: 'bob-3', 
        label: 'Soccer', 
        color: '#96CEB4',
        tags: ['hobby', 'sports', 'health'],
        size: DEFAULT_NODE_SIZE,
        group: 'hobby',
        title: 'Hobby: Soccer\nTags: hobby, sports, health'
      },
      { 
        id: 'bob-4', 
        label: 'Concert Memory', 
        color: '#FF9FF3',
        tags: ['memory', 'music', 'entertainment'],
        size: DEFAULT_NODE_SIZE,
        group: 'memory',
        title: 'Memory: Rock Concert\nTags: memory, music, entertainment'
      }
    ],
    'charlie': [
      { 
        id: 'charlie-1', 
        label: 'Programming', 
        color: '#96CEB4',
        tags: ['skill', 'career', 'technology'],
        size: DEFAULT_NODE_SIZE,
        group: 'skill',
        title: 'Skill: Programming\nTags: skill, career, technology'
      },
      { 
        id: 'charlie-2', 
        label: 'Gaming', 
        color: '#FF9FF3',
        tags: ['hobby', 'technology', 'entertainment'],
        size: DEFAULT_NODE_SIZE,
        group: 'hobby',
        title: 'Hobby: Gaming\nTags: hobby, technology, entertainment'
      },
      { 
        id: 'charlie-3', 
        label: 'Hackathon Win', 
        color: '#FF6B6B',
        tags: ['memory', 'career', 'technology'],
        size: DEFAULT_NODE_SIZE,
        group: 'memory',
        title: 'Memory: Hackathon Victory\nTags: memory, career, technology'
      },
      { 
        id: 'charlie-4', 
        label: 'AI Research', 
        color: '#45B7D1',
        tags: ['skill', 'technology', 'career'],
        size: DEFAULT_NODE_SIZE,
        group: 'skill',
        title: 'Skill: AI Research\nTags: skill, technology, career'
      }
    ],
    'diana': [
      { 
        id: 'diana-1', 
        label: 'Digital Art', 
        color: '#FF6B6B',
        tags: ['hobby', 'creative', 'art'],
        size: DEFAULT_NODE_SIZE,
        group: 'hobby',
        title: 'Hobby: Digital Art\nTags: hobby, creative, art'
      },
      { 
        id: 'diana-2', 
        label: 'Piano', 
        color: '#FECA57',
        tags: ['hobby', 'music', 'creative'],
        size: DEFAULT_NODE_SIZE,
        group: 'hobby',
        title: 'Hobby: Piano\nTags: hobby, music, creative'
      },
      { 
        id: 'diana-3', 
        label: 'Museum Visit', 
        color: '#45B7D1',
        tags: ['memory', 'culture', 'art'],
        size: DEFAULT_NODE_SIZE,
        group: 'memory',
        title: 'Memory: Louvre Museum\nTags: memory, culture, art'
      },
      { 
        id: 'diana-4', 
        label: 'Art Exhibition', 
        color: '#A1C4FD',
        tags: ['memory', 'art', 'creative'],
        size: DEFAULT_NODE_SIZE,
        group: 'memory',
        title: 'Memory: First Exhibition\nTags: memory, art, creative'
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
  const getPersonalNodes = useCallback((userId = 'alice') => {
    return personalMindMaps[userId] || personalMindMaps['alice'];
  }, [personalMindMaps]);

  const getPersonalEdges = useCallback((userId = 'alice') => {
    const personalNodes = getPersonalNodes(userId);
    return generateTagBasedConnections(personalNodes);
  }, [getPersonalNodes, generateTagBasedConnections]);

  // Demo data showing group connections
  const getGroupNodes = useCallback(() => [
    { 
      id: 'alice', 
      label: 'Alice\'s Mind', 
      color: '#FF6B6B',
      tags: ['photography', 'travel', 'art', 'creative'],
      size: DEFAULT_NODE_SIZE * 2,
      group: 'user',
      title: 'Alice\'s Personal Map\nConnects through: photography, travel, art, creative'
    },
    { 
      id: 'bob', 
      label: 'Bob\'s Mind', 
      color: '#4ECDC4',
      tags: ['cooking', 'music', 'sports', 'creative'],
      size: DEFAULT_NODE_SIZE * 2,
      group: 'user',
      title: 'Bob\'s Personal Map\nConnects through: cooking, music, sports, creative'
    },
    { 
      id: 'charlie', 
      label: 'Charlie\'s Mind', 
      color: '#45B7D1',
      tags: ['programming', 'gaming', 'technology'],
      size: DEFAULT_NODE_SIZE * 2,
      group: 'user',
      title: 'Charlie\'s Personal Map\nConnects through: programming, gaming, technology'
    },
    { 
      id: 'diana', 
      label: 'Diana\'s Mind', 
      color: '#96CEB4',
      tags: ['art', 'music', 'creative', 'culture'],
      size: DEFAULT_NODE_SIZE * 2,
      group: 'user',
      title: 'Diana\'s Personal Map\nConnects through: art, music, creative, culture'
    }
  ], [DEFAULT_NODE_SIZE]);

  const getGroupEdges = useCallback(() => {
    const groupNodes = getGroupNodes();
    return generateTagBasedConnections(groupNodes);
  }, [getGroupNodes, generateTagBasedConnections]);

  // Network options optimized for demo
  const getNetworkOptions = () => ({
    nodes: {
      shape: 'dot',
      font: {
        size: 16,
        color: '#343434',
        strokeWidth: 2,
        strokeColor: '#ffffff',
        multi: true,
        bold: true
      },
      borderWidth: 3,
      shadow: {
        enabled: true,
        color: 'rgba(0,0,0,0.2)',
        size: 10,
        x: 5,
        y: 5
      },
      scaling: {
        min: 15,
        max: 35,
        label: {
          enabled: true,
          min: 16,
          max: 24,
          maxVisible: 24,
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
      length: 250,
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
      tooltipDelay: 200,
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

    // Event listeners for zoom
    networkRef.current.on('zoom', (params) => {
      const newZoom = params.scale;
      setCurrentZoom(newZoom);
    });

    // Cleanup
    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, []); // Empty dependency array - only run once

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
    <div className="demo-mindmap-container">
      <div ref={containerRef} className="demo-mindmap-canvas" />
      
      {/* Layer indicator */}
      <div className="demo-layer-indicator">
        {isPersonalLayer 
          ? `Personal Layer: ${activeGroupNodeId ? activeGroupNodeId.charAt(0).toUpperCase() + activeGroupNodeId.slice(1) : 'Default'}` 
          : 'Group Layer'} | Zoom: {currentZoom.toFixed(2)}
      </div>

      {/* Legend */}
      <Legend tags={legendTags} title="Connection Tags" />

      {/* Instructions */}
      <div className="demo-instructions">
        {isPersonalLayer 
          ? 'Scroll to zoom out and see group connections'
          : 'Hover over a user\'s mind node and scroll to zoom in'
        }
      </div>
    </div>
  );
};

export default DemoMindMap;
