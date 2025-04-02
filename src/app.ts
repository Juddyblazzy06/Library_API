import 'reflect-metadata'
import express, { Application } from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import teacherRoutes from './routes/teacherRoutes'
import studentRoutes from './routes/studentRoutes'
import bookRoutes from './routes/bookRoutes'
import { TeacherResolver } from './resolvers/TeacherResolver'
import { BookResolver } from './resolvers/BookResolver'
import { StudentResolver } from './resolvers/StudentResolver'
import { errorHandler } from './middleware/errorHandler'

dotenv.config()

const app: Application = express()

// Middleware
app.use(cors())
app.use(express.json())

// REST API Routes
app.use('/api/teachers', teacherRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/books', bookRoutes)

// GraphQL Setup
const startApolloServer = async () => {
  const schema = await buildSchema({
    resolvers: [BookResolver, StudentResolver, TeacherResolver],
  })

  const server = new ApolloServer({
    schema,
    formatError: (error) => {
      console.error('GraphQL Error:', error)
      return {
        message: error.message,
        locations: error.locations,
        path: error.path,
        extensions: error.extensions,
      }
    },
  })

  await server.start()
  server.applyMiddleware({ app: app as any })
}

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/library'
    )
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1)
    }
    throw error
  }
}

// Error Handling Middleware
app.use(errorHandler)

// Start Server
const PORT = process.env.PORT || 4000

// Only start the server if we're not in a test environment
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`)
  })

  // Handle server errors
  server.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use`)
      process.exit(1)
    } else {
      console.error('Server error:', error)
    }
  })

  // Initialize Apollo Server and MongoDB connection
  Promise.all([startApolloServer(), connectDB()]).catch((error) => {
    console.error('Error during initialization:', error)
    process.exit(1)
  })
}

export { app, connectDB }
