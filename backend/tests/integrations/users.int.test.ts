
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

  it('GET /api/users/:id retorna usuário por ID', async () => {
    const user = await prisma.user.create({ data: { name: 'Carlos', email: 'carlos@ex.com' } })

    const res = await request(app).get(`/api/users/${user.id}`)

    expect(res.status).toBe(200)
    expect(res.body.data).toMatchObject({
      id: user.id,
      name: 'Carlos',
      email: 'carlos@ex.com'
    })
  })

  it('GET /api/users/:id retorna 404 para usuário inexistente', async () => {
    const res = await request(app).get('/api/users/99999')

    expect(res.status).toBe(404)
  })

  it('PUT /api/users/:id atualiza nome do usuário', async () => {
    const user = await prisma.user.create({ data: { name: 'Beatriz', email: 'beatriz@ex.com' } })

    const res = await request(app)
      .put(`/api/users/${user.id}`)
      .send({ name: 'Beatriz Silva' })

    expect(res.status).toBe(200)
    expect(res.body.data).toMatchObject({
      id: user.id,
      name: 'Beatriz Silva',
      email: 'beatriz@ex.com'
    })

    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } })
    expect(updatedUser?.name).toBe('Beatriz Silva')
  })

  it('PUT /api/users/:id atualiza email do usuário', async () => {
    const user = await prisma.user.create({ data: { name: 'Daniel', email: 'daniel@ex.com' } })

    const res = await request(app)
      .put(`/api/users/${user.id}`)
      .send({ email: 'daniel.novo@ex.com' })

    expect(res.status).toBe(200)
    expect(res.body.data).toMatchObject({
      id: user.id,
      name: 'Daniel',
      email: 'daniel.novo@ex.com'
    })

    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } })
    expect(updatedUser?.email).toBe('daniel.novo@ex.com')
  })

  it('PUT /api/users/:id atualiza nome e email simultaneamente', async () => {
    const user = await prisma.user.create({ data: { name: 'Elena', email: 'elena@ex.com' } })

    const res = await request(app)
      .put(`/api/users/${user.id}`)
      .send({ name: 'Elena Fernandes', email: 'elena.fernandes@ex.com' })

    expect(res.status).toBe(200)
    expect(res.body.data).toMatchObject({
      id: user.id,
      name: 'Elena Fernandes',
      email: 'elena.fernandes@ex.com'
    })

    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } })
    expect(updatedUser?.name).toBe('Elena Fernandes')
    expect(updatedUser?.email).toBe('elena.fernandes@ex.com')
  })

  it('PUT /api/users/:id retorna 404 para usuário inexistente', async () => {
    const res = await request(app)
      .put('/api/users/99999')
      .send({ name: 'Nome Qualquer' })

    expect(res.status).toBe(404)
  })

  it('PUT /api/users/:id retorna erro 400 para email duplicado', async () => {
    await prisma.user.create({ data: { name: 'Usuario1', email: 'duplicado@ex.com' } })
    const user2 = await prisma.user.create({ data: { name: 'Usuario2', email: 'usuario2@ex.com' } })

    const res = await request(app)
      .put(`/api/users/${user2.id}`)
      .send({ email: 'duplicado@ex.com' })

    expect(res.status).toBe(400)
  })

  it('DELETE /api/users/:id remove usuário existente', async () => {
    const user = await prisma.user.create({ data: { name: 'Fernando', email: 'fernando@ex.com' } })

    const res = await request(app).delete(`/api/users/${user.id}`)

    expect(res.status).toBe(200)

    const deletedUser = await prisma.user.findUnique({ where: { id: user.id } })
    expect(deletedUser).toBeNull()
  })

  it('DELETE /api/users/:id retorna 404 para usuário inexistente', async () => {
    const res = await request(app).delete('/api/users/99999')

    expect(res.status).toBe(404)
  })

  it('DELETE /api/users/:id remove usuário e suas tarefas associadas', async () => {
    const user = await prisma.user.create({ data: { name: 'Gabriela', email: 'gabriela@ex.com' } })
    const category = await prisma.category.create({ data: { name: 'Trabalho' } })

    await prisma.task.create({
      data: {
        title: 'Tarefa de Gabriela',
        description: 'Descrição',
        userId: user.id,
        categoryId: category.id
      }
    })

    const res = await request(app).delete(`/api/users/${user.id}`)

    expect(res.status).toBe(200)

    const deletedUser = await prisma.user.findUnique({ where: { id: user.id } })
    expect(deletedUser).toBeNull()

    const userTasks = await prisma.task.findMany({ where: { userId: user.id } })
    expect(userTasks).toHaveLength(0)
  })

})