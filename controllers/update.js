'use strict';

const common = require('./common.js');

/**
 * Updates properties of an object at the specified path based on update arguments.
 * @param {Object} obj - The root object to modify
 * @param {string} path - The dot-notation path to the object to update
 * @param {Object[]} args - Array of update instructions
 * @param {string} args[].keyName - The property name to update
 * @param {string} [args[].type='normal'] - The update type: 'normal' or 'eval'
 * @param {*|Object} args[].value - The new value, or an object with src/dst arrays for dynamic replacement
 * @returns {Object} The modified root object
 * @throws {Error} If args is not a valid object
 * @example
 * // Simple value update
 * update(obj, 'users.0', [{keyName: 'age', value: 30}])
 *
 * // Dynamic replacement
 * update(obj, 'users.0', [{keyName: 'name', value: {src: ['John'], dst: ['Jane']}}])
 */
const update = function(obj, path, args) {
  if (!args || typeof args !== 'object') {
    throw (new Error('invalid arguments'));
  }
  // Args are in the update object format
  for (const arg of args) {
    if (arg.type === 'normal' && !arg.value.src) {
      common.setObjectFromPath(obj, path + '.' + arg.keyName, arg.value);
    } else if (arg.type === 'normal') {
      for (let i = 0; i < arg.value.src.length; i++) {
        if (common.getObjectFromPath(obj, path)[arg.keyName] === arg.value.src[i]) {
          common.setObjectFromPath(obj, path + '.' + arg.keyName, arg.value.dst[i]);
        }
      }
    }
  }
  return obj;
};
module.exports = update;