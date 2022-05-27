module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'subject-case': [1, 'always', ['lower-case']],
        'body-max-line-length': [0],
        'footer-max-line-length': [0],
        'footer-leading-blank': [0],
    },
}
