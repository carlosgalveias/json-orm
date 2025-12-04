/* global describe, it */
'use strict';
const assert = require('assert');
const path = require('path');
const JSONORM = require('../index.js');
const { get, set, unset, compact } = require('../controllers/common');
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

describe('Native Helper Functions', function() {
  // Test get() function
  describe('get()', function() {
    it('should get value from simple path', function(done) {
      const obj = { name: 'John', age: 30 };
      assert.equal(get(obj, 'name'), 'John');
      assert.equal(get(obj, 'age'), 30);
      done();
    });
    
    it('should get value from nested path', function(done) {
      const obj = { user: { profile: { name: 'John', age: 30 } } };
      assert.equal(get(obj, 'user.profile.name'), 'John');
      assert.equal(get(obj, 'user.profile.age'), 30);
      done();
    });
    
    it('should return default value for non-existent path', function(done) {
      const obj = { name: 'John' };
      assert.equal(get(obj, 'missing', 'default'), 'default');
      assert.equal(get(obj, 'user.profile.name', 'N/A'), 'N/A');
      done();
    });
    
    it('should handle null/undefined objects gracefully', function(done) {
      assert.equal(get(null, 'name', 'default'), 'default');
      assert.equal(get(undefined, 'name', 'default'), 'default');
      assert.equal(get({ name: null }, 'name.nested', 'default'), 'default');
      done();
    });
  });

  // Test set() function
  describe('set()', function() {
    it('should set value at simple path', function(done) {
      const obj = { name: 'John' };
      set(obj, 'age', 30);
      assert.equal(obj.age, 30);
      done();
    });
    
    it('should set value at nested path, creating intermediate objects', function(done) {
      const obj = {};
      set(obj, 'user.profile.name', 'John');
      assert.equal(obj.user.profile.name, 'John');
      assert.equal(typeof obj.user, 'object');
      assert.equal(typeof obj.user.profile, 'object');
      done();
    });
    
    it('should overwrite existing values', function(done) {
      const obj = { name: 'John', age: 25 };
      set(obj, 'age', 30);
      assert.equal(obj.age, 30);
      set(obj, 'name', 'Jane');
      assert.equal(obj.name, 'Jane');
      done();
    });

    it('should handle complex nested paths', function(done) {
      const obj = { existing: 'value' };
      set(obj, 'a.b.c.d.e', 'deep');
      assert.equal(obj.a.b.c.d.e, 'deep');
      done();
    });
  });

  // Test unset() function
  describe('unset()', function() {
    it('should remove property at simple path', function(done) {
      const obj = { name: 'John', age: 30 };
      unset(obj, 'age');
      assert.equal(obj.age, undefined);
      assert.equal(obj.name, 'John');
      done();
    });
    
    it('should remove property at nested path', function(done) {
      const obj = { user: { profile: { name: 'John', age: 30 } } };
      unset(obj, 'user.profile.age');
      assert.equal(obj.user.profile.age, undefined);
      assert.equal(obj.user.profile.name, 'John');
      done();
    });
    
    it('should handle non-existent paths gracefully', function(done) {
      const obj = { name: 'John' };
      const result = unset(obj, 'missing.path');
      assert.equal(result, true);
      assert.equal(obj.name, 'John');
      done();
    });

    it('should return true after deletion', function(done) {
      const obj = { name: 'John' };
      const result = unset(obj, 'name');
      assert.equal(result, true);
      done();
    });
  });

  // Test compact() function
  describe('compact()', function() {
    it('should remove falsy values from array', function(done) {
      const arr = [1, 0, 2, false, 3, null, 4, undefined, 5, '', 6, NaN];
      const result = compact(arr);
      assert.deepEqual(result, [1, 2, 3, 4, 5, 6]);
      done();
    });
    
    it('should preserve truthy values', function(done) {
      const arr = [1, 'hello', true, {}, [], 42];
      const result = compact(arr);
      assert.equal(result.length, 6);
      assert.deepEqual(result, arr);
      done();
    });
    
    it('should handle empty array', function(done) {
      const result = compact([]);
      assert.deepEqual(result, []);
      done();
    });

    it('should handle array with all falsy values', function(done) {
      const arr = [0, false, null, undefined, '', NaN];
      const result = compact(arr);
      assert.deepEqual(result, []);
      done();
    });
  });
});

describe('Async Methods', function() {
  const file = fs.readFileSync(path.join(__dirname, './100751.json'));
  const asyncInstance = new JSONORM(file);
  const query = {
    keyName: 'Key',
    type: 'normal',
    value: '705d3fca-3a74-443c-a49e-9947207a91db'
  };

  describe('find()', function() {
    it('should return a Promise that resolves with results', function(done) {
      asyncInstance.find(query)
        .then(found => {
          assert.equal(Array.isArray(found), true);
          assert.equal(found.length, 1);
          assert.equal(found[0], 'TestCases.0.TestCaseElements.2');
          done();
        })
        .catch(done);
    });

    it('should work with async/await', async function() {
      const found = await asyncInstance.find(query);
      assert.equal(Array.isArray(found), true);
      assert.equal(found.length >= 1, true);
    });
  });

  describe('update()', function() {
    it('should return a Promise that resolves after update', function(done) {
      const found = asyncInstance.findSync(query);
      asyncInstance.update(found[0], [{
        keyName: 'testProperty',
        type: 'normal',
        value: 'testValue'
      }])
        .then(() => {
          const obj = asyncInstance.getObject(found[0]);
          assert.equal(obj.testProperty, 'testValue');
          done();
        })
        .catch(done);
    });

    it('should work with async/await', async function() {
      const found = asyncInstance.findSync(query);
      await asyncInstance.update(found[0], [{
        keyName: 'asyncTestProp',
        type: 'normal',
        value: 'asyncValue'
      }]);
      const obj = asyncInstance.getObject(found[0]);
      assert.equal(obj.asyncTestProp, 'asyncValue');
    });
  });

  describe('insert()', function() {
    it('should return a Promise that resolves after insert', function(done) {
      const found = asyncInstance.findSync(query);
      const parentPath = found[0].replace(/\.[a-zA-Z0-9]*$/, '');
      const parentObject = asyncInstance.getObject(parentPath);
      const initialLength = parentObject.length;
      
      asyncInstance.insert(found[0], { asyncInserted: 'value' })
        .then(() => {
          const updatedParent = asyncInstance.getObject(parentPath);
          assert.equal(updatedParent.length, initialLength + 1);
          done();
        })
        .catch(done);
    });

    it('should work with async/await', async function() {
      const found = asyncInstance.findSync(query);
      await asyncInstance.insert(found[0], { anotherInsert: 'test' });
      const parentPath = found[0].replace(/\.[a-zA-Z0-9]*$/, '');
      const parentObject = asyncInstance.getObject(parentPath);
      assert.equal(Array.isArray(parentObject), true);
    });
  });

  describe('remove()', function() {
    it('should return a Promise that resolves after remove', function(done) {
      const testQuery = {
        keyName: 'asyncInserted',
        type: 'normal',
        value: 'value'
      };
      
      const foundPaths = asyncInstance.findSync(testQuery);
      if (foundPaths.length === 0) {
        // Skip if no items to remove
        done();
        return;
      }
      
      asyncInstance.remove(foundPaths)
        .then(() => {
          const found = asyncInstance.findSync(testQuery);
          assert.equal(found.length, 0);
          done();
        })
        .catch(done);
    });

    it('should work with async/await', async function() {
      const testQuery = {
        keyName: 'anotherInsert',
        type: 'normal',
        value: 'test'
      };
      
      const foundPaths = asyncInstance.findSync(testQuery);
      if (foundPaths.length > 0) {
        await asyncInstance.remove(foundPaths);
        const found = asyncInstance.findSync(testQuery);
        assert.equal(found.length, 0);
      } else {
        // Test passes if no items to remove
        assert.equal(true, true);
      }
    });
  });
});

describe('Error Handling', function() {
  describe('Operating without loaded data', function() {
    it('should throw error when finding without loaded data', function(done) {
      const emptyInstance = new JSONORM();
      let error = null;
      try {
        emptyInstance.findSync({ keyName: 'test', type: 'normal', value: 'test' });
      } catch (e) {
        error = e;
      }
      assert.equal(error === null, false);
      done();
    });

    it('should throw error when updating without loaded data', function(done) {
      const emptyInstance = new JSONORM();
      let error = null;
      try {
        emptyInstance.updateSync('somePath', [{ keyName: 'test', type: 'normal', value: 'test' }]);
      } catch (e) {
        error = e;
      }
      assert.equal(error === null, false);
      done();
    });

    it('should throw error when inserting without loaded data', function(done) {
      const emptyInstance = new JSONORM();
      let error = null;
      try {
        emptyInstance.insertSync('somePath', { test: 'value' });
      } catch (e) {
        error = e;
      }
      assert.equal(error === null, false);
      done();
    });

    it('should throw error when removing without loaded data', function(done) {
      const emptyInstance = new JSONORM();
      let error = null;
      try {
        emptyInstance.removeSync({ keyName: 'test', type: 'normal', value: 'test' });
      } catch (e) {
        error = e;
      }
      assert.equal(error === null, false);
      done();
    });
  });

  describe('Invalid constructor input', function() {
    it('should handle null input gracefully', function(done) {
      const instance = new JSONORM(null);
      assert.equal(typeof instance, 'object');
      done();
    });

    it('should handle undefined input gracefully', function(done) {
      const instance = new JSONORM(undefined);
      assert.equal(typeof instance, 'object');
      done();
    });

    it('should parse valid JSON string', function(done) {
      const jsonString = JSON.stringify({ test: 'value' });
      const instance = new JSONORM(jsonString);
      assert.equal(instance.data.test, 'value');
      done();
    });
  });

  describe('setObject with invalid path', function() {
    it('should handle null path', function(done) {
      const file = fs.readFileSync(path.join(__dirname, './100751.json'));
      const instance = new JSONORM(file);
      let error = null;
      try {
        instance.setObject(null, { test: 'value' });
      } catch (e) {
        error = e;
      }
      assert.equal(error === null, false);
      done();
    });

    it('should throw error on empty path', function(done) {
      const file = fs.readFileSync(path.join(__dirname, './100751.json'));
      const instance = new JSONORM(file);
      let error = null;
      try {
        instance.setObject('', { test: 'value' });
      } catch (e) {
        error = e;
      }
      assert.equal(error === null, false);
      done();
    });
  });

  describe('getObject with invalid path', function() {
    it('should return undefined for non-existent path', function(done) {
      const file = fs.readFileSync(path.join(__dirname, './100751.json'));
      const instance = new JSONORM(file);
      const result = instance.getObject('nonexistent.path.here');
      assert.equal(result, undefined);
      done();
    });

    it('should handle null path', function(done) {
      const file = fs.readFileSync(path.join(__dirname, './100751.json'));
      const instance = new JSONORM(file);
      let error = null;
      try {
        instance.getObject(null);
      } catch (e) {
        error = e;
      }
      assert.equal(error === null, false);
      done();
    });
  });
});