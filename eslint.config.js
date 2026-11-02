/**
 * ESLint 9 flat config for LWC and Aura.
 * @see https://github.com/salesforce/eslint-config-lwc
 */
const lwcConfig = require("@salesforce/eslint-config-lwc");

module.exports = [
    ...lwcConfig.configs.recommended,
    {
        // Jest hoists jest.mock() factories above ES imports, so mocking
        // @salesforce/apex wire adapters requires require() inside the factory.
        files: ["**/__tests__/**/*.js", "**/__mocks__/**/*.js"],
        languageOptions: {
            globals: {
                require: "readonly",
            },
        },
    },
];
