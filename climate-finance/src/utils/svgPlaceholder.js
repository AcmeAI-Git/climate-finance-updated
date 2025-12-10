/**
 * Utility functions to generate SVG placeholder images
 */

/**
 * Generate a placeholder SVG with the given initials
 * @param {string} name - Name to extract initials from
 * @param {string} bgColor - Background color (hex code without #)
 * @param {string} textColor - Text color (hex code without #)
 * @param {number} size - Size of the SVG
 * @returns {string} - SVG data URI
 */
export const generateInitialsPlaceholder = (name, bgColor = '8B5CF6', textColor = 'FFFFFF', size = 64) => {
  const initials = name
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" fill="#${bgColor}" rx="${size/4}" />
      <text 
        x="50%" 
        y="50%" 
        dy=".1em" 
        fill="#${textColor}" 
        font-family="Arial, sans-serif" 
        font-size="${size/2}" 
        font-weight="bold" 
        text-anchor="middle" 
        dominant-baseline="middle"
      >
        ${initials}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/**
 * Generate a pattern-based placeholder SVG
 * @param {string} id - Unique identifier to generate consistent patterns
 * @param {string} baseColor - Base color for the pattern (hex code without #)
 * @param {number} size - Size of the SVG
 * @returns {string} - SVG data URI
 */
export const generatePatternPlaceholder = (id, baseColor = '8B5CF6', size = 64) => {
  // Use the id to generate a consistent pattern
  const hashCode = str => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  };
  
  const intToRGB = i => {
    const c = (i & 0x00FFFFFF)
      .toString(16)
      .toUpperCase();
    return '00000'.substring(0, 6 - c.length) + c;
  };
  
  const patternColor = intToRGB(hashCode(id));
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" fill="#${baseColor}" rx="${size/4}" />
      <path d="M0 0L${size} ${size}" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="2" />
      <path d="M0 ${size}L${size} 0" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="2" />
      <circle cx="${size/2}" cy="${size/2}" r="${size/4}" fill="#${patternColor}" fill-opacity="0.6" />
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/**
 * Generate an organizational logo placeholder based on organization type
 * @param {string} name - Organization name
 * @param {string|undefined} type - Organization type (Multilateral, Bilateral, etc.) - optional
 * @param {number} size - Size of the SVG
 * @returns {string} - SVG data URI
 */
export const generateOrganizationLogo = (name, type, size = 64) => {
  // Different colors based on organization type
  const typeColors = {
    'Multilateral': '7C3AED', // Purple
    'Bilateral': '2563EB',    // Blue
    'National': '059669',     // Green
    'Private': 'DC2626',      // Red
    'NGO': 'D97706',          // Amber
  };

  // Use default color if type is not provided or not found in typeColors
  const color = type && typeColors[type] ? typeColors[type] : '8B5CF6';
  return generateInitialsPlaceholder(name, color, 'FFFFFF', size);
};
