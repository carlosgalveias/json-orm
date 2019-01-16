'use strict';

const _ = require('lodash');
const fs = require('fs');

module.exports = {
    key: {
        new: function() {
            // TODO generate new hash key
        }
    },
    /**
     * Opens json
     * @param  {[type]} path [description]
     * @return {[type]}      [description]
     */
    load: function(path) {
        if (!fs.existsSync(path)) {
            throw ('File not found');
        }
        file = fs.readFileSync(path);
        data = JSON.parse(file);
        if (data && typeof(data) === 'object') {
            return data;
        }
    },
    /**
     * Saves JSON modification
     * @param  {[type]} path [description]
     * @return {[type]}      [description]
     */
    save: function(object, path) {
        if (!object) {
            throw ('There is no object to save');
        }
        if (!path) {
            throw ('You need to specify a path to save the object');
        }
        fs.writeFileSync(path, JSON.stringify(object, null, 2));
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
        var tmpObj;
        if (condition.keyName.indexOf('.') !== -1) {
            var keyNames = condition.keyName.split('.');
            tmpObj = JSON.parse(JSON.stringify(obj));
            for (var n = 0; n < keyNames.length; n++) {
                if (!tmpObj || !tmpObj[keyNames[n]]) {
                    return false;
                } else {
                    tmpObj = tmpObj[keyNames[n]];
                }
            }
        } else if (!obj || obj[condition.keyName] === undefined) { // Null is actually a valid value, only not valid values is if its undefined
            return false;
        } else {}
        if (condition.value === '*') { // Any value for this property is acceptable
            return true;
        }
        // dot notation key name
        var testObj = tmpObj ? tmpObj : obj[condition.keyName];
        switch (condition.type) {
            case 'eval':
                var ret;
                eval('ret = testObj ' + condition.value);
                if (!ret) {
                    return false;
                }
                break;
            case 'regexp':
                var r = new RegExp(condition.value);
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