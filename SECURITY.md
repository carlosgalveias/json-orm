# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in json-orm, please report it by emailing the maintainer or opening a private security advisory on GitHub.

**Please do not report security vulnerabilities through public GitHub issues.**

We will respond to security reports within 48 hours and will work with you to understand and address the issue promptly.

## Security Features

### Protection Against Common Vulnerabilities

#### 1. Arbitrary Code Execution Prevention
- **Removed eval()**: The dangerous `eval()` function has been completely removed
- **Whitelisted Operations**: Only safe, pre-defined operations are allowed
- Safe operations include: `gt`, `lt`, `gte`, `lte`, `eq`, `neq`, `contains`, `startsWith`, `endsWith`

**Secure Usage:**
```javascript
// ✅ Safe: Old string format (safely parsed)
db.findSync({
  keyName: 'age',
  type: 'eval',
  value: '> 18'
});

// ✅ Safe: New object format
db.findSync({
  keyName: 'age',
  type: 'eval',
  value: { op: 'gt', operand: 18 }
});

// ❌ Rejected: Invalid/dangerous expressions
db.findSync({
  keyName: 'age',
  type: 'eval',
  value: '> 18; maliciousCode()'  // Will throw error
});
```

#### 2. Path Traversal Protection
- **Path Validation**: All file paths are validated and normalized
- **Null Byte Detection**: Prevents null byte injection attacks
- **Extension Validation**: Only `.json` files are allowed
- **Size Limits**: Maximum file size of 10MB

**Secure Usage:**
```javascript
// ✅ Safe: Loads from data directory
db.load('users.json');

// ❌ Rejected: Path traversal attempt
db.load('../../../etc/passwd');  // Will throw error
```

#### 3. Regular Expression Denial of Service (ReDoS) Protection
- **Pattern Validation**: Dangerous regex patterns are detected and blocked
- **Length Limits**: Maximum pattern length of 100 characters
- **Input Size Limits**: Test strings limited to 10,000 characters

**Secure Usage:**
```javascript
// ✅ Safe: Simple regex pattern
db.findSync({
  keyName: 'email',
  type: 'regexp',
  value: '^test@'
});

// ❌ Rejected: Catastrophic backtracking pattern
db.findSync({
  keyName: 'email',
  type: 'regexp',
  value: '^(a+)+'  // Will throw error
});
```

#### 4. Recursion Depth Protection
- **Maximum Depth**: Objects can be nested up to 100 levels deep
- **Stack Overflow Prevention**: Prevents crashes from maliciously deep structures

**Secure Usage:**
```javascript
// ✅ Safe: Reasonably nested object
const data = { level1: { level2: { level3: { value: 'data' } } } };

// ❌ Rejected: Exceeds 100 levels of nesting
// Will throw "Maximum recursion depth exceeded" error
```

#### 5. Prototype Pollution Protection
- **Property Blocking**: Access to `__proto__`, `constructor`, and `prototype` is blocked
- **Safe Object Creation**: Uses `Object.create(null)` for intermediate objects
- **hasOwnProperty Checks**: Ensures only own properties are accessed

**Secure Usage:**
```javascript
// ✅ Safe: Normal property access
db.findSync({ keyName: 'data.user.name', value: 'John' });

// ❌ Rejected: Prototype pollution attempt
db.findSync({ keyName: '__proto__.polluted', value: 'bad' });  // Will throw error
db.insertSync('constructor.prototype.admin', true);  // Will throw error
```

#### 6. Input Validation
- **Format Validation**: All paths and keyNames are validated
- **Type Checking**: Ensures parameters are of correct types
- **Safe Character Set**: Only alphanumeric, dots, underscores, and hyphens allowed

**Secure Usage:**
```javascript
// ✅ Safe: Valid characters
db.insertSync('user.profile.name', 'John');
db.insertSync('data_value-123', 'test');

// ❌ Rejected: Invalid characters
db.insertSync('user/../admin', 'value');  // Will throw error
db.insertSync('data<script>', 'value');   // Will throw error
```

## Security Best Practices

### For Application Developers

1. **Input Sanitization**: Always validate and sanitize user input before passing to json-orm
2. **Error Handling**: Implement proper error handling to avoid information leakage
3. **Access Control**: Implement authentication and authorization in your application layer
4. **Audit Logging**: Log all data access and modifications for security auditing
5. **Regular Updates**: Keep json-orm updated to receive security patches

### For Library Users

1. **Use Latest Version**: Always use the latest version to benefit from security fixes
2. **Review Queries**: Review all query patterns, especially user-provided ones
3. **Limit Input**: Restrict the complexity and size of user-provided data
4. **Monitor Resources**: Monitor application resource usage to detect attacks
5. **Test Security**: Include security tests in your test suite

### Example: Secure Implementation

```javascript
const JSONORM = require('json-orm');

class SecureDataAccess {
  constructor(dataPath) {
    this.db = new JSONORM();
    // Only load from validated paths
    this.db.load(this.validatePath(dataPath));
  }
  
  validatePath(path) {
    // Implement additional validation
    if (!/^[a-zA-Z0-9_-]+\.json$/.test(path)) {
      throw new Error('Invalid file path');
    }
    return path;
  }
  
  safeQuery(userInput) {
    // Sanitize and validate user input
    const sanitized = this.sanitizeInput(userInput);
    
    try {
      return this.db.findSync(sanitized);
    } catch (error) {
      // Log error without exposing details to user
      console.error('Query failed:', error.message);
      throw new Error('Query failed');
    }
  }
  
  sanitizeInput(input) {
    // Implement input sanitization logic
    // Validate types, formats, and values
    return {
      keyName: String(input.keyName).slice(0, 100),
      type: ['exact', 'regexp', 'eval'].includes(input.type) ? input.type : 'exact',
      value: this.sanitizeValue(input.value)
    };
  }
  
  sanitizeValue(value) {
    // Implement value sanitization based on type
    if (typeof value === 'string') {
      return value.slice(0, 1000);
    }
    return value;
  }
}
```

## Backward Compatibility

### eval() Operation Format

The `eval` type supports **both** string and object formats for maximum compatibility:

**String Format (Backward Compatible):**
```javascript
// Safely parsed without code execution
{ keyName: 'age', type: 'eval', value: '> 18' }
{ keyName: 'age', type: 'eval', value: '<= 100' }
{ keyName: 'name', type: 'eval', value: '.startsWith("J")' }
```

**Object Format (Recommended):**
```javascript
{ keyName: 'age', type: 'eval', value: { op: 'gt', operand: 18 } }
{ keyName: 'age', type: 'eval', value: { op: 'lte', operand: 100 } }
{ keyName: 'name', type: 'eval', value: { op: 'startsWith', operand: 'J' } }
```

**Supported Operations:**
- Numeric comparisons: `gt` (>), `lt` (<), `gte` (>=), `lte` (<=), `eq` (===), `neq` (!==)
- String operations: `contains` (.includes), `startsWith` (.startsWith), `endsWith` (.endsWith)

**Security Note:** Both formats are secure. String expressions are parsed using a whitelist of safe operators, preventing code injection.

## Security Audit History

- **2025-12**: Comprehensive security audit completed
  - Removed arbitrary code execution via eval()
  - Implemented path traversal protection
  - Added ReDoS protection
  - Implemented recursion depth limits
  - Added prototype pollution protection
  - Enhanced input validation
  - 29 security tests added (83 total tests)

## Dependencies

This library has **zero runtime dependencies**, significantly reducing supply chain security risks.

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)