'use strict';

const _ = require('lodash');
const insert = function(obj, path, newObj, before) {
  // to insert
  // 1 Get keys on the parent object
  // 2 Create a copy by inserting each key, insert our new object
  //     before or after our reference object
  // 3 replace parent object with new constructed object
  const parentPath = path.replace(/\.[a-zA-Z0-9]*$/, '');
  const refObj = _.get(obj, path);
  const oldParent = _.get(obj, parentPath);
  const newParent = [];
  for (const key in oldParent) {
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