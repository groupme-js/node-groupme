if(!process.env.GROUPME_TOKEN) require("dotenv").config()
const token = process.env.GROUPME_TOKEN

const { expect } = require('chai');

const GroupMe = require("..")
const client = new GroupMe.Client(token)
const data = {
    testGroup: "70077952",
}


describe("ws", () => {
    before(() => {
        client.login()
    })
    after(() => {
        client.logout()
    })
    it("should fetch a group", async () => {
        let g = await client.groups.fetch(data.testGroup)
        expect(g.id).to.equal(data.testGroup)
    }).timeout(5000)
})
