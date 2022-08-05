module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true
  },
  extends: [
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 12
  },
  rules: {
    'space-before-function-paren': ['error', 'never'],
    semi: [2, 'always'],
    'no-extra-semi': 0,
    'eol-last': ['error', 'never']
  }
};
