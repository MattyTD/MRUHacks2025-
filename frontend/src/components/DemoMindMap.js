import React, { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network/standalone';
import { DataSet } from 'vis-data/standalone';

const DemoMindMap = ({ 
  isPersonalLayer = true, 
  onLayerChange = null 
}) => {
  const networkRef = useRef(null);
  const containerRef = useRef(null);
  const [nodes, setNodes] = useState(new DataSet([]));
  const [edges, setEdges] = useState(new DataSet([]));
  const [currentZoom, setCurrentZoom] = useState(1);

  // Constants for demo configuration
  const PERSONAL_LAYER_ZOOM_THRESHOLD = 0.5;
  const GROUP_LAYER_ZOOM_THRESHOLD = 1.5;
  const DEFAULT_NODE_SIZE = 25;
  const DEFAULT_EDGE_WIDTH = 3;

  // Demo data showing realistic personal connections
  const getPersonalNodes = () => [
    { 
      id: 1, 
      label: 'Photography', 
      color: '#FF6B6B',
      tags: ['hobby', 'creative', 'art'],
      size: DEFAULT_NODE_SIZE,
      group: 'hobby',
      title: 'Hobby: Photography\nTags: hobby, creative, art'
    },
    { 
      id: 2, 
      label: 'Cooking', 
      color: '#4ECDC4',
      tags: ['hobby', 'life-skill', 'creative'],
      size: DEFAULT_NODE_SIZE,
      group: 'hobby',
      title: 'Hobby: Cooking\nTags: hobby, life-skill, creative'
    },
    { 
      id: 3, 
      label: 'Japan Trip', 
      color: '#45B7D1',
      tags: ['memory', 'travel', 'culture'],
      size: DEFAULT_NODE_SIZE,
      group: 'memory',
      title: 'Memory: Japan Trip\nTags: memory, travel, culture'
    },
    { 
      id: 4, 
      label: 'Programming', 
      color: '#96CEB4',
      tags: ['skill', 'career', 'technology'],
      size: DEFAULT_NODE_SIZE,
      group: 'skill',
      title: 'Skill: Programming\nTags: skill, career, technology'
    },
    { 
      id: 5, 
      label: 'Music', 
      color: '#FECA57',
      tags: ['hobby', 'creative', 'art'],
      size: DEFAULT_NODE_SIZE,
      group: 'hobby',
      title: 'Hobby: Music\nTags: hobby, creative, art'
    },
    { 
      id: 6, 
      label: 'Gaming', 
      color: '#FF9FF3',
      tags: ['hobby', 'technology', 'entertainment'],
      size: DEFAULT_NODE_SIZE,
      group: 'hobby',
      title: 'Hobby: Gaming\nTags: hobby, technology, entertainment'
    }
  ];

  const getPersonalEdges = () => [
    { from: 1, to: 2, label: 'creative', color: '#FF6B6B', width: DEFAULT_EDGE_WIDTH },
    { from: 1, to: 3, label: 'culture', color: '#45B7D1', width: DEFAULT_EDGE_WIDTH },
    { from: 2, to: 3, label: 'experience', color: '#4ECDC4', width: DEFAULT_EDGE_WIDTH },
    { from: 4, to: 1, label: 'technology', color: '#96CEB4', width: DEFAULT_EDGE_WIDTH },
    { from: 1, to: 5, label: 'art', color: '#FECA57', width: DEFAULT_EDGE_WIDTH },
    { from: 4, to: 6, label: 'technology', color: '#FF9FF3', width: DEFAULT_EDGE_WIDTH },
    { from: 5, to: 6, label: 'entertainment', color: '#FECA57', width: DEFAULT_EDGE_WIDTH }
  ];

  // Demo data showing group connections
  const getGroupNodes = () => [
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
  ];

  const getGroupEdges = () => [
    { from: 'alice', to: 'bob', label: 'creative', color: '#FF6B6B', width: DEFAULT_EDGE_WIDTH },
    { from: 'bob', to: 'diana', label: 'music', color: '#4ECDC4', width: DEFAULT_EDGE_WIDTH },
    { from: 'alice', to: 'diana', label: 'art', color: '#45B7D1', width: DEFAULT_EDGE_WIDTH },
    { from: 'charlie', to: 'alice', label: 'technology', color: '#96CEB4', width: DEFAULT_EDGE_WIDTH },
    { from: 'charlie', to: 'bob', label: 'entertainment', color: '#FF9FF3', width: DEFAULT_EDGE_WIDTH }
  ];

  // Network options optimized for demo
  const getNetworkOptions = () => ({
    nodes: {
      shape: 'dot',
      font: {
        size: 16,
        color: '#343434',
        bold: true
      },
      borderWidth: 3,
      shadow: {
        enabled: true,
        color: 'rgba(0,0,0,0.2)',
        size: 10,
        x: 5,
        y: 5
      }
    },
    edges: {
      width: DEFAULT_EDGE_WIDTH,
      color: { 
        color: '#848484', 
        highlight: '#FF6B6B',
        hover: '#4ECDC4'
      },
      smooth: {
        type: 'continuous',
        forceDirection: 'none'
      },
      font: {
        size: 14,
        color: '#343434',
        background: 'rgba(255,255,255,0.8)',
        strokeWidth: 2,
        strokeColor: '#ffffff'
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
        avoidOverlap: 0.5
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
      randomSeed: 2
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
    networkRef.current.on('zoom', (params) => {
      const newZoom = params.scale;
      setCurrentZoom(newZoom);
      
      // Auto-switch layers based on zoom level
      if (isPersonalLayer && newZoom < PERSONAL_LAYER_ZOOM_THRESHOLD) {
        if (onLayerChange) {
          onLayerChange('group');
        }
      } else if (!isPersonalLayer && newZoom > GROUP_LAYER_ZOOM_THRESHOLD) {
        if (onLayerChange) {
          onLayerChange('personal');
        }
      }
    });

    // Cleanup
    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
      }
    };
  }, [isPersonalLayer, onLayerChange]);

  // Update network when data changes
  useEffect(() => {
    if (networkRef.current) {
      networkRef.current.setData({ nodes, edges });
    }
  }, [nodes, edges]);

  return (
    <div style={{ 
      width: '100%', 
      height: '500px', 
      border: '2px solid #e0e0e0', 
      borderRadius: '12px',
      position: 'relative',
      backgroundColor: '#fafafa',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          borderRadius: '10px'
        }} 
      />
      
      {/* Layer indicator */}
      <div style={{
        position: 'absolute',
        top: '15px',
        left: '15px',
        backgroundColor: 'rgba(0,123,255,0.9)',
        color: 'white',
        padding: '10px 15px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 'bold',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}>
        {isPersonalLayer ? 'Personal Layer' : 'Group Layer'} | Zoom: {currentZoom.toFixed(2)}
      </div>

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: '15px',
        right: '15px',
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        maxWidth: '200px'
      }}>
        {isPersonalLayer 
          ? 'Scroll to zoom out and see group connections'
          : 'Scroll to zoom in and explore personal maps'
        }
      </div>
    </div>
  );
};

export default DemoMindMap;
