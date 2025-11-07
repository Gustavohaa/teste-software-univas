
import request from 'supertest'
import app, { prisma as appPrisma } from '../../src/index'
import { prisma, resetDb } from './testDb'
import { describe, it, afterAll, beforeEach, expect } from 'vitest'

describe('Users API', () => {

  afterAll(async () => {
    await prisma.$disconnect()
    await appPrisma.$disconnect()
  })

  beforeEach(async () => {
    await resetDb()
  })

  it('POST /api/users cria usuário válido', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Ana', email: 'ana@ex.com' })
    expect(res.status).toBe(201)
    expect(res.body.data).toMatchObject({ name: 'Ana', email: 'ana@ex.com' })

  })

  it('GET /api/users lista usuários', async () => {
    await prisma.user.create({ data: { name: 'Ana', email: 'ana@ex.com' } })

    const res = await request(app).get('/api/users')

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.some((u: any) => u.email === 'ana@ex.com')).toBe(true)

  })

})