/**
 * @file formatters.js
 * @description Formatting and text processing utilities for Indian Rupee (INR) and Catalog Display
 */

/**
 * Format a number as Indian Rupee (INR - ₹)
 * @param {number} amount
 * @param {string} [currency='INR']
 * @returns {string}
 */
export function formatCurrency(amount, currency = 'INR') {
  if (typeof amount !== 'number' || Number.isNaN(amount)) {
    return '₹0';
  }
  // Format in Indian numbering system (e.g., ₹1,49,999 or ₹4,999)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a number with Indian numbering system commas
 * @param {number} num
 * @returns {string}
 */
export function formatNumber(num) {
  if (typeof num !== 'number' || Number.isNaN(num)) {
    return '0';
  }
  return new Intl.NumberFormat('en-IN').format(num);
}

/**
 * Return star representation object { full, half, empty, ratingFormatted }
 * @param {number} rating
 * @returns {{ full: number, hasHalf: boolean, empty: number, text: string }}
 */
export function getStarBreakdown(rating) {
  const clamped = Math.max(0, Math.min(5, Number(rating) || 0));
  const full = Math.floor(clamped);
  const decimal = clamped - full;
  const hasHalf = decimal >= 0.25 && decimal < 0.75;
  const roundedFull = decimal >= 0.75 ? full + 1 : full;
  const empty = Math.max(0, 5 - roundedFull - (hasHalf ? 1 : 0));

  return {
    full: roundedFull,
    hasHalf,
    empty,
    text: clamped.toFixed(1),
  };
}

/**
 * Sanitize search input
 * @param {string} input
 * @returns {string}
 */
export function sanitizeSearchTerm(input) {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Create a debounced function
 * @param {Function} func
 * @param {number} wait
 * @returns {Function}
 */
export function debounce(func, wait = 300) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), wait);
  };
}
