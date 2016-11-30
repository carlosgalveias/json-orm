var _ = require('lodash');

var remove = function(obj, path) {
  
    obj = _.unset(obj, path);
    return obj;
};

module.exports = remove;
