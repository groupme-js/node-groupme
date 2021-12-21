const token = process.env.TOKEN

const expect = require("chai").expect

const GroupMe = require("..")
const client = new GroupMe.Client(token)

const data = {
    testGroup: "70077952",
}

describe("ws", async () => {
    before(() => {
        client.login()
    })
    after(() => {
        client.logout()
    })

    let g = await client.groups.fetch(data.testGroup)
    it("should fetch a group",  () => {
        expect(g.id).to.be(data.testGroup)
    })
})
