'use strict';

/**
 * Gets a value from an object using a dot-notation path.
 * @param {Object} obj - The object to query
 * @param {string} path - The path to the property (e.g., 'user.profile.name')
 * @param {*} [defaultValue=undefined] - The value to return if the path doesn't exist
 * @returns {*} The value at the path or defaultValue
 */
const get = (obj, path, defaultValue = undefined) => {
  const keys = path.split('.');
  let result = obj;
  for (const key of keys) {
    if (result == null) return defaultValue;
    result = result[key];
  }
  return result === undefined ? defaultValue : result;
};

/**
 * Sets a value in an object using a dot-notation path, creating intermediate objects as needed.
 * @param {Object} obj - The object to modify
 * @param {string} path - The path to the property (e.g., 'user.profile.name')
 * @param {*} value - The value to set
 * @returns {Object} The modified object
 */
const set = (obj, path, value) => {
  const keys = path.split('.');
  const lastKey = keys.pop();
  let current = obj;
  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  current[lastKey] = value;
  return obj;
};

/**
 * Removes a property from an object using a dot-notation path.
 * @param {Object} obj - The object to modify
 * @param {string} path - The path to the property to remove (e.g., 'user.profile.name')
 * @returns {boolean} Always returns true
 */
const unset = (obj, path) => {
  const keys = path.split('.');
  const lastKey = keys.pop();
  let current = obj;
  for (const key of keys) {
    if (!(key in current)) return true;
    current = current[key];
  }
  delete current[lastKey];
  return true;
};

/**
 * Removes falsy values from an array.
 * @param {Array} arr - The array to compact
 * @returns {Array} A new array with falsy values removed
 */
const compact = (arr) => arr.filter(Boolean);

module.exports = {
  /**
   * Loads and parses a JSON file from the filesystem.
   * @param {string} path - The file path to load
   * @returns {Object} The parsed JSON object
   * @throws {Error} If path is not provided, file doesn't exist, or cannot load in this environment
   */
  load: function(path) {
    if (!path) {
      throw new Error('you must provide a valid path');
    }
    let fs;
    try {
      fs = require('fs');
    } catch (e) {
      throw (new Error('cannot load in this environment'));
    };
    if (!fs.existsSync(path)) {
      throw (new Error('File not found'));
    }
    const file = fs.readFileSync(path);
    const data = JSON.parse(file);
    if (data && typeof data === 'object') {
      return data;
    };
  },
  /**
   * Saves an object as JSON to the filesystem.
   * @param {Object} object - The object to save
   * @param {string} path - The file path to save to
   * @throws {Error} If object or path is not provided, or cannot save in this environment
   */
  save: function(object, path) {
    if (!object) {
      throw (new Error('There is no object to save'));
    }
    if (!path) {
      throw (new Error('You need to specify a path to save the object'));
    }
    try {
      const fs = require('fs');
      fs.writeFileSync(path, JSON.stringify(object, null, 2));
    } catch (e) {
      throw (new Error('cannot save in this environment'));
    };
  },
  /**
   * Gets an object from a dot-notation path (wrapper for get helper).
   * @param {Object} obj - The object to query
   * @param {string} path - The path to the property
   * @returns {*} The value at the path
   */
  getObjectFromPath: function(obj, path) {
    return get(obj, path);
  },
  /**
   * Sets an object at a dot-notation path (wrapper for set helper).
   * @param {Object} obj - The object to modify
   * @param {string} path - The path to the property
   * @param {*} newObj - The value to set
   * @returns {Object} The modified object
   */
  setObjectFromPath: function(obj, path, newObj) {
    set(obj, path, newObj);
    return obj;
  },
  /**
   * Gets the parent path by removing the last property segment.
   * @param {string} path - The dot-notation path
   * @returns {string} The parent path
   */
  getParent: function(path) {
    return path.replace(/\.[a-zA-Z0-9]*$/, '');
  },
  /**
   * Checks if an object matches a query condition.
   * @param {Object} obj - The object to test
   * @param {Object} condition - The condition object with keyName, type, and value
   * @param {string} condition.keyName - The property name or dot-notation path to test
   * @param {string} [condition.type='normal'] - The match type: 'normal', 'eval', or 'regexp'
   * @param {*} condition.value - The value to match against (use '*' for any value)
   * @returns {boolean} True if the object matches the condition
   */
  match: function(obj, condition) {
    let tmpObj;
    if (condition.keyName.indexOf('.') !== -1) {
      const keyNames = condition.keyName.split('.');
      tmpObj = JSON.parse(JSON.stringify(obj));
      for (const key of keyNames) {
        if (!tmpObj || !tmpObj[key]) {
          return false;
        } else {
          tmpObj = tmpObj[key];
        }
      }
    } else if (!obj || obj[condition.keyName] === undefined) { // Null is actually a valid value, only not valid values is if its undefined
      return false;
    }
    if (condition.value === '*') { // Any value for this property is acceptable
      return true;
    }
    // dot notation key name
    const testObj = tmpObj || obj[condition.keyName];
    switch (condition.type) {
      case 'eval':
        // eslint-disable-next-line no-case-declarations
        let ret;
        // eslint-disable-next-line no-eval
        eval('ret = testObj ' + condition.value);
        if (!ret) {
          return false;
        }
        break;
      case 'regexp':
        // eslint-disable-next-line no-case-declarations
        const r = new RegExp(condition.value);
        if (!r.test(testObj)) {
          return false;
        }
        break;
      default:
        if (testObj === condition.value) {
          return true;
        }
    }
    return false;
  },
  get,
  set,
  unset,
  compact
};