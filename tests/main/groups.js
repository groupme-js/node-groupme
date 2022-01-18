const { expect } = require("chai")

const { client, data } = require("..")

describe("Groups", () => {
    let g, m
    
    it("should fetch a group", async () => {
        g = await client.groups.fetch(data.testGroup)
        expect(g.id).to.equal(data.testGroup)
    }).timeout(5000)

    it("should send a message in a group", async () => {
        let str = `Hello from the node-groupme test suite, running version ${data.version} on commit ${data.commit} in branch ${data.branch}`
        m = await g.send(str)
        console.log(m)
        expect(m.text).to.equal(str)
    })
    
    // it("should like a message in a group", async () => {
    //     let l = await m.like()
    //     expect(l).to.equal(true)
    // })

    // it("should unlike a message in a group", async () => {
    //     let l = await m.unlike()
    //     expect(l).to.equal(true)
    // })
})

