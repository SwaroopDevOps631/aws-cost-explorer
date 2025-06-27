
// Generate a consistent color for a given string using hash function
export const generateColorFromString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert hash to HSL color with good saturation and lightness
  const hue = Math.abs(hash) % 360;
  const saturation = 60 + (Math.abs(hash) % 30); // 60-90%
  const lightness = 45 + (Math.abs(hash) % 20); // 45-65%
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// Generate a palette of colors for an array of items
export const generateColorPalette = (items: string[]): string[] => {
  return items.map(item => generateColorFromString(item));
};

// Generate gradient colors with purple-blue theme but dynamic variations
export const generateGradientColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Purple to blue range with variations
  const purpleBlue = [
    '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95',
    '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a',
    '#a855f7', '#9333ea', '#7e22ce', '#6b21a8', '#581c87',
    '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af'
  ];
  
  return purpleBlue[Math.abs(hash) % purpleBlue.length];
};
