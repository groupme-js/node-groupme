const { expect } = require("chai")

const { client, data } = require("..")

describe("ws", () => {
    
    it("should fetch a group", async () => {
        let g = await client.groups.fetch(data.testGroup)
        expect(g.id).to.equal(data.testGroup)
    }).timeout(5000)


})

