import React from 'react';

/**
 * Shared utility functions for CHEMMA (React-compatible)
 */

/**
 * Formats a chemical formula string by wrapping numbers in <sub> tags.
 * Returns an array of React elements.
 * Example: "H2O" -> ["H", <sub>2</sub>, "O"]
 * @param {string} formula 
 * @returns {Array|string} React-renderable content
 */
export const formatFormula = (formula) => {
    if (!formula) return '';
    
    // Split by digits and map to React elements
    return formula.split(/(\d+)/).map((part, i) => 
        /\d+/.test(part) ? <sub key={i}>{part}</sub> : part
    );
};
