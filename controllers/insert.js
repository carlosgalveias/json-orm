'use strict';

const { get, set } = require('./common');

/**
 * Inserts a new object before or after a reference object in an array.
 * @param {Object} obj - The root object containing the array
 * @param {string} path - The dot-notation path to the reference object
 * @param {*} newObj - The new object to insert
 * @param {boolean} [before=false] - If true, insert before the reference; otherwise insert after
 * @returns {Object} The modified root object
 */
const insert = function(obj, path, newObj, before) {
  const parentPath = path.replace(/\.[a-zA-Z0-9]*$/, '');
  const refObj = get(obj, path);
  const oldParent = get(obj, parentPath);
  const newParent = [];
  for (const key in oldParent) {
    if (oldParent[key] === refObj && before) {
      newParent.push(newObj);
    }
    newParent.push(oldParent[key]);
    if (oldParent[key] === refObj && !before) {
      newParent.push(newObj);
    }
  }
  obj = set(obj, parentPath, newParent);
  return obj;
};
module.exports = insert;