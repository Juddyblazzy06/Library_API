import dotenv from 'dotenv'
import express from 'express'
import { restApp, graphqlApp, connectDB } from './app'
import { logger } from './utils/logger'
import healthRoutes from './routes/healthRoutes'

dotenv.config()

const PORT = process.env.PORT || 4000

async function startServer() {
  try {
    // Connect to MongoDB first
    await connectDB()

    // Create main Express app
    const app = express()

    // Health check route
    app.use('/api/health', healthRoutes)

    // Mount REST API
    app.use('/api', restApp)

    // Mount GraphQL API
    app.use('/graphql', graphqlApp)

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`)
      logger.info(`REST API available at http://localhost:${PORT}/api`)
      logger.info(`GraphQL API available at http://localhost:${PORT}/graphql`)
    })

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`)
        process.exit(1)
      } else {
        logger.error('Server error:', error)
      }
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Only start the server if we're not in a test environment
if (process.env.NODE_ENV !== 'test') {
  startServer()
}
