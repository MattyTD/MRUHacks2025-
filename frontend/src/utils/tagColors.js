// Tag Color Utility
// Provides consistent color mapping for tags across the application

const TAG_COLORS = {
  // Hobbies
  'hobby': '#FF6B6B',
  'creative': '#FF8C42',
  'art': '#FF4757',
  'music': '#FF6348',
  'gaming': '#FF9FF3',
  'sports': '#FFA502',
  
  // Skills
  'skill': '#96CEB4',
  'technology': '#5F27CD',
  'career': '#00D2D3',
  'programming': '#54A0FF',
  
  // Memories
  'memory': '#45B7D1',
  'travel': '#48DBF B',
  'culture': '#0ABDE3',
  
  // Life
  'life-skill': '#10AC84',
  'entertainment': '#EE5A6F',
  
  // Default fallback color
  'default': '#95A5A6'
};

/**
 * Get color for a specific tag
 * @param {string} tag - The tag name
 * @returns {string} Hex color code
 */
export const getTagColor = (tag) => {
  const normalizedTag = tag?.toLowerCase().trim();
  return TAG_COLORS[normalizedTag] || TAG_COLORS.default;
};

/**
 * Get all unique tags from a list of nodes
 * @param {Array} nodes - Array of node objects with tags property
 * @returns {Array} Array of unique tag names
 */
export const getUniqueTags = (nodes) => {
  const tagSet = new Set();
  
  nodes.forEach(node => {
    if (node.tags && Array.isArray(node.tags)) {
      node.tags.forEach(tag => tagSet.add(tag));
    }
  });
  
  return Array.from(tagSet).sort();
};

/**
 * Get tag-color pairs for legend display
 * @param {Array} tags - Array of tag names
 * @returns {Array} Array of objects with tag and color properties
 */
export const getTagColorPairs = (tags) => {
  return tags.map(tag => ({
    tag,
    color: getTagColor(tag)
  }));
};

