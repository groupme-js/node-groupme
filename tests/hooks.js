const { client, data } = require(".")

const { setupServer } = require("msw/node")
const { handlers } = require("./handlers")

const server = setupServer(...handlers)

exports.mochaHooks = {
    async beforeAll() {
        server.listen()
        await client.login()
    },

    async afterEach() {
        server.resetHandlers()
    },

    async afterAll() {
        client.logout()
        server.close()
    },
}
