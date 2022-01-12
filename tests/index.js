const token = process.env.TOKEN

const expect = require("chai").expect

const GroupMe = require("..")
const client = new GroupMe.Client(token)
const data = {
    testGroup: "70077952",
}

require("./GroupManager")(client, data)

describe("ws", () => {
    before(() => {
        client.login()
        console.log(client)
    })
    after(() => {
        client.logout()
    })
    it("should fetch a group", async () => {
        let g = await client.groups.fetch(data.testGroup)
        expect(g.id).to.be(data.testGroup)
    }).timeout(5000)
})
