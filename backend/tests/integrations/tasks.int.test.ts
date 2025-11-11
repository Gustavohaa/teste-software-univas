
import request from 'supertest'

import app, { prisma as appPrisma } from '../../src/index'

import { prisma, resetDb } from './testDb'
import { describe, it, afterAll, beforeEach, expect } from 'vitest'

describe('Tasks API', () => {
  afterAll(async () => {
    await prisma.$disconnect()
    await appPrisma.$disconnect()
  })

  beforeEach(async () => {
    await resetDb()
  })

  async function createTestData() {
    const user = await prisma.user.create({
      data: { name: 'Test User', email: 'test@example.com' }
    })

    const category = await prisma.category.create({
      data: { name: 'Test Category', description: 'Test Description' }
    })

    return { user, category }
  }

  describe('POST /api/tasks', () => {
    it('cria tarefa válida', async () => {
      const { user, category } = await createTestData()

      const res = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Nova Tarefa',
          description: 'Descrição da tarefa',
          status: 'PENDING',
          priority: 'HIGH',
          userId: user.id,
          categoryId: category.id
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toMatchObject({
        title: 'Nova Tarefa',
        description: 'Descrição da tarefa',
        status: 'PENDING',
        priority: 'HIGH'
      })
      expect(res.body.data.user).toBeDefined()
      expect(res.body.data.category).toBeDefined()
    })

    it('cria tarefa com campos opcionais padrão', async () => {
      const { user, category } = await createTestData()

      const res = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Tarefa Simples',
          userId: user.id,
          categoryId: category.id
        })

      expect(res.status).toBe(201)
      expect(res.body.data).toMatchObject({
        title: 'Tarefa Simples',
        status: 'PENDING',
        priority: 'MEDIUM'
      })
    })

    it('retorna erro 400 quando título está faltando', async () => {
      const { user, category } = await createTestData()

      const res = await request(app)
        .post('/api/tasks')
        .send({
          userId: user.id,
          categoryId: category.id
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.error).toBe('Validation error')
    })

    it('retorna erro 404 quando usuário não existe', async () => {
      const { category } = await createTestData()

      const res = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Tarefa',
          userId: 'id-inexistente',
          categoryId: category.id
        })

      expect(res.status).toBe(404)
      expect(res.body.error).toBe('User not found')
    })

    it('retorna erro 404 quando categoria não existe', async () => {
      const { user } = await createTestData()

      const res = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Tarefa',
          userId: user.id,
          categoryId: 'id-inexistente'
        })

      expect(res.status).toBe(404)
      expect(res.body.error).toBe('Category not found')
    })
  })

  describe('GET /api/tasks', () => {
    it('lista todas as tarefas', async () => {
      const { user, category } = await createTestData()

      await prisma.task.create({
        data: {
          title: 'Tarefa 1',
          userId: user.id,
          categoryId: category.id
        }
      })

      await prisma.task.create({
        data: {
          title: 'Tarefa 2',
          userId: user.id,
          categoryId: category.id
        }
      })

      const res = await request(app).get('/api/tasks')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.count).toBe(2)
      expect(res.body.data[0].user).toBeDefined()
      expect(res.body.data[0].category).toBeDefined()
    })

    it('retorna lista vazia quando não há tarefas', async () => {
      const res = await request(app).get('/api/tasks')

      expect(res.status).toBe(200)
      expect(res.body.count).toBe(0)
      expect(res.body.data).toEqual([])
    })

    it('filtra tarefas por status', async () => {
      const { user, category } = await createTestData()

      await prisma.task.create({
        data: {
          title: 'Tarefa Pendente',
          status: 'PENDING',
          userId: user.id,
          categoryId: category.id
        }
      })

      await prisma.task.create({
        data: {
          title: 'Tarefa Concluída',
          status: 'COMPLETED',
          userId: user.id,
          categoryId: category.id
        }
      })

      const res = await request(app).get('/api/tasks?status=COMPLETED')

      expect(res.status).toBe(200)
      expect(res.body.count).toBe(1)
      expect(res.body.data[0].status).toBe('COMPLETED')
    })

    it('filtra tarefas por prioridade', async () => {
      const { user, category } = await createTestData()

      await prisma.task.create({
        data: {
          title: 'Tarefa Urgente',
          priority: 'URGENT',
          userId: user.id,
          categoryId: category.id
        }
      })

      await prisma.task.create({
        data: {
          title: 'Tarefa Normal',
          priority: 'MEDIUM',
          userId: user.id,
          categoryId: category.id
        }
      })

      const res = await request(app).get('/api/tasks?priority=URGENT')

      expect(res.status).toBe(200)
      expect(res.body.count).toBe(1)
      expect(res.body.data[0].priority).toBe('URGENT')
    })

    it('filtra tarefas por userId', async () => {
      const { user, category } = await createTestData()
      const user2 = await prisma.user.create({
        data: { name: 'User 2', email: 'user2@example.com' }
      })

      await prisma.task.create({
        data: {
          title: 'Tarefa User 1',
          userId: user.id,
          categoryId: category.id
        }
      })

      await prisma.task.create({
        data: {
          title: 'Tarefa User 2',
          userId: user2.id,
          categoryId: category.id
        }
      })

      const res = await request(app).get(`/api/tasks?userId=${user.id}`)

      expect(res.status).toBe(200)
      expect(res.body.count).toBe(1)
      expect(res.body.data[0].userId).toBe(user.id)
    })

    it('filtra tarefas por categoryId', async () => {
      const { user, category } = await createTestData()
      const category2 = await prisma.category.create({
        data: { name: 'Category 2' }
      })

      await prisma.task.create({
        data: {
          title: 'Tarefa Cat 1',
          userId: user.id,
          categoryId: category.id
        }
      })

      await prisma.task.create({
        data: {
          title: 'Tarefa Cat 2',
          userId: user.id,
          categoryId: category2.id
        }
      })

      const res = await request(app).get(`/api/tasks?categoryId=${category2.id}`)

      expect(res.status).toBe(200)
      expect(res.body.count).toBe(1)
      expect(res.body.data[0].categoryId).toBe(category2.id)
    })
  })

  describe('GET /api/tasks/:id', () => {
    it('retorna tarefa por ID', async () => {
      const { user, category } = await createTestData()

      const task = await prisma.task.create({
        data: {
          title: 'Minha Tarefa',
          description: 'Descrição detalhada',
          userId: user.id,
          categoryId: category.id
        }
      })

      const res = await request(app).get(`/api/tasks/${task.id}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toMatchObject({
        title: 'Minha Tarefa',
        description: 'Descrição detalhada'
      })
      expect(res.body.data.user).toBeDefined()
      expect(res.body.data.category).toBeDefined()
    })

    it('retorna 404 para tarefa inexistente', async () => {
      const res = await request(app).get('/api/tasks/id-inexistente')

      expect(res.status).toBe(404)
      expect(res.body.success).toBe(false)
      expect(res.body.error).toBe('Task not found')
    })
  })

  describe('PUT /api/tasks/:id', () => {
    it('atualiza tarefa completamente', async () => {
      const { user, category } = await createTestData()

      const task = await prisma.task.create({
        data: {
          title: 'Tarefa Original',
          description: 'Descrição original',
          status: 'PENDING',
          priority: 'LOW',
          userId: user.id,
          categoryId: category.id
        }
      })

      const res = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({
          title: 'Tarefa Atualizada',
          description: 'Nova descrição',
          status: 'IN_PROGRESS',
          priority: 'HIGH'
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toMatchObject({
        title: 'Tarefa Atualizada',
        description: 'Nova descrição',
        status: 'IN_PROGRESS',
        priority: 'HIGH'
      })
    })

    it('atualiza apenas o título', async () => {
      const { user, category } = await createTestData()

      const task = await prisma.task.create({
        data: {
          title: 'Título Original',
          description: 'Descrição',
          userId: user.id,
          categoryId: category.id
        }
      })

      const res = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ title: 'Novo Título' })

      expect(res.status).toBe(200)
      expect(res.body.data.title).toBe('Novo Título')
      expect(res.body.data.description).toBe('Descrição')
    })

    it('atualiza apenas o status', async () => {
      const { user, category } = await createTestData()

      const task = await prisma.task.create({
        data: {
          title: 'Tarefa',
          status: 'PENDING',
          userId: user.id,
          categoryId: category.id
        }
      })

      const res = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ status: 'COMPLETED' })

      expect(res.status).toBe(200)
      expect(res.body.data.status).toBe('COMPLETED')
    })

    it('atualiza apenas a prioridade', async () => {
      const { user, category } = await createTestData()

      const task = await prisma.task.create({
        data: {
          title: 'Tarefa',
          priority: 'LOW',
          userId: user.id,
          categoryId: category.id
        }
      })

      const res = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ priority: 'URGENT' })

      expect(res.status).toBe(200)
      expect(res.body.data.priority).toBe('URGENT')
    })

    it('atualiza userId para outro usuário válido', async () => {
      const { user, category } = await createTestData()
      const user2 = await prisma.user.create({
        data: { name: 'Outro User', email: 'outro@example.com' }
      })

      const task = await prisma.task.create({
        data: {
          title: 'Tarefa',
          userId: user.id,
          categoryId: category.id
        }
      })

      const res = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ userId: user2.id })

      expect(res.status).toBe(200)
      expect(res.body.data.userId).toBe(user2.id)
    })

    it('atualiza categoryId para outra categoria válida', async () => {
      const { user, category } = await createTestData()
      const category2 = await prisma.category.create({
        data: { name: 'Nova Categoria' }
      })

      const task = await prisma.task.create({
        data: {
          title: 'Tarefa',
          userId: user.id,
          categoryId: category.id
        }
      })

      const res = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ categoryId: category2.id })

      expect(res.status).toBe(200)
      expect(res.body.data.categoryId).toBe(category2.id)
    })

    it('retorna 404 para tarefa inexistente', async () => {
      const res = await request(app)
        .put('/api/tasks/id-inexistente')
        .send({ title: 'Teste' })

      expect(res.status).toBe(404)
      expect(res.body.success).toBe(false)
      expect(res.body.error).toBe('Task not found')
    })

    it('retorna erro 404 quando userId não existe', async () => {
      const { user, category } = await createTestData()

      const task = await prisma.task.create({
        data: {
          title: 'Tarefa',
          userId: user.id,
          categoryId: category.id
        }
      })

      const res = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ userId: 'id-inexistente' })

      expect(res.status).toBe(404)
      expect(res.body.error).toBe('User not found')
    })

    it('retorna erro 404 quando categoryId não existe', async () => {
      const { user, category } = await createTestData()

      const task = await prisma.task.create({
        data: {
          title: 'Tarefa',
          userId: user.id,
          categoryId: category.id
        }
      })

      const res = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ categoryId: 'id-inexistente' })

      expect(res.status).toBe(404)
      expect(res.body.error).toBe('Category not found')
    })

    it('retorna erro 400 para status inválido', async () => {
      const { user, category } = await createTestData()

      const task = await prisma.task.create({
        data: {
          title: 'Tarefa',
          userId: user.id,
          categoryId: category.id
        }
      })

      const res = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ status: 'INVALID_STATUS' })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe('Validation error')
    })

    it('retorna erro 400 para prioridade inválida', async () => {
      const { user, category } = await createTestData()

      const task = await prisma.task.create({
        data: {
          title: 'Tarefa',
          userId: user.id,
          categoryId: category.id
        }
      })

      const res = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ priority: 'INVALID_PRIORITY' })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe('Validation error')
    })
  })

  describe('DELETE /api/tasks/:id', () => {
    it('remove tarefa existente', async () => {
      const { user, category } = await createTestData()

      const task = await prisma.task.create({
        data: {
          title: 'Tarefa para deletar',
          userId: user.id,
          categoryId: category.id
        }
      })

      const res = await request(app).delete(`/api/tasks/${task.id}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe('Task deleted successfully')

      const deletedTask = await prisma.task.findUnique({ where: { id: task.id } })
      expect(deletedTask).toBeNull()
    })

    it('retorna 404 para tarefa inexistente', async () => {
      const res = await request(app).delete('/api/tasks/id-inexistente')

      expect(res.status).toBe(404)
      expect(res.body.success).toBe(false)
      expect(res.body.error).toBe('Task not found')
    })

    it('remove tarefa e mantém usuário e categoria', async () => {
      const { user, category } = await createTestData()

      const task = await prisma.task.create({
        data: {
          title: 'Tarefa',
          userId: user.id,
          categoryId: category.id
        }
      })

      await request(app).delete(`/api/tasks/${task.id}`)

      const userStillExists = await prisma.user.findUnique({ where: { id: user.id } })
      const categoryStillExists = await prisma.category.findUnique({ where: { id: category.id } })

      expect(userStillExists).toBeDefined()
      expect(categoryStillExists).toBeDefined()
    })
  })
})
