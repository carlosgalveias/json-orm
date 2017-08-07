var _ = require('lodash');
var insert = function (obj, path, newObj, before) {
  // to insert
  // 1 Get keys on the parent object
  // 2 Create a copy by inserting each key, insert our new object
  //     before or after our reference object
  // 3 replace parent object with new constructed object
  var parentPath = path.replace(/\.[a-zA-Z0-9]*$/, '');
  var refObj = _.get(obj, path);
  var oldParent = _.get(obj, parentPath);
  var newParent = [];
  for (var key in oldParent) {
    if (oldParent[key] === refObj && before) {
      newParent.push(newObj);
    }
    newParent.push(oldParent[key]);
    if (oldParent[key] === refObj && !before) {
      newParent.push(newObj);
    }
  }
  obj = _.set(obj, parentPath, newParent);
  return obj;
};
module.exports = insert;
