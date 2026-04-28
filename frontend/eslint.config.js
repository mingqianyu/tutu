import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import eslintConfigPrettier from 'eslint-config-prettier'

export default tseslint.config(
  // 忽略构建产物
  { ignores: ['dist/**', 'node_modules/**'] },

  // JS 推荐规则
  js.configs.recommended,

  // TypeScript 推荐规则
  ...tseslint.configs.recommended,

  // Vue 3 推荐规则
  ...pluginVue.configs['flat/recommended'],

  // Vue 文件使用 TypeScript 解析器
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },

  // 项目自定义规则
  {
    rules: {
      // TypeScript 已处理未定义变量检查，关闭 ESLint 的 no-undef
      'no-undef': 'off',
      // 允许未使用的变量以 _ 开头
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      // 允许 any（逐步收紧）
      '@typescript-eslint/no-explicit-any': 'warn',
      // Vue 组件名不强制多单词
      'vue/multi-word-component-names': 'off',
      // 允许 v-html（项目中无用户输入的 HTML）
      'vue/no-v-html': 'off',
      // 关闭属性排序（交给 Prettier）
      'vue/attributes-order': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
    },
  },

  // Prettier 兼容（关闭冲突规则）
  eslintConfigPrettier,
)
