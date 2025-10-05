import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Network } from 'vis-network/standalone';
import { DataSet } from 'vis-data/standalone';
import Legend from '../components/Legend';
import '../components/DemoMindMap.css';

const GeneratedGroupMap = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mapData, setMapData] = useState(location.state?.mindMap || null);
  const queryMid = new URLSearchParams(location.search).get('mid') || null;
  const mindMap = mapData;

  // Ensure we always render the map matching the URL mid
  useEffect(() => {
    const load = async () => {
      if (!queryMid) return;
      if (mapData && mapData._id === queryMid) return;

      // 1) same-tab immediate open
      try {
        const fromSession = sessionStorage.getItem(`generatedMindMap:${queryMid}`);
        if (fromSession) {
          setMapData(JSON.parse(fromSession));
          return;
        }
      } catch (_) {}

      // 2) personal mind maps source
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/auth/personal-mindmaps', { headers: { 'x-auth-token': token } });
        const maps = res.data?.mindMaps || [];
        const found = maps.find(m => (m._id || '') === queryMid) || null;
        if (found) { setMapData(found); return; }
      } catch (_) {}

      // 3) fallback to board by id (collective board) and adapt shape
      try {
        const boardRes = await axios.get(`/api/boards/${queryMid}`);
        const b = boardRes.data || null;
        if (b) {
          const adapted = {
            _id: b._id || queryMid,
            name: b.title || 'Generated Map',
            context: 'professional',
            nodes: b.nodes || [],
            edges: b.edges || [],
            legend: b.legend || {},
            connectionTypes: b.connectionTypes || []
          };
          setMapData(adapted);
          return;
        }
      } catch (_) {}
    };
    load();
  }, [queryMid, mapData]);

  const networkRef = useRef(null);
  const containerRef = useRef(null);
  const nodesRef = useRef(new DataSet([]));
  const edgesRef = useRef(new DataSet([]));

  const [isPersonalLayer, setIsPersonalLayer] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(1);
  const [activeGroupNodeId, setActiveGroupNodeId] = useState(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isDoubleClickTransitionRef = useRef(false);

  const PERSONAL_LAYER_ZOOM_THRESHOLD = 0.5;
  const GROUP_LAYER_ZOOM_THRESHOLD = 1.5;

  // Helper: find highest ancestor for a node id
  const findRootAncestorId = useCallback((nodeId, allNodes) => {
    const idToNode = new Map(allNodes.map(n => [n.id, n]));
    let cur = idToNode.get(nodeId);
    if (!cur) return null;
    while (cur.parentId) {
      const next = idToNode.get(cur.parentId);
      if (!next) break;
      cur = next;
    }
    return cur?.id || null;
  }, []);

  // Root groups are top-level nodes from the personal mind map (with fallbacks)
  const rootGroupNodes = useMemo(() => {
    if (!mindMap) return [];
    const all = mindMap.nodes || [];
    // Primary: nodes with no parent or layer 0
    let roots = all.filter(n => (n.parentId ?? null) === null || (n.layer ?? 0) === 0);
    if (roots.length > 0) return roots;
    // Fallback: infer from edges' highest ancestors
    const edges = mindMap.edges || [];
    const idToNode = new Map(all.map(n => [n.id, n]));
    const rootIds = new Set();
    edges.forEach(e => {
      if (idToNode.has(e.from)) rootIds.add(findRootAncestorId(e.from, all));
      if (idToNode.has(e.to)) rootIds.add(findRootAncestorId(e.to, all));
    });
    roots = Array.from(rootIds).map(id => idToNode.get(id)).filter(Boolean);
    if (roots.length > 0) return roots;
    // Last resort: show first few nodes to avoid blank view
    return all.slice(0, Math.min(5, all.length));
  }, [mindMap, findRootAncestorId]);

  const getGroupNodes = useCallback(() => {
    // Represent each root node as a group node
    let raw = rootGroupNodes.map(root => ({
      id: root.id,
      label: root.label,
      color: root.color,
      size: 36,
      group: 'group-root',
      title: root.description || root.label
    }));
    // If still empty (e.g., empty map), show a placeholder node so page is never blank
    if (raw.length === 0 && mindMap) {
      raw = [{
        id: 'placeholder-root',
        label: mindMap.name || 'Mind Map',
        color: '#6EE7F9',
        size: 40,
        group: 'user',
        title: 'No nodes yet'
      }];
    }
    // De-duplicate by id (keep first)
    const seen = new Set();
    return raw.filter(n => {
      if (seen.has(n.id)) return false;
      seen.add(n.id);
      return true;
    });
  }, [rootGroupNodes]);

  const getGroupEdges = useCallback(() => {
    if (!mindMap) return [];
    const allNodes = mindMap.nodes || [];
    const allEdges = mindMap.edges || [];

    // Build connection type lookups
    const typeIdToColor = new Map();
    const typeIdToName = new Map();
    if (Array.isArray(mindMap.connectionTypes)) {
      mindMap.connectionTypes.forEach(t => {
        if (!t?.id) return;
        typeIdToColor.set(t.id, t.color);
        typeIdToName.set(t.id, t.name);
      });
    }
    if (mindMap.legend && typeof mindMap.legend === 'object') {
      Object.values(mindMap.legend).forEach(v => {
        if (v?.id) {
          if (!typeIdToColor.has(v.id)) typeIdToColor.set(v.id, v.color);
          if (!typeIdToName.has(v.id)) typeIdToName.set(v.id, v.name);
        }
      });
    }

    // Group by pair + connection type
    const pairTypeToEdges = new Map();
    allEdges.forEach(e => {
      const rootA = findRootAncestorId(e.from, allNodes);
      const rootB = findRootAncestorId(e.to, allNodes);
      if (!rootA || !rootB || rootA === rootB) return;
      const pair = rootA < rootB ? `${rootA}__${rootB}` : `${rootB}__${rootA}`;
      const typeKey = e.type || e.label || e.color || 'default';
      const key = `${pair}__${typeKey}`;
      if (!pairTypeToEdges.has(key)) pairTypeToEdges.set(key, { a: rootA, b: rootB, type: e.type, color: e.color, label: e.label, count: 0 });
      pairTypeToEdges.get(key).count += 1;
    });

    // We also need the ordering per pair so lines offset nicely
    const pairToKeys = new Map();
    Array.from(pairTypeToEdges.keys()).forEach(key => {
      const [ra, rb, ...rest] = key.split('__');
      const pair = `${ra}__${rb}`;
      if (!pairToKeys.has(pair)) pairToKeys.set(pair, []);
      pairToKeys.get(pair).push(key);
    });

    const result = [];
    pairToKeys.forEach(keys => {
      // deterministic order
      keys.sort();
      keys.forEach((key, idx) => {
        const info = pairTypeToEdges.get(key);
        const color = (info.type && typeIdToColor.get(info.type)) || info.color || '#A0AEC0';
        const label = (info.type && typeIdToName.get(info.type)) || info.label || '';
        const curvedType = idx % 2 === 0 ? 'curvedCW' : 'curvedCCW';
        const roundness = 0.18 + (Math.floor(idx / 2) * 0.18);
        result.push({
          id: `g-${key}`,
          from: info.a,
          to: info.b,
          color: { color, opacity: 0.9, hover: color, highlight: color },
          width: Math.min(6, 2 + Math.log2(1 + info.count)),
          title: label,
          smooth: { enabled: true, type: curvedType, roundness }
        });
      });
    });

    return result;
  }, [mindMap, findRootAncestorId]);

  const getPersonalNodes = useCallback((rootId) => {
    if (!mindMap) return [];
    const allNodes = mindMap.nodes || [];
    if (!rootId) return allNodes.map(n => ({
      id: n.id,
      label: n.label,
      color: n.color,
      size: 24,
      title: n.description || n.label
    }));

    // Include nodes whose root ancestor equals rootId
    const allowed = new Set();
    const idToNode = new Map(allNodes.map(n => [n.id, n]));
    for (const n of allNodes) {
      if (findRootAncestorId(n.id, allNodes) === rootId) allowed.add(n.id);
    }
    const raw = allNodes
      .filter(n => allowed.has(n.id) && n.id !== rootId) // exclude the outer parent node from inner layer
      .map(n => ({ id: n.id, label: n.label, color: n.color, size: 24, title: n.description || n.label }));
    // De-duplicate by id
    const seen = new Set();
    return raw.filter(n => { if (seen.has(n.id)) return false; seen.add(n.id); return true; });
  }, [mindMap, findRootAncestorId]);

  const getPersonalEdges = useCallback((rootId) => {
    if (!mindMap) return [];
    const allNodes = mindMap.nodes || [];
    const allEdges = mindMap.edges || [];

    // Build connection type color lookup from connectionTypes or legend
    const typeIdToColor = new Map();
    const typeIdToName = new Map();
    if (Array.isArray(mindMap.connectionTypes)) {
      mindMap.connectionTypes.forEach(t => {
        if (!t?.id) return;
        typeIdToColor.set(t.id, t.color);
        typeIdToName.set(t.id, t.name);
      });
    }
    if (mindMap.legend && typeof mindMap.legend === 'object') {
      Object.values(mindMap.legend).forEach(v => {
        if (v?.id) {
          if (!typeIdToColor.has(v.id)) typeIdToColor.set(v.id, v.color);
          if (!typeIdToName.has(v.id)) typeIdToName.set(v.id, v.name);
        }
      });
    }

    const allowed = new Set();
    if (rootId) {
      for (const n of allNodes) {
        if (findRootAncestorId(n.id, allNodes) === rootId) allowed.add(n.id);
      }
    }

    // Filter to inner set and exclude links touching the parent
    const innerEdges = allEdges.filter(e => !rootId || ((allowed.has(e.from) && allowed.has(e.to)) && e.from !== rootId && e.to !== rootId));

    // Group edges between the same pair to offset by connection type
    const pairToEdges = new Map();
    innerEdges.forEach(e => {
      const a = e.from;
      const b = e.to;
      const key = a < b ? `${a}__${b}` : `${b}__${a}`;
      if (!pairToEdges.has(key)) pairToEdges.set(key, []);
      pairToEdges.get(key).push(e);
    });

    const result = [];
    pairToEdges.forEach((edgesBetweenPair) => {
      // Sort by connection type id/name to keep deterministic ordering
      edgesBetweenPair.sort((e1, e2) => String(e1.type || e1.label || '').localeCompare(String(e2.type || e2.label || '')));
      edgesBetweenPair.forEach((e, idx) => {
        const color = typeIdToColor.get(e.type) || e.color || '#777';
        const label = typeIdToName.get(e.type) || e.label || '';
        const curvedType = idx % 2 === 0 ? 'curvedCW' : 'curvedCCW';
        const roundness = 0.1 + (Math.floor(idx / 2) * 0.18); // increase spread for additional types
        result.push({
          id: e.id || `${e.from}_${e.to}_${e.type || 't'}_${idx}`,
          from: e.from,
          to: e.to,
          color: { color, opacity: 0.9, highlight: color, hover: color },
          width: 3,
          title: label,
          smooth: { enabled: true, type: curvedType, roundness }
        });
      });
    });

    return result;
  }, [mindMap, findRootAncestorId]);

  const getNetworkOptions = () => ({
    autoResize: false,
    nodes: {
      shape: 'dot',
      font: { size: 16, color: '#343434', strokeWidth: 2, strokeColor: '#ffffff', bold: true },
      borderWidth: 3,
      scaling: { min: 12, max: 40 }
    },
    edges: {
      smooth: { enabled: true, type: 'curvedCW', roundness: 0.25 },
      // visually separate multiple edges between same nodes using different roundness
      arrows: { to: { enabled: false } }
    },
    physics: {
      enabled: true,
      stabilization: { iterations: 200, updateInterval: 25, fit: true },
      barnesHut: {
        gravitationalConstant: -800,
        centralGravity: 0.15,
        springLength: 160,
        springConstant: 0.03,
        damping: 0.4,
        avoidOverlap: 0.5
      }
    },
    interaction: { hover: true, tooltipDelay: 200, zoomView: true, dragView: true }
  });

  // Initialize network
  useEffect(() => {
    if (!containerRef.current || networkRef.current) return;
    if (!mindMap) return;

    // start in group layer
    setIsPersonalLayer(false);
    const initialNodes = getGroupNodes();
    const initialEdges = getGroupEdges();
    nodesRef.current.clear();
    edgesRef.current.clear();
    nodesRef.current.add(initialNodes);
    edgesRef.current.add(initialEdges);

    const options = getNetworkOptions();
    networkRef.current = new Network(containerRef.current, { nodes: nodesRef.current, edges: edgesRef.current }, options);

    // Stop physics after first stabilization to prevent constant bouncing
    networkRef.current.once('stabilizationIterationsDone', () => {
      if (networkRef.current) {
        networkRef.current.setOptions({ physics: false });
      }
    });

    networkRef.current.on('hoverNode', (params) => setHoveredNodeId(params.node));
    networkRef.current.on('blurNode', () => setHoveredNodeId(null));

    // Double-click to zoom into a group node
    networkRef.current.on('doubleClick', (params) => {
      if (params.nodes.length > 0 && !isPersonalLayer) {
        const nodeId = params.nodes[0];
        setActiveGroupNodeId(nodeId);
        isDoubleClickTransitionRef.current = true;
        setIsPersonalLayer(true);
        setTimeout(() => { isDoubleClickTransitionRef.current = false; }, 650);
      }
    });

    networkRef.current.on('zoom', (params) => setCurrentZoom(params.scale));

    // Manual resize handling to avoid ResizeObserver loop warnings
    const handleResize = () => {
      if (!networkRef.current) return;
      networkRef.current.redraw();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [mindMap, getGroupNodes, getGroupEdges]);

  // Smooth cross-fade transitions between layers
  useEffect(() => {
    if (!networkRef.current) return;
    if (!mindMap) return;

    const nextNodeData = isPersonalLayer 
      ? getPersonalNodes(activeGroupNodeId)
      : getGroupNodes();
    const nextEdgeData = isPersonalLayer 
      ? getPersonalEdges(activeGroupNodeId)
      : getGroupEdges();

    setIsTransitioning(true);

    // Determine start position (zooming into personal: use group node position)
    let startPosition = { x: 0, y: 0 };
    if (isPersonalLayer && activeGroupNodeId) {
      try {
        const positions = networkRef.current.getPositions([activeGroupNodeId]);
        if (positions[activeGroupNodeId]) startPosition = positions[activeGroupNodeId];
      } catch (e) {
        startPosition = { x: 0, y: 0 };
      }
    }

    // Remove any existing ghost nodes/edges
    const existingNodes = nodesRef.current.get();
    const ghostNodeIds = existingNodes.filter(n => n.id?.toString().startsWith('next-')).map(n => n.id);
    if (ghostNodeIds.length) nodesRef.current.remove(ghostNodeIds);
    const existingEdges = edgesRef.current.get();
    const ghostEdgeIds = existingEdges.filter(e => e.id?.toString().startsWith('next-edge-')).map(e => e.id);
    if (ghostEdgeIds.length) edgesRef.current.remove(ghostEdgeIds);

    // Create ghost layer
    const transitionNodes = nextNodeData.map(node => ({
      ...node,
      id: `next-${node.id}`,
      x: startPosition.x,
      y: startPosition.y,
      opacity: 0.0,
      physics: false,
      hidden: false
    }));
    const transitionEdges = nextEdgeData.map((edge, idx) => ({
      ...edge,
      id: `next-edge-${idx}`,
      from: `next-${edge.from}`,
      to: `next-${edge.to}`,
      opacity: 0.0,
      hidden: false
    }));

    nodesRef.current.add(transitionNodes);
    edgesRef.current.add(transitionEdges);

    // Fade-in animation
    const fadeSteps = 12;
    const fadeInterval = 40;
    let currentStep = 0;
    const fadeTimer = setInterval(() => {
      currentStep++;
      const progress = currentStep / fadeSteps;

      const updatedNodes = transitionNodes.map((node, index) => {
        const angle = (index / Math.max(1, nextNodeData.length)) * Math.PI * 2;
        const radius = 150 * progress;
        return {
          ...node,
          x: startPosition.x + Math.cos(angle) * radius,
          y: startPosition.y + Math.sin(angle) * radius,
          opacity: progress,
          physics: progress > 0.5
        };
      });
      const updatedEdges = transitionEdges.map(edge => ({ ...edge, opacity: progress * 0.8 }));
      nodesRef.current.update(updatedNodes);
      edgesRef.current.update(updatedEdges);

      if (currentStep >= fadeSteps) {
        clearInterval(fadeTimer);
        // Replace with real data
        nodesRef.current.clear();
        edgesRef.current.clear();
        // De-dupe nodes
        const seen = new Set();
        const uniqueNodes = nextNodeData.filter(n => { if (seen.has(n.id)) return false; seen.add(n.id); return true; });
        nodesRef.current.add(uniqueNodes);
        edgesRef.current.add(nextEdgeData);
        if (networkRef.current) {
          networkRef.current.setOptions({ physics: true });
          networkRef.current.stabilize();
          // Disable physics again after settle
          setTimeout(() => {
            if (networkRef.current) networkRef.current.setOptions({ physics: false });
          }, 400);
        }
        setIsTransitioning(false);
      }
    }, fadeInterval);

    return () => clearInterval(fadeTimer);
  }, [isPersonalLayer, activeGroupNodeId, mindMap, getPersonalNodes, getPersonalEdges, getGroupNodes, getGroupEdges]);

  // Zoom-based switching similar to demo
  useEffect(() => {
    if (isDoubleClickTransitionRef.current) return;
    if (isPersonalLayer && currentZoom < PERSONAL_LAYER_ZOOM_THRESHOLD) {
      setIsPersonalLayer(false);
      setActiveGroupNodeId(null);
    } else if (!isPersonalLayer && currentZoom > GROUP_LAYER_ZOOM_THRESHOLD && hoveredNodeId) {
      setActiveGroupNodeId(hoveredNodeId);
      setIsPersonalLayer(true);
    }
  }, [currentZoom, isPersonalLayer, hoveredNodeId]);

  const legendTags = useMemo(() => {
    if (!mindMap) return [];
    // Prefer explicit connectionTypes; fallback to legend map
    const types = mindMap.connectionTypes && mindMap.connectionTypes.length > 0
      ? mindMap.connectionTypes.map(t => ({ tag: t.name, color: t.color }))
      : Object.values(mindMap.legend || {}).map(v => ({ tag: v.name, color: v.color }));
    return types;
  }, [mindMap]);

  if (!mindMap) {
    return (
      <div className="demo-mindmap-container">
        <div className="demo-header">
          <h2>No mind map provided</h2>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="generated-page">
      <div className="demo-mindmap-container">
      <div className="demo-header">
        <h2 style={{ fontFamily: '\'Library 3 am\', cursive', color: '#FFE4ED' }}>{mindMap.name} — Generated Map</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)' }}>Zoom out for outer group (top-level), zoom in for inner group.</p>
      </div>
      <div ref={containerRef} className="demo-mindmap-canvas" />
      <div className="demo-layer-indicator">
        {isPersonalLayer ? `Inner Group: ${activeGroupNodeId || 'All'}` : 'Outer Group'} | Zoom: {currentZoom.toFixed(2)}
      </div>
      <Legend tags={legendTags} title="Connection Types" />
      <div className="demo-instructions">
        {isPersonalLayer ? 'Scroll to zoom out to outer group' : 'Hover and scroll to zoom into a group root'}
      </div>
      <button className="recenter-button" onClick={() => networkRef.current && networkRef.current.fit({ animation: { duration: 600, easingFunction: 'easeInOutQuad' } })} title="Recenter view">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      </button>
      </div>
    </div>
  );
};

export default GeneratedGroupMap;


