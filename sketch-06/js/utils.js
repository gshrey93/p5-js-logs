/**
 * Decimal Rounding & Formatting Utility
 * @param {number} value Number to round
 * @returns {string} Formatted number string up to 6 decimal places with trailing zero stripping
 */
export function roundTo6(value) {
  const rounded = Math.round(value * 1_000_000) / 1_000_000;
  let str = rounded.toString();
  if (str.includes('.')) str = str.replace(/\.?0+$/, '');
  return str;
}
