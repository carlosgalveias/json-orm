# JSON-ORM

A lightweight, zero-dependency Node.js library for querying and manipulating JSON data structures using an ORM-like interface. Perfect for working with JSON files as simple data stores without the overhead of a full database.

[![npm version](https://img.shields.io/npm/v/json-orm.svg)](https://www.npmjs.com/package/json-orm)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 **Zero Dependencies** - No external runtime dependencies
- 🔍 **Powerful Query System** - Find data using an intuitive query language
- 📝 **CRUD Operations** - Full create, read, update, and delete support
- 🔄 **Async/Sync API** - Both promise-based and synchronous methods
- 📁 **File Persistence** - Load from and save to JSON files
- 🎯 **Path-based Access** - Navigate nested structures with dot notation
- 🔗 **Logical Operators** - Complex queries with AND/OR conditions
- 🔎 **Pattern Matching** - Support for wildcards and regular expressions

## Installation

```bash
npm install json-orm
```

## Quick Start

```javascript
const JSONORM = require('json-orm');

const data = {
  users: [
    { id: 1, name: 'John Doe', role: 'admin' },
    { id: 2, name: 'Jane Smith', role: 'user' }
  ]
};

const db = new JSONORM(data);

const admins = db.findSync({
  keyName: 'role',
  value: 'admin'
});

console.log(admins);

const adminUser = db.getObject(admins[0]);
console.log(adminUser);
```

## API Reference

### Constructor

Creates a new JSON-ORM instance.

```javascript
new JSONORM([json])
```

**Parameters:**
- `json` (String|Object, optional) - A JSON string or object to initialize with

**Example:**

```javascript
const db = new JSONORM({ users: [] });

const db2 = new JSONORM('{"users": []}');

const db3 = new JSONORM();
```

### Finding Data

#### `findSync(query)`

Synchronously finds all paths to objects matching the query.

**Parameters:**
- `query` (Object) - The search query

**Returns:** `Array<string>` - Array of dot-notation paths to matching objects

**Example:**

```javascript
const data = {
  posts: [
    { id: 1, title: 'Hello World', author: 'John' },
    { id: 2, title: 'JSON ORM Guide', author: 'Jane' }
  ]
};

const db = new JSONORM(data);

const results = db.findSync({
  keyName: 'author',
  value: 'John'
});

const allPosts = db.findSync({
  keyName: 'title',
  value: '*'
});
```

#### `find(query)`

Asynchronous version of `findSync()`.

**Returns:** `Promise<Array<string>>`

**Example:**

```javascript
db.find({ keyName: 'author', value: 'John' })
  .then(results => {
    console.log(results);
  })
  .catch(err => console.error(err));

const results = await db.find({ keyName: 'author', value: 'John' });
```

### Updating Data

#### `updateSync(path, updates)`

Synchronously updates objects at the specified path(s).

**Parameters:**
- `path` (String|Array<string>) - Path or array of paths to update
- `updates` (Array<Object>) - Array of update instructions

**Update Object Properties:**
- `keyName` (String) - Property name to update
- `type` (String) - Update type: `'normal'` (default) or `'eval'`
- `value` (Any) - New value or replacement rules

**Example:**

```javascript
const db = new JSONORM({
  users: [{ id: 1, name: 'John', status: 'active' }]
});

db.updateSync('users.0', [{
  keyName: 'email',
  type: 'normal',
  value: 'john@example.com'
}]);

db.updateSync('users.0', [{
  keyName: 'status',
  type: 'normal',
  value: { src: ['active'], dst: ['verified'] }
}]);

db.updateSync('users.0', [
  { keyName: 'lastLogin', value: new Date().toISOString() },
  { keyName: 'loginCount', value: 5 }
]);
```

#### `update(path, updates)`

Asynchronous version of `updateSync()`.

**Returns:** `Promise<void>`

**Example:**

```javascript
await db.update('users.0', [{
  keyName: 'status',
  value: 'verified'
}]);
```

### Inserting Data

#### `insertSync(path, object, [before])`

Synchronously inserts a new object as a sibling to the object at the specified path.

**Parameters:**
- `path` (String|Array<string>) - Path to the reference object
- `object` (Any) - The object to insert
- `before` (Boolean, optional) - If `true`, insert before the reference; otherwise after (default)

**Example:**

```javascript
const db = new JSONORM({
  tasks: [
    { id: 1, title: 'Task 1' },
    { id: 3, title: 'Task 3' }
  ]
});

db.insertSync('tasks.0', { id: 2, title: 'Task 2' });

db.insertSync('tasks.0', { id: 0, title: 'Task 0' }, true);
```

#### `insert(path, object, [before])`

Asynchronous version of `insertSync()`.

**Returns:** `Promise<void>`

**Example:**

```javascript
await db.insert('tasks.0', { id: 2, title: 'New Task' });
```

### Removing Data

#### `removeSync(path)`

Synchronously removes objects at the specified path(s).

**Parameters:**
- `path` (String|Array<string>) - Path or array of paths to remove

**Example:**

```javascript
const db = new JSONORM({
  items: [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' }
  ]
});

db.removeSync('items.1');

db.removeSync(['items.0', 'items.1']);
```

#### `remove(path)`

Asynchronous version of `removeSync()`.

**Returns:** `Promise<void>`

**Example:**

```javascript
await db.remove('items.1');
```

### Other Methods

#### `getObject(path)`

Gets the object at the specified path. Returns a reference to the actual object.

**Parameters:**
- `path` (String) - Dot-notation path to the object

**Returns:** The object at the specified path

**Example:**

```javascript
const user = db.getObject('users.0');
console.log(user.name);

user.status = 'updated';
console.log(db.data.users[0].status);
```

#### `setObject(path, object)`

Sets an object at the specified path.

**Parameters:**
- `path` (String) - Dot-notation path where to set the object
- `object` (Any) - The object to set

**Returns:** The modified data object

**Example:**

```javascript
db.setObject('users.0', { id: 1, name: 'Updated User' });
```

#### `getParent(path)`

Gets the parent path by removing the last segment.

**Parameters:**
- `path` (String) - The dot-notation path

**Returns:** `String` - The parent path

**Example:**

```javascript
const parent = db.getParent('users.0.profile.email');
console.log(parent);
```

#### `load(filePath)`

Loads JSON data from a file.

**Parameters:**
- `filePath` (String) - Path to the JSON file

**Example:**

```javascript
const db = new JSONORM();
db.load('./data/users.json');
```

#### `save(filePath)`

Saves the current data to a JSON file.

**Parameters:**
- `filePath` (String) - Path where to save the file

**Example:**

```javascript
db.save('./data/users-backup.json');
```

#### `data`

Property that holds the current JSON data.

**Example:**

```javascript
console.log(db.data);
```

## Query Language

The query system supports various matching strategies:

### Simple Query

Match objects where a property equals a specific value:

```javascript
{
  keyName: 'status',
  type: 'normal',
  value: 'active'
}
```

### Wildcard Matching

Match any value for a property:

```javascript
{
  keyName: 'email',
  value: '*'
}
```

### Regular Expression Matching

Use regex patterns for complex matching:

```javascript
{
  keyName: 'email',
  type: 'regexp',
  value: '^john.*@example\\.com$'
}
```

### Nested Property Access

Query nested properties using dot notation:

```javascript
{
  keyName: 'profile.address.city',
  value: 'New York'
}
```

### AND Conditions

All conditions must match:

```javascript
{
  and: [
    { keyName: 'status', value: 'active' },
    { keyName: 'role', value: 'admin' }
  ]
}
```

### OR Conditions

At least one condition must match:

```javascript
{
  or: [
    { keyName: 'role', value: 'admin' },
    { keyName: 'role', value: 'moderator' }
  ]
}
```

## Advanced Examples

### Example 1: User Management System

```javascript
const JSONORM = require('json-orm');

const db = new JSONORM({
  users: [
    { id: 1, username: 'john_doe', email: 'john@example.com', role: 'user', active: true },
    { id: 2, username: 'jane_admin', email: 'jane@example.com', role: 'admin', active: true },
    { id: 3, username: 'bob_user', email: 'bob@example.com', role: 'user', active: false }
  ]
});

const activeAdmins = db.findSync({
  and: [
    { keyName: 'role', value: 'admin' },
    { keyName: 'active', value: true }
  ]
});

console.log('Active admins:', activeAdmins);

const inactiveUsers = db.findSync({ keyName: 'active', value: false });
inactiveUsers.forEach(path => {
  db.updateSync(path, [
    { keyName: 'active', value: true },
    { keyName: 'reactivatedAt', value: new Date().toISOString() }
  ]);
});

const updatedUser = db.getObject(inactiveUsers[0]);
console.log('Reactivated user:', updatedUser);
```

### Example 2: Working with Nested Data

```javascript
const db = new JSONORM({
  company: {
    departments: [
      {
        name: 'Engineering',
        employees: [
          { id: 1, name: 'Alice', position: 'Senior Developer' },
          { id: 2, name: 'Bob', position: 'Junior Developer' }
        ]
      },
      {
        name: 'Sales',
        employees: [
          { id: 3, name: 'Charlie', position: 'Sales Manager' }
        ]
      }
    ]
  }
});

const seniorDevs = db.findSync({
  keyName: 'position',
  value: 'Senior Developer'
});

console.log('Senior developers found at:', seniorDevs);

const engineeringPath = 'company.departments.0.employees.1';
db.insertSync(engineeringPath, {
  id: 4,
  name: 'Diana',
  position: 'DevOps Engineer'
});
```

### Example 3: File-based Data Store

```javascript
const JSONORM = require('json-orm');
const path = require('path');

const db = new JSONORM();
db.load(path.join(__dirname, 'products.json'));

const electronics = db.findSync({
  keyName: 'category',
  value: 'electronics'
});

electronics.forEach(productPath => {
  const product = db.getObject(productPath);
  db.updateSync(productPath, [{
    keyName: 'price',
    value: product.price * 0.9
  }]);
});

db.save(path.join(__dirname, 'products.json'));
console.log('Prices updated and saved!');
```

### Example 4: Complex Query with OR Conditions

```javascript
const db = new JSONORM({
  tasks: [
    { id: 1, title: 'Fix bug', priority: 'high', status: 'open' },
    { id: 2, title: 'Update docs', priority: 'low', status: 'open' },
    { id: 3, title: 'Review PR', priority: 'high', status: 'in_progress' },
    { id: 4, title: 'Deploy', priority: 'critical', status: 'open' }
  ]
});

const urgentTasks = db.findSync({
  or: [
    { keyName: 'priority', value: 'high' },
    { keyName: 'priority', value: 'critical' }
  ]
});

console.log('Urgent tasks:', urgentTasks);

urgentTasks.forEach(path => {
  db.updateSync(path, [{
    keyName: 'status',
    value: 'in_progress'
  }]);
});
```

## Best Practices

### 1. Use Sync Methods for Simple Operations

For straightforward operations, synchronous methods are cleaner and easier to read:

```javascript
const users = db.findSync({ keyName: 'role', value: 'admin' });
```

### 2. Use Async Methods for Complex Workflows

For complex operations or when working with file I/O, use async methods:

```javascript
async function processUsers() {
  const users = await db.find({ keyName: 'active', value: true });
  for (const userPath of users) {
    await db.update(userPath, [{ keyName: 'processed', value: true }]);
  }
}
```

### 3. Leverage Object References

The `getObject()` method returns a reference, allowing direct modifications:

```javascript
const user = db.getObject('users.0');
user.lastSeen = new Date().toISOString();
```

### 4. Batch Operations

When updating multiple objects, use array paths for better performance:

```javascript
const paths = db.findSync({ keyName: 'status', value: 'pending' });
db.updateSync(paths, [{ keyName: 'status', value: 'processed' }]);
```

### 5. Use Wildcard for Property Existence Checks

Find all objects that have a specific property:

```javascript
const withEmail = db.findSync({ keyName: 'email', value: '*' });
```

## Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm run coverage

```

## Performance Considerations

### Memory Efficiency

JSON-ORM works with in-memory JSON objects. For large datasets:

- Consider loading only necessary data subsets
- Use file-based operations (`load`/`save`) for persistence
- Remove unused data with `removeSync()` to free memory

### Query Optimization

- Use specific queries over wildcards when possible
- Leverage AND/OR conditions to combine multiple criteria in one query
- Cache frequently used paths instead of re-querying

## Common Use Cases

### Configuration Management

```javascript
const config = new JSONORM();
config.load('./config.json');

const dbConfig = config.getObject('database');
dbConfig.timeout = 5000;

config.save('./config.json');
```

### Test Data Management

```javascript
const testData = new JSONORM({
  fixtures: {
    users: [],
    posts: []
  }
});

testData.insertSync('fixtures.users', { id: 1, name: 'Test User' });
```

### Log Processing

```javascript
const logs = new JSONORM();
logs.load('./logs.json');

const errors = logs.findSync({
  keyName: 'level',
  value: 'error'
});

console.log(`Found ${errors.length} errors`);
```

## Troubleshooting

### Cannot find objects

Ensure your query matches the exact property names and values:

```javascript
const results = db.findSync({ keyName: 'Status', value: 'active' });
```

### Path not found errors

Verify paths using `getObject()` with error handling:

```javascript
try {
  const obj = db.getObject('users.0.profile');
} catch (error) {
  console.error('Path does not exist:', error);
}
```

### Updates not persisting

Remember to call `save()` after modifications:

```javascript
db.updateSync('users.0', [{ keyName: 'status', value: 'updated' }]);
db.save('./users.json');
```

## Security

json-orm implements multiple security controls to protect against common vulnerabilities:

- ✅ **No Arbitrary Code Execution**: Safe operation system replaces eval()
- ✅ **Path Traversal Protection**: Validated file operations
- ✅ **ReDoS Protection**: Regex pattern validation
- ✅ **Recursion Limits**: Prevents stack overflow
- ✅ **Prototype Pollution Protection**: Blocks dangerous property access
- ✅ **Input Validation**: Comprehensive parameter validation

For detailed security information, see [SECURITY.md](SECURITY.md).

### Backward Compatibility

The `eval` operation now accepts **both formats** for maximum compatibility:

```javascript
// ✅ Old format (still supported, parsed safely)
db.findSync({ keyName: 'age', type: 'eval', value: '> 18' });
db.findSync({ keyName: 'name', type: 'eval', value: '.startsWith("J")' });

// ✅ New format (also supported)
db.findSync({
  keyName: 'age',
  type: 'eval',
  value: { op: 'gt', operand: 18 }
});
```

**Both formats are secure** - string expressions are safely parsed without code execution.

**Supported eval operations:** `gt`, `lt`, `gte`, `lte`, `eq`, `neq`, `contains`, `startsWith`, `endsWith`

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:
- All tests pass (`npm test`)
- Code follows existing style conventions
- New features include tests
- Documentation is updated

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Carlos Galveias

## Repository

[https://github.com/carlosgalveias/json-orm](https://github.com/carlosgalveias/json-orm)

## Keywords

- Node.js
- JSON
- ORM
- Query
- Database
- Data manipulation
- File-based database

## Changelog

### 0.0.23
- Zero-dependency implementation
- Modernized codebase
- Improved documentation
- Enhanced test coverage
