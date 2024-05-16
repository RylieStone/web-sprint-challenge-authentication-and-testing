const BCRYPT_ROUNDS = 2
const TOKEN = process.env.SECRET || 'shh'

module.exports = {
    BCRYPT_ROUNDS,
    TOKEN
}