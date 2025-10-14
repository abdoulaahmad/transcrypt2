module.exports = {
    root: true,
    env: {
        browser: true,
        es2022: true
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
        "prettier"
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
    },
    settings: {
        react: {
            version: "detect"
        }
    },
    rules: {
        "react/react-in-jsx-scope": "off",
        "import/order": [
            "warn",
            {
                "alphabetize": { "order": "asc", "caseInsensitive": true },
                "newlines-between": "always"
            }
        ]
    }
};