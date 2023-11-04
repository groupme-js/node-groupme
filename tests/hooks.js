const { client } = require('.')

const { server } = require('./handlers')

exports.mochaHooks = {
    async beforeAll() {
        server.listen()
        await client.login()
    },

    async afterEach() {
        server.resetHandlers()
    },

    async afterAll() {
        await client.logout()
        server.close()
    },
}
