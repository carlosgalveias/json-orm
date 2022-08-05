'use strict';

/**
 * Update Language
 * [{
 *  keyname: 'name',
 *  type: 'normal' (default), 'eval'
 *  value: {src:['John','Jack'],dst:['Mary','Jason']}
 *  // dynamic replacement example, will change John to Mary and Jack to Json, will not change otherwize. Values can be object
 *   value: 'new Date()' // eval example, adding if needed
 *   value: 34 // just setting new value, adding if needed
 * }]
 *
 */
const common = require('./common.js');
/**
 * Recursive find method
 * @param  {Object} obj   Object to be searched
 * @param  {Object} query The query object
 * @param  {String} path  Search Path
 * @return {String[]}       Array of string with object paths to where matches occured
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
      for (var i = 0; i < arg.value.src.length; i++) {
        if (common.getObjectFromPath(obj, path)[arg.keyName] === arg.value.src[i]) {
          common.setObjectFromPath(obj, path + '.' + arg.keyName, arg.value.dst[i]);
        }
      }
    }
  }
  return obj;
};
module.exports = update;