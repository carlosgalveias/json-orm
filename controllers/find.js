'use strict';

const common = require('./common.js');

/**
 * Recursively searches an object for properties matching a query condition.
 * @param {Object} obj - The object to search
 * @param {Object} query - The query condition with keyName, type, and value properties
 * @param {string} [path=''] - The current dot-notation path (used internally for recursion)
 * @returns {string[]} Array of dot-notation paths where matches occurred
 */
const find = function(obj, query, path) {
  let findings = [];
  if (path && common.match(obj, query)) {
    findings.push(path);
  }
  for (const key in obj) {
    if (typeof obj[key] === 'object') {
      findings = findings.concat(find(obj[key], query, (path ? path + '.' + key : key)));
    }
  }
  return findings;
};
module.exports = find;