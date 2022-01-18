const { client, data } = require(".")


exports.mochaHooks = {
    beforeall(done) {
        client.login()
        done()
    },
    afterAll(done) {
        client.logout()
        done()
    },
}
