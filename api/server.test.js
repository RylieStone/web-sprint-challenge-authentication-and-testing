const request = require('supertest')
const db = require('../data/dbConfig')
const server = require('./server.js')
const {create, login} = require('../api/auth/auth-model.js')
const Sam = { username: 'Sam', password: 'hehe' }
const Frodo = { username: 'Frodo', password: 'meow' }

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})
beforeEach(async () => {
  await db('users').truncate()
})
afterAll(async () => {
  await db.destroy()
})

describe('server.js', () => {
  it('should set testing environment', () => {
    expect(process.env.NODE_ENV).toBe('testing')
  })
  test('sanity', () => {
  expect(true).toBe(true)
  })
})

describe('testing auth endpoints', () => {
  test('register works and returns user' , async () => {
    const res = await request(server).post('/api/auth/register').send(Sam)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('username')
    expect(res.body).toHaveProperty('password')
    expect(res.body.password).not.toBe('hehe')
  })
  test('register dosnt accept missing fields' , async () => {
    const res = await request(server).post('/api/auth/register').send({})
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toBe('username and password required')
  })
  test('login is functioning properly', async () => {
    await create({username: 'froyo', password: '1234'})
    const res = await request(server).post('/api/auth/login').send({username: 'froyo', password: '1234'})
    expect(res.body).toHaveProperty('message')
    expect(res.body).toHaveProperty('token')
    expect(res.body.message).toBe('welcome, froyo')
  })
  test('login is denying request for incorrect credentials', async () => {
    await create({username: 'froyo', password: '1234'})
    const res = await request(server).post('/api/auth/login').send({username: 'froyo', password: '123'})
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toBe('invalid credentials')
  })

  test('jokes sends dad jokes with correct token', async () => {
    await create({username: 'froyo', password: '1234'})
    const token = await login({username: 'froyo', password: '1234'})
    const res = await request(server).get('/api/jokes').set('authorization', token.token)
    expect(res.body).toHaveLength(3)
    expect(res.body[0]).toMatchObject({id: "0189hNRf2g", joke: "I'm tired of following my dreams. I'm just going to ask them where they are going and meet up with them later."})
  })
  test('jokes does not send data with invalid token', async () => {
    const res = await request(server).get('/api/jokes').set('authorization', 'rawr')
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toBe('token invalid')
  })
  test('jokes does not send data with no token', async () => {
    const res = await request(server).get('/api/jokes')
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toBe('token required')
  })
})