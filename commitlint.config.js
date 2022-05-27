module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'subject-case': [1, 'always', ['lower-case']],
        'body-max-line-length': [500],
        'footer-max-line-length': [500],
        'footer-leading-blank': 'never'
    },
}
