module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
<<<<<<< HEAD
<<<<<<< HEAD
        "ecmaVersion": 13
=======
        "ecmaVersion": 13,
        "sourceType": "module"
>>>>>>> 639dcfa (feat: add prettier and eslint setup)
=======
        "ecmaVersion": 13
>>>>>>> 6e6ecd9 (fix: fixed eslint config, server.js and added missing dependencies)
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "rules": {
    }
};
