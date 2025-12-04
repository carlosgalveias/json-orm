'use strict';

/**
 * JSON ORM constructor - Creates a new instance for querying and manipulating JSON data.
 * @param {string|Object} [json] - A JSON string or object to initialize with
 * @throws {Error} If input is not a valid JSON object or string
 * @returns {Object} A new jsonorm instance with methods for querying and manipulating JSON
 */
const jsonorm = function(json) {
  const common = require('./controllers/common.js');
  const _find = require('./controllers/find.js');
  const _insert = require('./controllers/insert.js');
  const _remove = require('./controllers/remove.js');
  const _update = require('./controllers/update.js');
  try {
    this.data = json ? JSON.parse(json) : null;
  } catch (e) {
    if (typeof json !== 'object') {
      throw new Error('Input must be a valid JSON object or String');
    }
    this.data = json;
  }
  this.foundObjects = [];
  
  /**
   * Synchronously finds object paths matching a query condition.
   * @param {Object|Object[]} query - The search query or array of queries
   * @param {string} query.keyName - The property name to match
   * @param {string} [query.type='normal'] - The match type: 'normal', 'eval', or 'regexp'
   * @param {*} query.value - The value to match against
   * @param {Object} [query.and] - Array of conditions that must all match
   * @param {Object} [query.or] - Array of conditions where at least one must match
   * @returns {string[]} Array of dot-notation paths to matching objects
   * @throws {Error} If data is not loaded
   */
  this.findSync = function(query) {
    if (!this.data) {
      const stack = JSON.stringify(this);
      throw (new Error('You need to load the json first\n' + stack));
    }
    if (query.and) {
      // TODO , find objects that match >1 query within
      let foundQueries = [];
      const matchedObjects = [];
      for (const index in query.and) {
        foundQueries = foundQueries.concat(_find(this.data, query.and[index]));
      }
      foundQueries.forEach(f => {
        const obj = common.getObjectFromPath(this.data, f);
        let match = true;
        query.and.forEach(q => {
          if (!common.match(obj, q)) {
            match = false;
          }
        });
        if (match && matchedObjects.indexOf(f) === -1) {
          matchedObjects.push(f);
        }
      });
      return matchedObjects;
    } else if (query.or) {
      // TODO , find objects that match >1 query within
      let foundQueries = [];
      const matchedObjects = [];
      for (const index in query.or) {
        foundQueries = foundQueries.concat(_find(this.data, query.or[index]));
      }
      foundQueries.forEach(f => {
        const obj = common.getObjectFromPath(this.data, f);
        let match = false;
        query.or.forEach(q => {
          if (common.match(obj, q)) {
            match = true;
          }
        });
        if (match && matchedObjects.indexOf(f) === -1) {
          matchedObjects.push(f);
        }
      });
      return matchedObjects;
    }
    if (query.length) {
      for (const n in query) {
        this.foundObjects = this.foundObjects.concat(_find(this.data, query[n]));
      }
    } else {
      this.foundObjects = _find(this.data, query);
    }
    return this.foundObjects;
  };
  
  /**
   * Asynchronously finds object paths matching a query condition.
   * @param {Object|Object[]} query - The search query (same format as findSync)
   * @returns {Promise<string[]>} Promise resolving to array of paths to matching objects
   */
  this.find = function(query) {
    return new Promise((resolve, reject) => {
      try {
        resolve(this.findSync(query));
      } catch (e) {
        reject(e);
      }
    });
  };
  
  /**
   * Synchronously updates objects at specified paths.
   * @param {string|string[]} path - The dot-notation path or array of paths to update
   * @param {Object[]} newObj - Array of update instructions with keyName, type, and value
   * @throws {Error} If data is not loaded
   */
  this.updateSync = function(path, newObj) {
    if (!this.data) {
      throw (new Error('You need to load the json first'));
    }
    if (typeof path === 'object' && path.length > 0) {
      path.forEach(p => {
        this.data = _update(this.data, p, newObj);
      });
    } else {
      this.data = _update(this.data, path, newObj);
    }
  };
  
  /**
   * Asynchronously updates objects at specified paths.
   * @param {string|string[]} path - The dot-notation path or array of paths to update
   * @param {Object[]} newObj - Array of update instructions
   * @returns {Promise<void>} Promise that resolves when update is complete
   */
  this.update = function(path, newObj) {
    return new Promise((resolve, reject) => {
      try {
        this.updateSync(path, newObj);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  };
  
  /**
   * Synchronously inserts a new object before or after a reference object in an array.
   * @param {string|string[]} path - The dot-notation path or array of paths to the reference object(s)
   * @param {*} newObj - The new object to insert
   * @param {boolean} [before=false] - If true, insert before the reference; otherwise insert after
   * @throws {Error} If data is not loaded
   */
  this.insertSync = function(path, newObj, before) {
    if (!this.data) {
      throw (new Error('You need to load the json first'));
    }
    if (typeof path === 'object' && path.length > 0) {
      path.forEach(p => {
        this.data = _insert(this.data, p, newObj, before);
      });
    } else {
      this.data = _insert(this.data, path, newObj, before);
    }
  };
  
  /**
   * Asynchronously inserts a new object before or after a reference object.
   * @param {string|string[]} path - The dot-notation path or array of paths to the reference object(s)
   * @param {*} newObj - The new object to insert
   * @param {boolean} [before=false] - If true, insert before the reference; otherwise insert after
   * @returns {Promise<void>} Promise that resolves when insert is complete
   */
  this.insert = function(path, newObj, before) {
    return new Promise((resolve, reject) => {
      try {
        this.insertSync(path, newObj, before);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  };
  
  /**
   * Synchronously removes objects at specified paths.
   * @param {string|string[]} path - The dot-notation path or array of paths to remove
   * @throws {Error} If data is not loaded
   */
  this.removeSync = function(path) {
    if (!this.data) {
      throw (new Error('You need to load the json first'));
    }
    if (typeof path === 'object' && path.length > 0) {
      path.forEach(p => {
        this.data = _remove(this.data, p);
      });
    } else {
      this.data = _remove(this.data, path);
    }
  };
  
  /**
   * Asynchronously removes objects at specified paths.
   * @param {string|string[]} path - The dot-notation path or array of paths to remove
   * @returns {Promise<void>} Promise that resolves when removal is complete
   */
  this.remove = function(path) {
    return new Promise((resolve, reject) => {
      try {
        this.removeSync(path);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  };
  
  /**
   * Gets the object at the specified path.
   * @param {string} path - The dot-notation path to the object
   * @returns {*} The object at the specified path
   * @throws {Error} If data is not loaded
   */
  this.getObject = function(path) {
    if (!this.data) {
      throw (new Error('You need to load the json first'));
    }
    return common.getObjectFromPath(this.data, path);
  };
  
  /**
   * Sets an object at the specified path.
   * @param {string} path - The dot-notation path where to set the object
   * @param {*} object - The object to set
   * @returns {Object} The modified data object
   * @throws {Error} If data is not loaded or path is not provided
   */
  this.setObject = function(path, object) {
    if (!this.data) {
      throw (new Error('You need to load the json first'));
    }
    if (!path) {
      throw (new Error('Cannot set object without path'));
    }
    this.data = common.setObjectFromPath(this.data, path, object);
    return this.data;
  };
  
  /**
   * Gets the parent path by removing the last property segment.
   * @param {string} path - The dot-notation path
   * @returns {string} The parent path
   */
  this.getParent = function(path) {
    return common.getParent(path);
  };
  
  /**
   * Loads JSON data from a file and sets it as the current data.
   * @param {string} path - The file path to load from
   * @throws {Error} If file doesn't exist or cannot be loaded
   */
  this.load = function(path) {
    const data = common.load(path);
    this.data = data;
  };
  
  /**
   * Saves the current data to a JSON file.
   * @param {string} path - The file path to save to
   * @throws {Error} If data cannot be saved
   */
  this.save = function(path) {
    common.save(this.data, path);
  };
  return this;
};
module.exports = jsonorm;