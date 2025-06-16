const { FlatCompat } = require('@eslint/eslintrc');
const nextPlugin = require('@next/eslint-plugin-next');
const zodPlugin = require('eslint-plugin-zod');
const path = require('path');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  {
    ignores: [
      '.next/',
      'node_modules/',
      'dist/',
      'build/',
      'playwright-report/',
      'test-results/',
      '.vercel/',
      'coverage/',
      'sarsa-nextjs-v2.0-unzip-first/',
      'src-backup-frankensteined/',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'plugin:prettier/recommended'),
  {
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      '@next/next': nextPlugin,
      zod: zodPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'warn',
      'no-var': 'warn',
      'react/no-unescaped-entities': 'warn',
      '@next/next/no-img-element': 'warn',
      '@next/next/no-css-tags': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
    },
  },
];
