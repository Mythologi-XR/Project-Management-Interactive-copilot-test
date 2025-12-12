/**
 * Utility functions module
 * @module utils
 */

// String Helpers

/**
 * Capitalizes the first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} The capitalized string
 */
function capitalize(str) {
  if (typeof str !== 'string') {
    throw new Error('Input must be a string');
  }
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Reverses a string
 * @param {string} str - The string to reverse
 * @returns {string} The reversed string
 */
function reverse(str) {
  if (typeof str !== 'string') {
    throw new Error('Input must be a string');
  }
  return str.split('').reverse().join('');
}

/**
 * Truncates a string to a specified length
 * @param {string} str - The string to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} The truncated string with ellipsis if needed
 */
function truncate(str, maxLength) {
  if (typeof str !== 'string') {
    throw new Error('Input must be a string');
  }
  if (typeof maxLength !== 'number' || maxLength < 0) {
    throw new Error('maxLength must be a positive number');
  }
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

// Number Helpers

/**
 * Clamps a number between min and max values
 * @param {number} num - The number to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} The clamped number
 */
function clamp(num, min, max) {
  if (typeof num !== 'number' || typeof min !== 'number' || typeof max !== 'number') {
    throw new Error('All arguments must be numbers');
  }
  return Math.min(Math.max(num, min), max);
}

/**
 * Checks if a number is even
 * @param {number} num - The number to check
 * @returns {boolean} True if even, false otherwise
 */
function isEven(num) {
  if (typeof num !== 'number') {
    throw new Error('Input must be a number');
  }
  return num % 2 === 0;
}

/**
 * Rounds a number to a specified number of decimal places
 * @param {number} num - The number to round
 * @param {number} decimals - Number of decimal places
 * @returns {number} The rounded number
 */
function roundTo(num, decimals) {
  if (typeof num !== 'number' || typeof decimals !== 'number') {
    throw new Error('Both arguments must be numbers');
  }
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

module.exports = {
  // String helpers
  capitalize,
  reverse,
  truncate,
  // Number helpers
  clamp,
  isEven,
  roundTo
};
