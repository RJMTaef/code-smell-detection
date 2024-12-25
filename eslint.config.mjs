import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.ts"],
    ignores: ["node_modules", "out"],
    languageOptions: {
      parser: tsParser, 
      parserOptions: {
        ecmaVersion: 6,
        sourceType: "module",
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      "semi": ["warn", "always"], 
      "@typescript-eslint/naming-convention": [
        "warn",
        {
          "selector": "class",
          "format": ["PascalCase"],
        },
      ],
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-misused-promises": "warn",
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/consistent-type-imports": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "warn",
      "@typescript-eslint/no-use-before-define": ["warn", { 
        "functions": false,
        "classes": true
        }],
      "curly": "warn",
      "eqeqeq": "warn",
      "no-throw-literal": "warn",
    },
  },
];
