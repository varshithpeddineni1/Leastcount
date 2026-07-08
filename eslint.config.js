import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

// ARC-3a: components may not hard-code color values (hex, rgb/rgba, hsl/hsla, oklch/oklab).
// Tokens themselves (client/src/styles/*.css) are not JS/TS, so ESLint never sees them here.
const COLOR_PATTERN = /#(?:[0-9a-fA-F]{3,4}){1,2}\b|\b(?:rgb|rgba|hsl|hsla|oklch|oklab)\s*\(/;

const localPlugin = {
  rules: {
    'no-hardcoded-color': {
      meta: {
        type: 'problem',
        docs: {
          description:
            'Disallow hard-coded color values in components (ARC-3a); use a design token instead.',
        },
        schema: [],
      },
      create(context) {
        function check(node, raw) {
          if (typeof raw === 'string' && COLOR_PATTERN.test(raw)) {
            context.report({
              node,
              message:
                'Hard-coded color values are not allowed (ARC-3a) — use a design token (var(--token)) instead.',
            });
          }
        }
        return {
          Literal(node) {
            check(node, node.value);
          },
          TemplateElement(node) {
            check(node, node.value.raw);
          },
        };
      },
    },
    'no-console-log': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow console.log in committed code (OBS-1); use the structured logger.',
        },
        schema: [],
      },
      create(context) {
        return {
          CallExpression(node) {
            const callee = node.callee;
            if (
              callee.type === 'MemberExpression' &&
              callee.object.type === 'Identifier' &&
              callee.object.name === 'console' &&
              callee.property.type === 'Identifier' &&
              callee.property.name === 'log'
            ) {
              context.report({
                node,
                message:
                  'console.log is not allowed in committed code (OBS-1) — use the structured logger.',
              });
            }
          },
        };
      },
    },
  },
};

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/playwright-report/**',
      '**/test-results/**',
      'design/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { local: localPlugin },
    rules: {
      'local/no-console-log': 'error',
    },
  },
  {
    files: ['server/**/*.ts', 'shared/**/*.ts', 'e2e/**/*.ts', 'scripts/**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['client/src/**/*.{ts,tsx}'],
    plugins: { local: localPlugin, react, 'react-hooks': reactHooks },
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'local/no-hardcoded-color': 'error',
    },
  },
  {
    files: ['**/*.config.{js,ts,mjs,cjs}', '**/*.test.{ts,tsx}', '**/*.eslint-rules.test.ts'],
    rules: {
      'local/no-hardcoded-color': 'off',
    },
  },
);
