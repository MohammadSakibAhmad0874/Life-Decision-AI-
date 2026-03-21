/**
 * Utility functions for formatting currency and scores.
 * All salary values are in Indian Rupees (INR).
 */

/**
 * Format a number as Indian Rupees with lakh notation.
 * Examples:
 *   7850000  → ₹78,50,000
 *   500000   → ₹5,00,000
 *   45000    → ₹45,000
 */
export function formatINR(value) {
  if (value == null || isNaN(value)) return '₹0';
  const num = Math.round(Number(value));
  if (num < 0) return `-${formatINR(-num)}`;
  const s = String(num);
  if (s.length <= 3) return `₹${s}`;
  if (s.length <= 5) {
    return `₹${s.slice(0, s.length - 3)},${s.slice(-3)}`;
  }
  // Indian grouping: last 3, then groups of 2
  const last3 = s.slice(-3);
  let rem = s.slice(0, -3);
  const parts = [];
  while (rem.length > 2) {
    parts.unshift(rem.slice(-2));
    rem = rem.slice(0, -2);
  }
  if (rem) parts.unshift(rem);
  return `₹${parts.join(',')},${last3}`;
}

/** Format a 0–1 float as a percentage string, e.g. 0.852 → "85%" */
export function formatScore(value) {
  if (value == null || isNaN(value)) return '0%';
  return `${Math.round(Number(value) * 100)}%`;
}

/** Convert USD to INR */
export function usdToINR(usd) {
  return Math.round(usd * 83);
}

/** Format a salary from USD to ₹ string */
export function salaryToINR(usd) {
  return formatINR(usdToINR(usd));
}

/** Format a number as compact lakh string, e.g. 7800000 → "₹78L" */
export function formatINRCompact(value) {
  const num = Math.round(Number(value));
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000)   return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000)     return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num}`;
}
