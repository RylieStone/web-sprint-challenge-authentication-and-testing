const db = require('../../data/dbConfig')
const bcrypt = require('bcrypt')
const jw = require('jsonwebtoken')
const {TOKEN, BCRYPT_ROUNDS} = require('../keys')

async function create({username, password}) {
const hash = await bcrypt.hash(password, BCRYPT_ROUNDS)
const id = await db('users').insert({username, password: hash})
const user = await db('users').where('id', id).first()
return user
}

async function login({username, password}) {
    const user = await db('users').where('username', username).first()
    const accepted = await bcrypt.compareSync(password, user.password)
    if (accepted) {
        const data = {
            username,
            role: 'user'
        }
        const token = jw.sign(data, TOKEN, {expiresIn: '1d'})
        return {message: `welcome, ${username}`, token: token}
    } else {
        return {message: 'invalid credentials'}
    }
}

module.exports = {
    create,
    login
}