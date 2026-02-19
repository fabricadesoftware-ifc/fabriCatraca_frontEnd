// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format

import { globalIgnores } from "eslint/config";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import pluginVue from "eslint-plugin-vue";
import pluginVitest from "@vitest/eslint-plugin";
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";

// Para permitir mais linguagens em <script> de .vue, descomente se necessário:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })

export default defineConfigWithVueTs(
  {
    name: "app/files-to-lint",
    files: ["**/*.{ts,mts,tsx,vue}"],
  },

  globalIgnores(["**/dist/**", "**/dist-ssr/**", "**/coverage/**"]),

  pluginVue.configs["flat/recommended"],
  vueTsConfigs.recommended,

  {
    ...pluginVitest.configs.recommended,
    files: ["src/**/__tests__/*"],
  },
  {
    plugins: {
      vue: pluginVue,
    },
  },

  {
    files: ["**/*.vue"],
    rules: {
      "vue/block-order": ["error", { order: ["script", "template", "style"] }],
      "vue/max-attributes-per-line": [
        "error",
        {
          singleline: { max: 1 },
          multiline: { max: 1, allowFirstLine: true },
        },
      ],
      "vue/first-attribute-linebreak": [
        "error",
        {
          singleline: "beside",
          multiline: "below",
        },
      ],
      "vue/padding-line-between-tags": [
        "error",
        [
          {
            blankLine: "always",
            prev: "*",
            next: "*",
          },
        ],
      ],
      "vue/singleline-html-element-content-newline": [
        "error",
        {
          ignoreWhenNoAttributes: true,
          ignoreWhenEmpty: true,
        },
      ],
      "vue/new-line-between-multi-line-property": ["error", { minLineOfMultilineProperty: 2 }],
      "vue/prefer-define-options": ["error"],
      "vue/component-name-in-template-casing": [
        "error",
        "PascalCase",
        {
          registeredComponentsOnly: true,
          ignores: [],
        },
      ],
      "vue/block-lang": ["error", { script: { lang: "ts" } }],
      "vue/component-api-style": ["error", ["script-setup"]],
      "vue/define-macros-order": ["error", { order: ["defineProps", "defineEmits"] }],
      "vue/html-button-has-type": [
        "error",
        {
          button: true,
          submit: true,
          reset: true,
        },
      ],
      "vue/html-comment-content-spacing": ["error", "always"],
      "vue/require-typed-ref": ["error"],
      "vue/attributes-order": [
        "error",
        {
          order: [
            "DEFINITION", // is, v-is
            "LIST_RENDERING", // v-for
            "CONDITIONALS", // v-if, v-else-if, v-else, v-show, v-cloak
            "RENDER_MODIFIERS", // v-once, v-pre
            "GLOBAL", // id
            "UNIQUE", // ref, key, slot
            "TWO_WAY_BINDING", // v-model
            "OTHER_DIRECTIVES", // custom directives
            "OTHER_ATTR", // class, style
            "EVENTS", // @click etc
            "CONTENT", // v-text, v-html
          ],
          alphabetical: false,
        },
      ],
    },
  },

  skipFormatting,
);
