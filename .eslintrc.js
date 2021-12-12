module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:vue/essential',
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    'vue'
  ],
  rules: {
    semi: [2, 'always'],
    indent: ['error', 2],
    quotes: ['error', 'single'],
    'prefer-regex-literals': 'off',
    'no-useless-escape': 'off',
    'no-prototype-builtins': 'off'
  }
}
