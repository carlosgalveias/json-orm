/* global describe, it, beforeEach */
'use strict';

const assert = require('assert');
const JSONORM = require('../index');

describe('Security Tests', function() {
  
  describe('Arbitrary Code Execution Prevention', function() {
    it('should accept old string format for backward compatibility', function() {
      const db = new JSONORM({ users: [{ name: 'John', age: 30 }, { name: 'Jane', age: 25 }] });
      
      // Old format should still work
      const result1 = db.findSync({
        keyName: 'age',
        type: 'eval',
        value: '> 25'
      });
      assert.strictEqual(result1.length, 1);
      
      const result2 = db.findSync({
        keyName: 'age',
        type: 'eval',
        value: '<= 25'
      });
      assert.strictEqual(result2.length, 1);
      
      const result3 = db.findSync({
        keyName: 'age',
        type: 'eval',
        value: '=== 30'
      });
      assert.strictEqual(result3.length, 1);
    });
    
    it('should only allow whitelisted operations in eval', function() {
      const db = new JSONORM({ users: [{ name: 'John', age: 30 }] });
      
      // Valid operation should work
      const result = db.findSync({
        keyName: 'age',
        type: 'eval',
        value: { op: 'gt', operand: 18 }
      });
      assert.ok(Array.isArray(result));
      assert.strictEqual(result.length, 1);
      
      // Invalid operation should fail
      assert.throws(() => {
        db.findSync({
          keyName: 'age',
          type: 'eval',
          value: { op: 'malicious', operand: 18 }
        });
      }, /Invalid operation/);
    });
    
    it('should reject dangerous eval expressions', function() {
      const db = new JSONORM({ users: [{ name: 'John', age: 30 }] });
      
      // Expressions with code execution attempts should fail
      assert.throws(() => {
        db.findSync({
          keyName: 'age',
          type: 'eval',
          value: '> 18; require("child_process").exec("bad")'
        });
      }, /Invalid eval expression/);
      
      assert.throws(() => {
        db.findSync({
          keyName: 'age',
          type: 'eval',
          value: 'function() { return true; }'
        });
      }, /Invalid eval expression/);
    });
  });
  
  describe('ReDoS Protection', function() {
    it('should reject dangerous regex patterns', function() {
      const db = new JSONORM({ users: [{ email: 'test@example.com' }] });
      
      // Catastrophic backtracking pattern
      assert.throws(() => {
        db.findSync({
          keyName: 'email',
          type: 'regexp',
          value: '^(a+)+'  // Dangerous pattern
        });
      }, /dangerous regex pattern/);
    });
    
    it('should reject regex patterns that are too long', function() {
      const db = new JSONORM({ data: { value: 'test' } });
      
      const longPattern = 'a'.repeat(150);
      assert.throws(() => {
        db.findSync({
          keyName: 'value',
          type: 'regexp',
          value: longPattern
        });
      }, /Invalid regex pattern/);
    });
    
    it('should allow safe regex patterns', function() {
      const db = new JSONORM({ users: [{ email: 'test@example.com' }] });
      
      const result = db.findSync({
        keyName: 'email',
        type: 'regexp',
        value: '^test@'
      });
      
      assert.ok(Array.isArray(result));
      assert.strictEqual(result.length, 1);
    });
  });
  
  describe('Recursion Depth Protection', function() {
    it('should prevent stack overflow with deeply nested objects', function() {
      // Create deeply nested object
      let deepObj = { level: 0 };
      let current = deepObj;
      
      for (let i = 1; i <= 150; i++) {
        current.next = { level: i };
        current = current.next;
      }
      
      const db = new JSONORM(deepObj);
      
      assert.throws(() => {
        db.findSync({ keyName: 'level', type: 'normal', value: 999 });
      }, /Maximum recursion depth/);
    });
    
    it('should work with reasonably nested objects', function() {
      // Create moderately nested object (within limits)
      let obj = { level: 0 };
      let current = obj;
      
      for (let i = 1; i <= 50; i++) {
        current.next = { level: i };
        current = current.next;
      }
      
      const db = new JSONORM(obj);
      const result = db.findSync({ keyName: 'level', type: 'normal', value: 25 });
      
      assert.ok(Array.isArray(result));
      assert.strictEqual(result.length, 1);
    });
  });
  
  describe('Prototype Pollution Protection', function() {
    it('should prevent __proto__ access in get', function() {
      const db = new JSONORM({ data: { value: 'test' } });
      
      assert.throws(() => {
        db.getObject('__proto__.polluted');
      }, /not allowed/);
    });
    
    it('should prevent constructor access', function() {
      const db = new JSONORM({ data: { value: 'test' } });
      
      assert.throws(() => {
        db.getObject('constructor.prototype.polluted');
      }, /not allowed/);
    });
    
    it('should prevent prototype property access', function() {
      const db = new JSONORM({ data: { value: 'test' } });
      
      assert.throws(() => {
        db.getObject('prototype.polluted');
      }, /not allowed/);
    });
    
    it('should prevent __proto__ in insert paths', function() {
      const db = new JSONORM({ data: {} });
      
      assert.throws(() => {
        db.insertSync('__proto__.polluted', 'bad');
      }, /not allowed/);
    });
    
    it('should prevent constructor in update paths', function() {
      const db = new JSONORM({ data: { value: 'test' } });
      
      assert.throws(() => {
        db.updateSync('constructor.prototype.polluted', [{ keyName: 'x', type: 'normal', value: 'bad' }]);
      }, /not allowed/);
    });
  });
  
  describe('Input Validation', function() {
    it('should reject invalid condition objects', function() {
      const db = new JSONORM({ data: { value: 'test' } });
      
      assert.throws(() => {
        db.findSync(null);
      });
      
      assert.throws(() => {
        db.findSync('string');
      }, /Invalid condition/);
    });
    
    it('should reject conditions without keyName', function() {
      const db = new JSONORM({ data: { value: 'test' } });
      
      assert.throws(() => {
        db.findSync({ type: 'normal', value: 'test' });
      }, /keyName/);
    });
    
    it('should reject conditions without type', function() {
      const db = new JSONORM({ data: { value: 'test' } });
      
      assert.throws(() => {
        db.findSync({ keyName: 'value', value: 'test' });
      }, /type/);
    });
    
    it('should reject invalid keyName format', function() {
      const db = new JSONORM({ data: { value: 'test' } });
      
      assert.throws(() => {
        db.findSync({ keyName: 'data/../injection', type: 'normal', value: 'test' });
      }, /Invalid keyName format/);
    });
    
    it('should reject invalid path format', function() {
      const db = new JSONORM({ data: { value: 'test' } });
      
      assert.throws(() => {
        db.insertSync('data/../bad/path', 'value');
      }, /Invalid path format/);
    });
  });
  
  describe('Path Traversal Protection', function() {
    it('should reject null bytes in paths', function() {
      const db = new JSONORM({ data: {} });
      
      assert.throws(() => {
        db.insertSync('data\x00malicious', 'value');
      }, /Invalid path format/);
    });
    
    it('should only allow safe characters in paths', function() {
      const db = new JSONORM({ data: {} });
      
      // These should work
      assert.doesNotThrow(() => {
        db.insertSync('data.valid_path-123', 'value');
      });
      
      // These should fail
      assert.throws(() => {
        db.insertSync('data.invalid<>path', 'value');
      }, /Invalid path format/);
    });
  });
  
  describe('All eval Operations', function() {
    let db;
    
    beforeEach(function() {
      db = new JSONORM({
        users: [
          { name: 'Alice', age: 25 },
          { name: 'Bob', age: 35 },
          { name: 'Charlie', age: 18 }
        ]
      });
    });
    
    it('should support gt (greater than) operation', function() {
      const result = db.findSync({
        keyName: 'age',
        type: 'eval',
        value: { op: 'gt', operand: 30 }
      });
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0], 'users.1'); // Bob at index 1
    });
    
    it('should support lt (less than) operation', function() {
      const result = db.findSync({
        keyName: 'age',
        type: 'eval',
        value: { op: 'lt', operand: 20 }
      });
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0], 'users.2'); // Charlie at index 2
    });
    
    it('should support gte (greater than or equal) operation', function() {
      const result = db.findSync({
        keyName: 'age',
        type: 'eval',
        value: { op: 'gte', operand: 35 }
      });
      assert.strictEqual(result.length, 1);
    });
    
    it('should support lte (less than or equal) operation', function() {
      const result = db.findSync({
        keyName: 'age',
        type: 'eval',
        value: { op: 'lte', operand: 25 }
      });
      assert.strictEqual(result.length, 2);
    });
    
    it('should support eq (equals) operation', function() {
      const result = db.findSync({
        keyName: 'age',
        type: 'eval',
        value: { op: 'eq', operand: 25 }
      });
      assert.strictEqual(result.length, 1);
    });
    
    it('should support neq (not equals) operation', function() {
      const result = db.findSync({
        keyName: 'age',
        type: 'eval',
        value: { op: 'neq', operand: 25 }
      });
      assert.strictEqual(result.length, 2);
    });
    
    it('should support contains operation', function() {
      const result = db.findSync({
        keyName: 'name',
        type: 'eval',
        value: { op: 'contains', operand: 'li' }
      });
      assert.strictEqual(result.length, 2); // Alice and Charlie
    });
    
    it('should support startsWith operation', function() {
      const result = db.findSync({
        keyName: 'name',
        type: 'eval',
        value: { op: 'startsWith', operand: 'A' }
      });
      assert.strictEqual(result.length, 1);
    });
    
    it('should support endsWith operation', function() {
      const result = db.findSync({
        keyName: 'name',
        type: 'eval',
        value: { op: 'endsWith', operand: 'e' }
      });
      assert.strictEqual(result.length, 2); // Alice and Charlie
    });
  });
});
