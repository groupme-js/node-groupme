const { rest } = require('msw')

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

const api = path => {
    return `https://api.groupme.com/v3${path}`
}

function wrapJsonBody(status, body, errors) {
    const jsonBody = {
        meta: {
            code: status,
        },
        response: body
    }
    if(errors !== undefined) jsonBody.meta.errors = errors
    
    return jsonBody
}

function constructHandler(reqType, path, status, body, bodyType = 'json', errors, headers) {
    const requestResolver = async (req, res, ctx) => {
        const resParams = []
        resParams.push(ctx.status(status))
        if(body !== undefined) {
            let bodyContent = body
            if(typeof body === 'function') bodyContent = body(req)
            switch(bodyType) {
                case 'json':
                    resParams.push(ctx.json(wrapJsonBody(status, bodyContent, errors)))
                case 'text':
                    resParams.push(ctx.text(bodyContent))
                case 'raw':
                    resParams.push(ctx.body(bodyContent))
                default:
                    throw new Error('Body type not implemented')
            }
        }
        if (headers !== undefined) resParams.push(ctx.set(headers))

        return res(...resParams)
    }

    const type = reqType.toUpperCase()
    switch(type) {
        case 'GET':
            return rest.get(api(path), requestResolver)
        case 'POST':
            return rest.post(api(path), requestResolver)
        case 'DELETE':
            return rest.delete(api(path), requestResolver)
        default:
            throw new Error('Invalid HTTP request type')
    }
}

const handlers = [
    rest.get(api('/users/me'), async (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                meta: {
                    code: 200
                },
                response: {
                    created_at: 0,
                    email: 'tester@example.com',
                    facebook_connected: false,
                    id: data.testUser,
                    image_url: null,
                    locale: 'en',
                    name: 'Tester',
                    phone_number: '',
                    sms: false,
                    twitter_connected: false,
                    updated_at: 1,
                    user_id: data.testUser,
                }
            }),
        )
    }),
    rest.get(api('/groups/:group_id'), async (req, res, ctx) => {
        const { group_id } = req.params

        return res(
            ctx.status(200),
            ctx.json({
                meta: {
                    code: 200
                },
                response: {
                    id: group_id,
                    group_id: group_id,
                    name: 'Test Group',
                    type: 'private',
                    description: 'Test description',
                    image_url: null,
                    creator_user_id: data.testUser,
                    created_at: 0,
                    updated_at: 1,
                    messages: {
                        count: 1,
                        last_message_id: '1234567890',
                        last_message_created_at: 2,
                        preview: {
                            nickname: 'Tester',
                            text: 'Hello world',
                            image_url: null,
                            attachments: [],
                        },
                    },
                    share_url: null,
                    members: [
                        {
                            user_id: data.testUser,
                            nickname: 'Tester',
                            muted: false,
                            image_url: null,
                        },
                    ],
                }
            }),
        )
    }),
    rest.post(api('/groups/:group_id/messages'), async (req, res, ctx) => {
        const { group_id } = req.params
        const { message } = req.body
        return res(
            ctx.status(200),
            ctx.json({
                meta: {
                    code: 200
                },
                response: {
                    message: {
                        id: '1',
                        source_guid: 'GUID',
                        created_at: 0,
                        user_id: data.testUser,
                        group_id: group_id,
                        name: 'Tester',
                        avatar_url: null,
                        text: message.text,
                        system: true,
                        favorited_by: [],
                        attachments: [],
                    },
                }
            }),
        )
    }),
]

module.exports = { constructHandler, handlers }
