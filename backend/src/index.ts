import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

// Import routes
import userRoutes from './routes/userRoutes'
import taskRoutes from './routes/taskRoutes'
import categoryRoutes from './routes/categoryRoutes'

// Import middleware
import { errorHandler } from './middleware/errorHandler'
import { notFound } from './middleware/notFound'

// Load environment variables
dotenv.config()

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'teste-software-backend'
  })
})

// API routes
app.use('/api/users', userRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/categories', categoryRoutes)

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})

if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(`Health check: http://localhost:${PORT}/health`)
    console.log(`API docs: http://localhost:${PORT}/api`)
  })
}

export { prisma }
export default app
