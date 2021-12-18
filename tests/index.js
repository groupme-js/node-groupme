const token = process.env.TOKEN

const expect = require("expect.js")
const GroupMe = require("..")
const client = new GroupMe.Client(token)

const data = {
    testGroup: "70077952",
}
client.login()

describe("GroupManager", async () => {
    let g = await client.groups.fetch(data.testGroup)
    it("should fetch a group", async () => {
        expect(g.id).to.be(data.testGroup)
    })
})

setTimeout(() => {
    client.logout()
}, 15000)