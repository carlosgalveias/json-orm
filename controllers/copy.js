var path = require('path');
var common = require(path.join(__dirname, 'common.js'));
var _ = require('lodash');

/**
 * Recursive find method
 * @param  {Object} obj   Object to be searched
 * @param  {Object} query The query object
 * @param  {String} path  Search Path
 * @return {String[]}       Array of string with object paths to where matches occured
 */
var copyFromPath = function(obj, path) {
    // Args are in the update object format
    var origOBj = _.get(obj, path);
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
module.exports = copy;
