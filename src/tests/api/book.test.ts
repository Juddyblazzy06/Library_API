import request from 'supertest'
import { app } from '../../app'
import { connectDB, closeDB } from '../../app'
import { BookModel } from '../../models/Book'
import { generateToken } from '../../utils/auth'
import { logger } from '../../utils/logger'

describe('Book API', () => {
  let authToken: string
  let testBookId: string

  beforeAll(async () => {
    try {
      await connectDB()
      logger.info('Connected to test database')

      // Create test book
      const testBook = await BookModel.create({
        title: 'Test Book',
        author: 'Test Author',
        isbn: '1234567890',
        publishedYear: 2024,
        quantity: 5,
        availableQuantity: 5,
      })
      testBookId = testBook._id.toString()

      // Generate auth token
      authToken = generateToken(testBookId, 'admin')
    } catch (error) {
      logger.error('Test setup failed:', error)
      throw error
    }
  })

  afterAll(async () => {
    try {
      await BookModel.deleteMany({})
      await closeDB()
      logger.info('Test database cleaned up')
    } catch (error) {
      logger.error('Test cleanup failed:', error)
    }
  })

  describe('GET /api/books', () => {
    it('should return all books', async () => {
      const response = await request(app)
        .get('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.data.length).toBeGreaterThan(0)
    })
  })

  describe('GET /api/books/:id', () => {
    it('should return a book by id', async () => {
      const response = await request(app)
        .get(`/api/books/${testBookId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.data).toHaveProperty('_id', testBookId)
      expect(response.body.data).toHaveProperty('title', 'Test Book')
    })

    it('should return 404 for non-existent book', async () => {
      await request(app)
        .get('/api/books/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })
  })

  describe('POST /api/books', () => {
    it('should create a new book', async () => {
      const newBook = {
        title: 'New Book',
        author: 'New Author',
        isbn: '0987654321',
        publishedYear: 2024,
        quantity: 3,
        availableQuantity: 3,
      }

      const response = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newBook)
        .expect(201)

      expect(response.body.data).toHaveProperty('_id')
      expect(response.body.data.title).toBe(newBook.title)
    })
  })

  describe('PUT /api/books/:id', () => {
    it('should update a book', async () => {
      const updateData = {
        title: 'Updated Book',
        quantity: 10,
      }

      const response = await request(app)
        .put(`/api/books/${testBookId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body.data.title).toBe(updateData.title)
      expect(response.body.data.quantity).toBe(updateData.quantity)
    })
  })

  describe('DELETE /api/books/:id', () => {
    it('should delete a book', async () => {
      await request(app)
        .delete(`/api/books/${testBookId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      // Verify book is deleted
      const deletedBook = await BookModel.findById(testBookId)
      expect(deletedBook).toBeNull()
    })
  })
})
