if (!process.env.GROUPME_TOKEN) require("dotenv").config()
const token = process.env.GROUPME_TOKEN

const GroupMe = require("..")
const client = new GroupMe.Client(token)
const package = require("../package.json")

let commit = require("child_process").execSync("git rev-parse --short HEAD").toString().trim()
let branch = require("child_process").execSync("git rev-parse --abbrev-ref HEAD").toString().trim()

const data = {
    testGroup: "70077952",
    version: package.version,
    testUser: "99172139",
    commit,
    branch,
}

module.exports = { client, data }
