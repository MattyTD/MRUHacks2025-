// Tag Color Utility
// Provides consistent color mapping for tags across the application

const TAG_COLORS = {
  // Hobbies & Interests
  'hobby': '#FF6B6B',        // Coral Red
  'creative': '#FF8C42',     // Orange
  'art': '#E74C3C',          // Red
  'music': '#E91E63',        // Pink
  'gaming': '#9B59B6',       // Purple
  'sports': '#F39C12',       // Gold
  'cooking': '#95A5A6',      // Gray
  
  // Skills & Career
  'skill': '#16A085',        // Teal
  'technology': '#6C5CE7',   // Indigo
  'career': '#00CED1',       // Dark Turquoise
  'programming': '#3498DB',  // Blue
  'photography': '#7F8C8D',  // Steel Gray
  
  // Memories & Experiences
  'memory': '#1ABC9C',       // Turquoise
  'travel': '#2ECC71',       // Green
  'culture': '#00B894',      // Emerald
  
  // Entertainment & Life
  'entertainment': '#FD79A8', // Light Pink
  'life-skill': '#10AC84',    // Sea Green
  
  // Default fallback color
  'default': '#34495E'        // Dark Blue Gray
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

