'use strict';

/**
 * Gets a value from an object using a dot-notation path.
 * @param {Object} obj - The object to query
 * @param {string} path - The path to the property (e.g., 'user.profile.name')
 * @param {*} [defaultValue=undefined] - The value to return if the path doesn't exist
 * @returns {*} The value at the path or defaultValue
 */
const get = (obj, path, defaultValue = undefined) => {
  if (!path || typeof path !== 'string') {
    throw new Error('Invalid path: must be a non-empty string');
  }
  
  // Validate path format
  if (!/^[a-zA-Z0-9._-]+$/.test(path)) {
    throw new Error('Invalid path format');
  }
  
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result == null) return defaultValue;
    
    // Block dangerous properties
    if (['__proto__', 'constructor', 'prototype'].includes(key)) {
      throw new Error(`Access to property '${key}' is not allowed`);
    }
    
    // Use hasOwnProperty check
    if (!Object.prototype.hasOwnProperty.call(result, key)) {
      return defaultValue;
    }
    
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
  if (!path || typeof path !== 'string') {
    throw new Error('Invalid path: must be a non-empty string');
  }
  
  // Validate path format
  if (!/^[a-zA-Z0-9._-]+$/.test(path)) {
    throw new Error('Invalid path format');
  }
  
  const keys = path.split('.');
  const lastKey = keys.pop();
  
  // Block dangerous properties
  if (['__proto__', 'constructor', 'prototype'].includes(lastKey)) {
    throw new Error(`Setting property '${lastKey}' is not allowed`);
  }
  
  let current = obj;
  for (const key of keys) {
    // Block dangerous properties in intermediate paths
    if (['__proto__', 'constructor', 'prototype'].includes(key)) {
      throw new Error(`Access to property '${key}' is not allowed`);
    }
    
    if (!(key in current) || typeof current[key] !== 'object') {
      // Create objects with null prototype for security
      current[key] = Object.create(null);
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
  load: function(filePath) {
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('You must provide a valid path string');
    }
    
    let path, fs;
    try {
      path = require('path');
      fs = require('fs');
    } catch (e) {
      throw new Error('Cannot load in this environment');
    }
    
    // Normalize and resolve the path to prevent traversal attacks
    const normalizedPath = path.normalize(path.resolve(filePath));
    
    // Security: Check for null bytes (path traversal attack vector)
    if (normalizedPath.includes('\0')) {
      throw new Error('Invalid path: null byte detected');
    }
    
    // Security: Validate file extension - only allow JSON files
    const allowedExtensions = ['.json'];
    const ext = path.extname(normalizedPath).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      throw new Error(`Invalid file type: only ${allowedExtensions.join(', ')} allowed`);
    }
    
    // Check if file exists
    if (!fs.existsSync(normalizedPath)) {
      throw new Error('File not found');
    }
    
    try {
      const file = fs.readFileSync(normalizedPath, 'utf8');
      const data = JSON.parse(file);
      
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid JSON data');
      }
      
      return data;
    } catch (e) {
      if (e instanceof SyntaxError) {
        throw new Error('Invalid JSON format: ' + e.message);
      }
      throw e;
    }
  },
  /**
   * Saves an object as JSON to the filesystem.
   * @param {Object} object - The object to save
   * @param {string} path - The file path to save to
   * @throws {Error} If object or path is not provided, or cannot save in this environment
   */
  save: function(object, filePath) {
    if (!object || typeof object !== 'object') {
      throw new Error('There is no valid object to save');
    }
    
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('You need to specify a valid path string');
    }
    
    let path, fs;
    try {
      path = require('path');
      fs = require('fs');
    } catch (e) {
      throw new Error('Cannot save in this environment');
    }
    
    // Normalize and resolve the path to prevent traversal attacks
    const normalizedPath = path.normalize(path.resolve(filePath));
    
    // Security: Check for null bytes (path traversal attack vector)
    if (normalizedPath.includes('\0')) {
      throw new Error('Invalid path: null byte detected');
    }
    
    // Security: Validate file extension - only allow JSON files
    const ext = path.extname(normalizedPath).toLowerCase();
    if (ext !== '.json') {
      throw new Error('Invalid file type: only .json files allowed');
    }
    
    try {
      // Security: Size check to prevent resource exhaustion
      const jsonString = JSON.stringify(object, null, 2);
      const maxSize = 10 * 1024 * 1024; // 10MB limit
      
      if (jsonString.length > maxSize) {
        throw new Error(`Data too large: exceeds ${maxSize} bytes`);
      }
      
      // Create directory if it doesn't exist
      const dir = path.dirname(normalizedPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
      }
      
      // Write with proper permissions (note: mode not supported on Windows)
      fs.writeFileSync(normalizedPath, jsonString, { mode: 0o644 });
    } catch (e) {
      if (e.message.includes('Data too large')) {
        throw e;
      }
      throw new Error('Cannot save in this environment: ' + e.message);
    }
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
    if (!path || typeof path !== 'string') {
      throw new Error('Invalid path: must be a non-empty string');
    }
    
    // Validate path format (alphanumeric, dots, underscores, hyphens)
    if (!/^[a-zA-Z0-9._-]+$/.test(path)) {
      throw new Error('Invalid path format');
    }
    
    // Split by dot and remove last segment
    const segments = path.split('.');
    if (segments.length <= 1) {
      return ''; // No parent
    }
    
    segments.pop();
    return segments.join('.');
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
    // Input validation
    if (!condition || typeof condition !== 'object') {
      throw new Error('Invalid condition: must be an object');
    }
    
    if (!condition.keyName || typeof condition.keyName !== 'string') {
      throw new Error('Invalid condition: keyName must be a non-empty string');
    }
    
    if (!condition.type || typeof condition.type !== 'string') {
      throw new Error('Invalid condition: type must be a non-empty string');
    }
    
    // Validate keyName format
    if (!/^[a-zA-Z0-9._-]+$/.test(condition.keyName)) {
      throw new Error('Invalid keyName format');
    }
    
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
        // Define a whitelist of allowed operations
        const allowedOps = {
          'gt': (a, b) => a > b,
          'lt': (a, b) => a < b,
          'gte': (a, b) => a >= b,
          'lte': (a, b) => a <= b,
          'eq': (a, b) => a === b,
          'neq': (a, b) => a !== b,
          'contains': (a, b) => String(a).includes(String(b)),
          'startsWith': (a, b) => String(a).startsWith(String(b)),
          'endsWith': (a, b) => String(a).endsWith(String(b))
        };
        
        // Parse condition.value as structured operation
        if (typeof condition.value !== 'object' || !condition.value.op || !condition.value.operand) {
          return false;
        }
        
        const { op, operand } = condition.value;
        if (!allowedOps[op]) {
          throw new Error(`Invalid operation: ${op}`);
        }
        
        return allowedOps[op](testObj, operand);
      case 'regexp':
        // Validate regex pattern
        // eslint-disable-next-line no-case-declarations
        const maxPatternLength = 100;
        if (typeof condition.value !== 'string' || condition.value.length > maxPatternLength) {
          throw new Error('Invalid regex pattern');
        }
        
        // Detect dangerous patterns
        // eslint-disable-next-line no-case-declarations
        const dangerousPatterns = [
          /(\(.*\+\))+/,  // (a+)+ type patterns
          /(\(.*\*\))+/,  // (a*)* type patterns
          /(\(.*\?\))+/,  // (a?)? type patterns
          /\{[\d,]+\}.*\{[\d,]+\}/  // Multiple quantifiers
        ];
        
        if (dangerousPatterns.some(p => p.test(condition.value))) {
          throw new Error('Potentially dangerous regex pattern detected');
        }
        
        try {
          // eslint-disable-next-line no-case-declarations
          const r = new RegExp(condition.value);
          
          // Convert to string safely with size limit
          // eslint-disable-next-line no-case-declarations
          const testString = String(testObj).slice(0, 10000);
          
          return r.test(testString);
        } catch (e) {
          throw new Error(`Invalid regex pattern: ${e.message}`);
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