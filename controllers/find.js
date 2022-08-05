'use strict';

const common = require('./common.js');
/**
 * Recursive find method
 * @param  {Object} obj   Object to be searched
 * @param  {Object} query The query object
 * @param  {String} path  Search Path
 * @return {String[]}       Array of string with object paths to where matches occured
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