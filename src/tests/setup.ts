import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

let mongoServer: MongoMemoryServer

jest.setTimeout(30000) // Increase timeout to 30 seconds

beforeAll(async () => {
  try {
    // Set test environment
    process.env.NODE_ENV = 'test'

    // Close any existing connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
    }

    // Create new server and connect
    mongoServer = await MongoMemoryServer.create()
    const mongoUri = mongoServer.getUri()

    // Configure mongoose for testing
    const mongooseOpts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }

    await mongoose.connect(mongoUri)
  } catch (error) {
    console.error('Error in test setup:', error)
    throw error
  }
})

afterAll(async () => {
  try {
    // Ensure we close the connection and stop the server
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
    }
    if (mongoServer) {
      await mongoServer.stop()
    }
  } catch (error) {
    console.error('Error in test cleanup:', error)
    throw error
  }
})

afterEach(async () => {
  try {
    // Clean up collections after each test
    if (mongoose.connection.readyState !== 0) {
      const collections = mongoose.connection.collections
      await Promise.all(
        Object.values(collections).map((collection) =>
          collection.deleteMany({})
        )
      )
    }
  } catch (error) {
    console.error('Error in test cleanup:', error)
    throw error
  }
})
