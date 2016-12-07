var _ = require('lodash');
var path = require('path')
var common = require(path.join(__dirname, 'common.js'));


var remove = function(obj, path) {
    obj = _.unset(obj, path);
    if (path.match(/\.[0-9]*$/)) {
        // our last path is numeric, if we unset it becomes null and null parts can be bad
        var parent = path.replace(/\.[0-9]*$/, '');
        var o = common.getObjectFromPath(parent);
        o = _.compact(o);
        obj = common.setObjectFromPath(obj, parent, o);
    }
    return obj;
};

module.exports = remove;

