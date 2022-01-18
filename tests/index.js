if(!process.env.GROUPME_TOKEN) require("dotenv").config()
const token = process.env.GROUPME_TOKEN

const GroupMe = require("..")
const client = new GroupMe.Client(token)
const package = require("../package.json")

const data = {
    testGroup: "70077952",
    version: package.version,
    testUser: "99172139"
}

module.exports = {client, data}