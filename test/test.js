var assert = require('assert');
var path = require('path');
var JSONORM = require('../index.js');
var fs = require('fs');
var file = fs.readFileSync(path.join(__dirname, './100751.json'));
let query = {
  keyName: 'Key',
  type: 'normal',
  value: '705d3fca-3a74-443c-a49e-9947207a91db'
};
var instance = new JSONORM(file);
describe('Creating new JSONORM instance', function () {
  it('Should create a new JSONORM instance successfully with data', function (done) {
    assert.equal(typeof (instance), 'object');
    done();
  });
  it('Instance should have real data', function (done) {
    assert.equal(typeof (instance.data), 'object');
    done();
  });
});
describe('finding object ', function () {
  var found;
  found = instance.findSync(query);
  it('should fild object by a query', function (done) {
    assert.equal(found.length, 1);
    done();
  });
  it('found object should be at right path', function (done) {
    assert.equal(found[0], 'TestCases.0.TestCaseElements.2');
    done();
  });
});
describe('updating object ', function () {
  var found = instance.findSync(query);
  var obj;
  it('found object should change property Alias from \'\' to \'Test\'', function (done) {
    var obj = instance.getObject(found[0]);
    assert.equal(obj.Alias, '');
    obj.Alias = 'Test'; // Object is just a reference
    obj = instance.getObject(found[0]);
    assert.equal(obj.Alias, 'Test');
    done();
  });
  it('should add a new text property to the object', function (done) {
    instance.updateSync(found[0], [{
      keyName: 'newProperty',
      type: 'normal',
      value: 'This is a new Property' // just setting new value, adding if needed
    }]);
    obj = instance.getObject(found[0]);
    assert.equal(obj.newProperty, 'This is a new Property');
    done();
  });
  it('should add a new object property to the object', function (done) {
    instance.updateSync(found[0], [{
      keyName: 'newBadProperty',
      type: 'normal',
      value: [1, 2, 3, { bad: 'nahhh' }] // just setting new value, adding if needed
    }]);
    obj = instance.getObject(found[0]);
    assert.equal(JSON.stringify(obj.newBadProperty), JSON.stringify([1, 2, 3, { bad: 'nahhh' }]));
    done();
  });
});
describe('inserting objects', function () {
  var found, parentPath, length, originalPath;
  found = instance.findSync(query);
  it('should insert objects by another object reference, after', function (done) {
    parentPath = found[0].replace(/\.[a-zA-Z0-9]*$/, '');
    parentObject = instance.getObject(parentPath);
    length = parentObject.length;
    originalPath = found[0];
    instance.insertSync(found[0], { 'non friendly name': 'blah' });
    parentObject = instance.getObject(parentPath);
    assert.equal(length + 1, parentObject.length);
    instance.find(query)
      .then(found2 => {
        assert.equal(found2[0], 'TestCases.0.TestCaseElements.2'); // we are still in the same path
        done();
      });
  });
  it('should insert objects by another object reference, before', function (done) {
    parentPath = found[0].replace(/\.[a-zA-Z0-9]*$/, '');
    let parentObject = instance.getObject(parentPath);
    length = parentObject.length;
    originalPath = found[0];
    instance.insertSync(found[0], { 'another non friendly name': 'blah' }, true);
    parentObject = instance.getObject(parentPath);
    assert.equal(length + 1, parentObject.length);
    instance.find(query)
      .then(found2 => {
        assert.equal(found2[0], 'TestCases.0.TestCaseElements.3'); // we are still in the same path
        done();
      });
  });
});
describe('searching with AND or OR case', function () {
  it('should return a array of objects that match all of the conditions', function (done) {
    let query = {
      and: [{
        keyName: 'Key',
        type: 'normal',
        value: '705d3fca-3a74-443c-a49e-9947207a91db'
      }, {
        keyName: 'ActionMethod.Name',
        type: 'normal',
        value: 'Maximize'
      }]
    };
    let found = instance.findSync(query);
    assert.equal(found.length, 1);
    done();
  });
  it('should return a array of objects that match any of the conditions', function (done) {
    let query = {
      or: [{
        keyName: 'Key',
        type: 'normal',
        value: '705d3fca-3a74-443c-a49e-9947207a91db'
      }, {
        keyName: 'ActionMethod.Name',
        type: 'normal',
        value: 'Maximize'
      }]
    };
    let found = instance.findSync(query);
    assert.equal(found.length, 2);
    done();
  });
});
