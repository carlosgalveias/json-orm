'use strict';
const _ = require('lodash');
const common = require('./common.js');
const remove = function(obj, path) {
  obj = _.unset(obj, path);
  if (path.match(/\.[0-9]*$/)) {
    // our last path is numeric, if we unset it becomes null and null parts can be bad
    const parent = path.replace(/\.[0-9]*$/, '');
    let o = common.getObjectFromPath(parent);
    o = _.compact(o);
    obj = common.setObjectFromPath(obj, parent, o);
  }
  return obj;
};
module.exports = remove;