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
        "ecmaVersion": 13
=======
        "ecmaVersion": 13,
        "sourceType": "module"
>>>>>>> 639dcfa (feat: add prettier and eslint setup)
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "rules": {
    }
};
