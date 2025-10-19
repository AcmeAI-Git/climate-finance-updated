// Utility functions to help maintain clean code

// Function to validate required props
export const validateRequiredProps = (props, required, componentName) => {
  const missing = required.filter(prop => props[prop] === undefined);
  // Removed process.env.NODE_ENV check to avoid no-undef error in browser
  if (missing.length > 0) {
    console.warn(`${componentName}: Missing required props: ${missing.join(', ')}`);
  }
};

// Function to clean object props (remove undefined/null)
export const cleanProps = (props) => {
  return Object.fromEntries(
    Object.entries(props).filter((entry) => entry[1] !== undefined && entry[1] !== null)
  );
}; 