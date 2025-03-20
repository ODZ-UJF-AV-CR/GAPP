const baseConfig = require('../../eslint.config.cjs');

module.exports = [
    ...baseConfig,
    {
        files: ['src/migrations/*.ts'],
        ignores: ['src/migrations/*.ts'],
    },
];
