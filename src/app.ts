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

// Create separate Express apps for REST and GraphQL
const app: Application = express()
const restApp: Application = express()
const graphqlApp: Application = express()

// Middleware for both apps
app.use(cors())
app.use(express.json())
restApp.use(cors())
restApp.use(express.json())
graphqlApp.use(cors())
graphqlApp.use(express.json())

// REST API Routes
restApp.use('/api/teachers', teacherRoutes)
restApp.use('/api/students', studentRoutes)
restApp.use('/api/books', bookRoutes)

// Error Handling Middleware
restApp.use(errorHandler)
graphqlApp.use(errorHandler)

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
  server.applyMiddleware({ app: graphqlApp as any })
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

const closeDB = async () => {
  try {
    await mongoose.connection.close()
    console.log('MongoDB connection closed')
  } catch (error) {
    console.error('Error closing MongoDB connection:', error)
    throw error
  }
}

// Ports configuration
const REST_PORT = process.env.REST_PORT || 4000
const GRAPHQL_PORT = process.env.GRAPHQL_PORT || 4001

// Only start the servers if we're not in a test environment
if (process.env.NODE_ENV !== 'test') {
  // Start REST API server
  const restServer = restApp.listen(REST_PORT, () => {
    console.log(`REST API Server running on port ${REST_PORT}`)
    console.log(
      `REST API endpoints available at http://localhost:${REST_PORT}/api`
    )
  })

  // Start GraphQL server
  const graphqlServer = graphqlApp.listen(GRAPHQL_PORT, () => {
    console.log(`GraphQL Server running on port ${GRAPHQL_PORT}`)
    console.log(
      `GraphQL Playground available at http://localhost:${GRAPHQL_PORT}/graphql`
    )
  })

  // Handle server errors
  restServer.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`REST API Port ${REST_PORT} is already in use`)
      process.exit(1)
    } else {
      console.error('REST API Server error:', error)
    }
  })

  graphqlServer.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`GraphQL Port ${GRAPHQL_PORT} is already in use`)
      process.exit(1)
    } else {
      console.error('GraphQL Server error:', error)
    }
  })

  // Initialize Apollo Server and MongoDB connection
  Promise.all([startApolloServer(), connectDB()]).catch((error) => {
    console.error('Error during initialization:', error)
    process.exit(1)
  })
}

export { app, restApp, graphqlApp, connectDB, closeDB }

// Main application entry point
