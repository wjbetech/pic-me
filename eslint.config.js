import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['src/game-core/**/*.{ts,tsx}'],
    rules: {
      // game-core must stay dependency-free so it can be extracted to a
      // shared package later (HANDOFF §4). React/bundler/storage stay in
      // the adapter layer.
      'no-restricted-imports': ['error', {
        patterns: [{
          group: [
            'react', 'react-dom', 'react/*', 'react-dom/*',
            'framer-motion', 'framer-motion/*',
            'zustand', 'zustand/*',
          ],
          message: 'game-core must remain dependency-free (see docs/HANDOFF.md §4).',
        }],
      }],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
])
