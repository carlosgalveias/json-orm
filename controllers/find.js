'use strict';

const common = require('./common.js');

/**
 * Recursively searches an object for properties matching a query condition.
 * @param {Object} obj - The object to search
 * @param {Object} query - The query condition with keyName, type, and value properties
 * @param {string} [path=''] - The current dot-notation path (used internally for recursion)
 * @returns {string[]} Array of dot-notation paths where matches occurred
 */
const find = function(obj, query, path, depth = 0) {
  const MAX_DEPTH = 100; // Maximum recursion depth
  
  if (depth > MAX_DEPTH) {
    throw new Error(`Maximum recursion depth (${MAX_DEPTH}) exceeded`);
  }
  
  let findings = [];
  if (path && common.match(obj, query)) {
    findings.push(path);
  }
  for (const key in obj) {
    if (typeof obj[key] === 'object') {
      findings = findings.concat(find(obj[key], query, (path ? path + '.' + key : key), depth + 1));
    }
  }
  return findings;
};
module.exports = find;