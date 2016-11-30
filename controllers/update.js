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
var path = require('path');
var common = require(path.join(__dirname, 'common.js'));

/**
 * Recursive find method
 * @param  {Object} obj   Object to be searched
 * @param  {Object} query The query object
 * @param  {String} path  Search Path
 * @return {String[]}       Array of string with object paths to where matches occured
 */
var update = function(obj, path, args) {
    if (!args || typeof(args) !== 'object') {
        throw ("invalid arguments");
    }
    // Args are in the update object format
    for (var n = 0; n < args.length; n++) {
        var updt = args[n];
        if (updt.type === 'normal' && !updt.value.src) {
            common.setObjectFromPath(obj, path + "." + updt.keyName, updt.value);
        } else if (updt.type === 'normal') {
            for (var i = 0; i < value.src.length; i++) {
                if (common.getObjectFromPath(obj, path)[updt.keyName] === updt.value.src[i]) {
                    common.setObjectFromPath(obj, path + "." + updt.keyName, updt.value.dst[i]);
                }
            }
        }
    }
    return obj;
};
module.exports = update;
