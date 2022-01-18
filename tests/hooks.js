const { client, data } = require(".")


exports.mochaHooks = {
    async beforeall(done) {
        await client.login()
        done()
        
    },
    async afterAll(done) {
        client.logout()
        done()
    },
}
