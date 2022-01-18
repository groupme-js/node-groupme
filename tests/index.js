if(!process.env.GROUPME_TOKEN) require("dotenv").config()
const token = process.env.GROUPME_TOKEN

const GroupMe = require("..")
const client = new GroupMe.Client(token)
const data = {
    testGroup: "70077952",
}

module.exports = {client, data}