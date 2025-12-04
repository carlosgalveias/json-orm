'use strict';
const { unset, compact } = require('./common');
const common = require('./common.js');

/**
 * Removes an object at the specified path and compacts arrays if necessary.
 * @param {Object} obj - The root object to modify
 * @param {string} path - The dot-notation path to the object to remove
 * @returns {Object} The modified root object
 */
const remove = function(obj, path) {
  obj = unset(obj, path);
  if (path.match(/\.[0-9]*$/)) {
    const parent = path.replace(/\.[0-9]*$/, '');
    let o = common.getObjectFromPath(obj, parent);
    if (Array.isArray(o)) {
      o = compact(o);
      obj = common.setObjectFromPath(obj, parent, o);
    }
  }
  return obj;
};
module.exports = remove;