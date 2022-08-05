/* global describe, it */
'use strict';
const assert = require('assert');
const path = require('path');
const JSONORM = require('../index.js');
const fs = require('fs');
const file = fs.readFileSync(path.join(__dirname, './100751.json'));
const query = {
  keyName: 'Key',
  type: 'normal',
  value: '705d3fca-3a74-443c-a49e-9947207a91db'
};
const instance = new JSONORM(file);
describe('test loading file', function() {
  const testInstance = new JSONORM();
  it('should load a file', function(done) {
    testInstance.load(path.join(__dirname, './100751.json'));
    assert.equal(testInstance.data.Id, 100751);
    done();
  });
  it('should save to file', function(done) {
    testInstance.save(path.join(__dirname, './test.json'));
    assert(fs.existsSync(path.join(__dirname, './test.json')), true);
    done();
  });
  it('should complain if no file there', function(done) {
    let error = null;
    try {
      testInstance.load(path.join(__dirname, './test2.json'));
    } catch (e) {
      error = e;
    }
    assert.equal(error === null, false);
    done();
  });
  it('should complain if file is null', function(done) {
    let error = null;
    try {
      testInstance.load(null);
    } catch (e) {
      error = e;
    }
    assert.equal(error === null, false);
    done();
  });
  it('should complain if file is not a json', function(done) {
    let error = null;
    try {
      testInstance.load(path.join(__dirname, '../README.md'));
    } catch (e) {
      error = e;
    }
    assert.equal(error === null, false);
    done();
  });
});
describe('Creating new JSONORM instance', function() {
  it('Should create a new JSONORM instance successfully with data', function(done) {
    assert.equal(typeof instance, 'object');
    done();
  });
  it('Instance should have real data', function(done) {
    assert.equal(typeof instance.data, 'object');
    done();
  });
});
describe('finding object ', function() {
  const found = instance.findSync(query);
  it('should fild object by a query', function(done) {
    assert.equal(found.length, 1);
    done();
  });
  it('found object should be at right path', function(done) {
    assert.equal(found[0], 'TestCases.0.TestCaseElements.2');
    done();
  });
});
describe('updating object ', function() {
  const found = instance.findSync(query);
  it('found object should change property Alias from \'\' to \'Test\'', function(done) {
    let obj = instance.getObject(found[0]);
    assert.equal(obj.Alias, '');
    obj.Alias = 'Test'; // Object is just a reference
    obj = instance.getObject(found[0]);
    assert.equal(obj.Alias, 'Test');
    done();
  });
  it('should add a new text property to the object', function(done) {
    instance.updateSync(found[0], [{
      keyName: 'newProperty',
      type: 'normal',
      value: 'This is a new Property' // just setting new value, adding if needed
    }]);
    const obj = instance.getObject(found[0]);
    assert.equal(obj.newProperty, 'This is a new Property');
    done();
  });
  it('should add a new object property to the object', function(done) {
    instance.updateSync(found[0], [{
      keyName: 'newBadProperty',
      type: 'normal',
      value: [1, 2, 3, { bad: 'nahhh' }] // just setting new value, adding if needed
    }]);
    const obj = instance.getObject(found[0]);
    assert.equal(JSON.stringify(obj.newBadProperty), JSON.stringify([1, 2, 3, { bad: 'nahhh' }]));
    done();
  });
  it('updates values by replacing value A for value B', function(done) {
    instance.updateSync(found[0], [{
      keyName: 'OrderId',
      type: 'normal',
      value: { src: [3], dst: [4] }
    }]);
    const obj = instance.getObject(found[0]);
    assert.equal(obj.OrderId, 4);
    done();
  });
  it('Update with no args should throw', function(done) {
    let error = null;
    try {
      instance.updateSync(found[0], null);
    } catch (e) {
      error = e;
    }
    assert.equal(error === null, false);
    done();
  });
});
describe('inserting objects', function() {
  const found = instance.findSync(query);
  it('should insert objects by another object reference, after', function(done) {
    const parentPath = found[0].replace(/\.[a-zA-Z0-9]*$/, '');
    let parentObject = instance.getObject(parentPath);
    const length = parentObject.length;
    let originalPath = found[0];
    instance.insertSync(found[0], { 'non friendly name': 'blah' });
    parentObject = instance.getObject(parentPath);
    assert.equal(length + 1, parentObject.length);
    instance.find(query)
      .then(found2 => {
        assert.equal(found2[0], 'TestCases.0.TestCaseElements.2'); // we are still in the same path
        done();
      });
  });
  it('should insert objects by another object reference, before', function(done) {
    const parentPath = found[0].replace(/\.[a-zA-Z0-9]*$/, '');
    let parentObject = instance.getObject(parentPath);
    const length = parentObject.length;
    let originalPath = found[0];
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
describe('searching with AND or OR case', function() {
  it('should return a array of objects that match all of the conditions', function(done) {
    const query = {
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
    const found = instance.findSync(query);
    assert.equal(found.length, 1);
    done();
  });
  it('should return a array of objects that match any of the conditions', function(done) {
    const query = {
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
    const found = instance.findSync(query);
    assert.equal(found.length, 2);
    done();
  });
  describe('removing object ', function() {
    it('should delete key', function(done) {
      let found = instance.findSync(query);
      instance.removeSync(found);
      found = instance.findSync(query);
      assert.equal(found.length, 0);
      done();
    });
  });
});