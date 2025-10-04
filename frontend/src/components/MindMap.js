import React, { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network/standalone';
import { DataSet } from 'vis-data/standalone';

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

  const getPersonalEdges = () => [
    { from: 1, to: 2, label: 'creative', color: '#FF6B6B', width: DEFAULT_EDGE_WIDTH },
    { from: 1, to: 3, label: 'culture', color: '#45B7D1', width: DEFAULT_EDGE_WIDTH },
    { from: 2, to: 3, label: 'experience', color: '#4ECDC4', width: DEFAULT_EDGE_WIDTH },
    { from: 4, to: 1, label: 'technology', color: '#96CEB4', width: DEFAULT_EDGE_WIDTH }
  ];

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

  const getGroupEdges = () => [
    { from: 'user1', to: 'user2', label: 'creative', color: '#FF6B6B', width: DEFAULT_EDGE_WIDTH },
    { from: 'user2', to: 'user3', label: 'technology', color: '#4ECDC4', width: DEFAULT_EDGE_WIDTH },
    { from: 'user1', to: 'user3', label: 'art', color: '#45B7D1', width: DEFAULT_EDGE_WIDTH }
  ];

  // Network options based on layer type
  const getNetworkOptions = () => ({
    nodes: {
      shape: 'dot',
      font: {
        size: 14,
        color: '#343434'
      },
      borderWidth: 2,
      shadow: true
    },
    edges: {
      width: DEFAULT_EDGE_WIDTH,
      color: { color: '#848484', highlight: '#FF6B6B' },
      smooth: {
        type: 'continuous'
      },
      font: {
        size: 12,
        color: '#343434'
      }
    },
    physics: {
      enabled: true,
      stabilization: { iterations: 100 },
      barnesHut: {
        gravitationalConstant: -2000,
        centralGravity: 0.3,
        springLength: 95,
        springConstant: 0.04,
        damping: 0.09
      }
    },
    interaction: {
      hover: true,
      tooltipDelay: 300,
      hideEdgesOnDrag: false,
      hideEdgesOnZoom: false
    },
    layout: {
      improvedLayout: true
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
  }, [isPersonalLayer, userId]);

  // Update network when data changes
  useEffect(() => {
    if (networkRef.current) {
      networkRef.current.setData({ nodes, edges });
    }
  }, [nodes, edges]);

  return (
    <div style={{ width: '100%', height: '600px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          backgroundColor: '#fafafa'
        }} 
      />
      
      {/* Layer indicator */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        {isPersonalLayer ? 'Personal Layer' : 'Group Layer'} | Zoom: {currentZoom.toFixed(2)}
      </div>
    </div>
  );
};

export default MindMap;
