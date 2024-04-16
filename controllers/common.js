'use strict';
const _ = require('lodash');

module.exports = {
  /**
   * Opens json
   * @param  {[type]} path [description]
   * @return {[type]}      [description]
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
   * Saves JSON modification
   * @param  {[type]} path [description]
   * @return {[type]}      [description]
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
  getObjectFromPath: function(obj, path) {
    return _.get(obj, path);
  },
  setObjectFromPath: function(obj, path, newObj) {
    _.set(obj, path, newObj);
    return obj;
  },
  getParent: function(path) {
    return path.replace(/\.[a-zA-Z0-9]*$/, '');
  },
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
  }
};