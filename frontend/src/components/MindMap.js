import React, { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network/standalone';
import { DataSet } from 'vis-data/standalone';
import './MindMap.css';

const MindMap = ({ 
  isPersonalLayer = true, 
  userId = null, 
  onNodeClick = null,
  onZoomChange = null 
}) => {
  const networkRef = useRef(null);
  const containerRef = useRef(null);
  const [nodes, setNodes] = useState(new DataSet([]));
  const [edges, setEdges] = useState(new DataSet([]));
  const [currentZoom, setCurrentZoom] = useState(1);

  // Constants for configuration
  const PERSONAL_LAYER_ZOOM_THRESHOLD = 0.5;
  const GROUP_LAYER_ZOOM_THRESHOLD = 1.5;
  const DEFAULT_NODE_SIZE = 20;
  const DEFAULT_EDGE_WIDTH = 2;

  // Utility function to generate connections based on shared tags
  const generateTagBasedConnections = (nodes) => {
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
        
        // Only create connection if nodes share at least one tag
        if (sharedTags.length > 0) {
          connections.push({
            from: node1.id,
            to: node2.id,
            label: sharedTags[0], // Use the first shared tag as the label
            color: node1.color,
            width: DEFAULT_EDGE_WIDTH,
            title: `Connected by: ${sharedTags.join(', ')}`
          });
        }
      }
    }
    
    return connections;
  };

  // Sample data for demonstration - replace with API calls
  const getPersonalNodes = () => [
    { 
      id: 1, 
      label: 'Photography', 
      color: '#FF6B6B',
      tags: ['hobby', 'creative', 'art'],
      size: DEFAULT_NODE_SIZE,
      group: 'hobby'
    },
    { 
      id: 2, 
      label: 'Cooking', 
      color: '#4ECDC4',
      tags: ['hobby', 'life-skill', 'creative'],
      size: DEFAULT_NODE_SIZE,
      group: 'hobby'
    },
    { 
      id: 3, 
      label: 'Travel Memory: Japan', 
      color: '#45B7D1',
      tags: ['memory', 'travel', 'culture'],
      size: DEFAULT_NODE_SIZE,
      group: 'memory'
    },
    { 
      id: 4, 
      label: 'Programming', 
      color: '#96CEB4',
      tags: ['skill', 'career', 'technology'],
      size: DEFAULT_NODE_SIZE,
      group: 'skill'
    }
  ];

  const getPersonalEdges = () => {
    const personalNodes = getPersonalNodes();
    return generateTagBasedConnections(personalNodes);
  };

  const getGroupNodes = () => [
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
  ];

  const getGroupEdges = () => {
    const groupNodes = getGroupNodes();
    return generateTagBasedConnections(groupNodes);
  };

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
      color: { color: '#848484', highlight: '#FF6B6B' },
      smooth: {
        type: 'continuous',
        forceDirection: 'none',
        roundness: 0.4
      },
      font: {
        size: 12,
        color: '#343434',
        background: 'rgba(255,255,255,0.8)',
        strokeWidth: 2,
        strokeColor: '#ffffff',
        multi: true,
        bold: true
      },
      length: 200,
      scaling: {
        min: 1,
        max: 3,
        label: {
          enabled: true,
          min: 10,
          max: 16,
          maxVisible: 16,
          drawThreshold: 1
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

  // Initialize network
  useEffect(() => {
    if (!containerRef.current) return;

    // Load appropriate data based on layer
    const nodeData = isPersonalLayer ? getPersonalNodes() : getGroupNodes();
    const edgeData = isPersonalLayer ? getPersonalEdges() : getGroupEdges();

    setNodes(new DataSet(nodeData));
    setEdges(new DataSet(edgeData));

    const data = {
      nodes: new DataSet(nodeData),
      edges: new DataSet(edgeData)
    };

    const options = getNetworkOptions();

    // Create network instance
    networkRef.current = new Network(containerRef.current, data, options);

    // Event listeners
    networkRef.current.on('click', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const node = nodes.get(nodeId);
        if (onNodeClick) {
          onNodeClick(node);
        }
      }
    });

    networkRef.current.on('zoom', (params) => {
      const newZoom = params.scale;
      setCurrentZoom(newZoom);
      
      if (onZoomChange) {
        onZoomChange(newZoom);
      }

      // Auto-switch layers based on zoom level
      if (isPersonalLayer && newZoom < PERSONAL_LAYER_ZOOM_THRESHOLD) {
        // Switch to group layer
        console.log('Switching to group layer');
      } else if (!isPersonalLayer && newZoom > GROUP_LAYER_ZOOM_THRESHOLD) {
        // Switch to personal layer
        console.log('Switching to personal layer');
      }
    });

    // Cleanup
    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
      }
    };
  }, [isPersonalLayer, userId, onNodeClick, onZoomChange]);

  // Update network when data changes
  useEffect(() => {
    if (networkRef.current) {
      networkRef.current.setData({ nodes, edges });
    }
  }, [nodes, edges]);

  return (
    <div className="mindmap-container">
      <div ref={containerRef} className="mindmap-canvas" />
      
      {/* Layer indicator */}
      <div className="mindmap-layer-indicator">
        {isPersonalLayer ? 'Personal Layer' : 'Group Layer'} | Zoom: {currentZoom.toFixed(2)}
      </div>
    </div>
  );
};

export default MindMap;
