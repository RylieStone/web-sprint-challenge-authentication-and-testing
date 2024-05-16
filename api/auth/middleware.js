const db = require('../../data/dbConfig')

async function check(req, res, next) {
    const {username, password} = req.body
    if (username === undefined || password === undefined) {
        res.status(401).json({message: 'username and password required'})
    } else {
        next()
    }
}

async function checkCreateUsername(req, res, next) {
    const {username} = req.body
    const dbr = await db('users').where('username', username)
    if (dbr.length === 0) {
        next()
    } else {
        res.status(401).json({message: 'username taken'})
    }
}

async function checkLoginUsername(req, res, next) {
    const {username} = req.body
    const dbr = await db('users').where('username', username)
    if (dbr.length === 1) {
        next()
    } else {
        res.status(401).json('invalid credentials')
    }
}
module.exports = {
    check,
    checkCreateUsername,
    checkLoginUsername
}