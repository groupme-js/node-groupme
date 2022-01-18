const { client, data } = require(".")


exports.mochaHooks = {
    beforeall(done) {
        client.login()
        console.log(client)
        done()
        
    },
    afterAll(done) {
        client.logout()
        done()
    },
}
