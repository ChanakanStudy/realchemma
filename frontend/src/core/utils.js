/**
 * Shared utility functions for CHEMMA
 */

/**
 * Formats a chemical formula string by wrapping numbers in <sub> tags.
 * Returns a string with HTML tags.
 * Example: "H2O" -> "H<sub>2</sub>O"
 * @param {string} formula 
 * @returns {string} HTML string
 */
export const formatFormula = (formula) => {
    if (!formula) return '';
    if (typeof formula !== 'string') return formula;
    return formula.replace(/(\d+)/g, '<sub>$1</sub>');
};
