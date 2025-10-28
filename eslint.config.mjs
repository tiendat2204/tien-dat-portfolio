import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import neostandard, { plugins } from 'neostandard'

export default [
  ...nextCoreWebVitals, 
  ...nextTypescript, 
  ...neostandard({
    ignores: [
      '**/postcss.config.js',
      '**/postcss.config.ts',
      '**/next.config.js',
      '**/next.config.ts',
      '**/next-env.d.ts',
      '**/withTwin.js',
      '**/tailwind.config.js',
      '**/tailwind.config.ts',
      '**/src/theme/dark/**',
      '**/src/theme/light/**',
      '**/eslint.config.mjs',
      '**/node_modules/**',
      '**/src/components/ui/**',
      '**/.next/**'
    ],
    ts: true
  }), 
  ...plugins['typescript-eslint'].configs['recommended'], 
  {
    plugins: {
      '@stylistic': plugins['@stylistic']
    },
    rules: {
      '@typescript-eslint/array-type': 'error',
      '@eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/consistent-type-imports': 'warn',
    }
  }, 
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"]
  }
];
