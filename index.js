'use strict';

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
   * Finds the key path of the ojbect(s) being queried
   * @param  {Object} query The search query
   * @return {Array} Array of path references to the objects
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
   * Updates the object with the new object
   * @param  {String} path   The object path to update
   * @param  {Object} newObj The new object/value
   * @return {Boolean}       Boolean return
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
   * Calls updateSync and returns as promise
   * @param  {String} path   The path for our reference object
   * @param  {Object} newObj The new Object to insert
   * @return {Void}       resolves or rejects with error
   */
  this.update = function(path, newObj) {
    return new Promise((resolve, reject) => {
      try {
        this.update(path, newObj);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  };
  /**
   * Inserts a new object before or after our path object
   * @param  {String} path   The path for our reference object
   * @param  {Object} newObj The new Object to insert
   * @param  {Boolean} before Before or After (default)
   * @return {Boolean} If insert is successfull
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
   * Calls insertSync and returns as promise
   * @param  {String} path   The path for our reference object
   * @param  {Object} newObj The new Object to insert
   * @param  {Boolean} before Before or After (default)
   * @return {Void}       resolves or rejects with error
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
   * Removes a object from path
   * @param  {String} path   The path for our reference object
   * @return {Void}
   */
  this.removeSync = function(path) {
    if (!this.data) {
      throw (new Error('You need to load the json first'));
    }
    if (typeof path === 'object' && path.length > 0) {
      path.forEach(p => {
        _remove(this.data, p);
      });
    } else {
      _remove(this.data, path);
    }
  };
  /**
   * Calls RemoveSync and returns as promise
   * @param  {String} path   The path for our reference object
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
   * Gets the json object from a given path
   * @param  {String} path Path for the object
   * @return {Object}      The object
   */
  this.getObject = function(path) {
    if (!this.data) {
      throw (new Error('You need to load the json first'));
    }
    return common.getObjectFromPath(this.data, path);
  };
  /**
   * Sets a object from path
   * @param {[type]} path   [description]
   * @param {[type]} object [description]
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
  this.getParent = function(path) {
    return common.getParent(path);
  };
  this.load = function(path) {
    const data = common.load(path);
    this.data = data;
  };
  this.save = function(path) {
    common.save(this.data, path);
  };
  return this;
};
module.exports = jsonorm;