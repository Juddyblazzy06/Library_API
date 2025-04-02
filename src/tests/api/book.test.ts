import request from 'supertest'
import { app } from '../../app'
import { BookModel } from '../../models/Book'
import { StudentModel } from '../../models/Student'
import { TeacherModel } from '../../models/Teacher'
import mongoose from 'mongoose'

describe('Book API', () => {
  let student: any
  let teacher: any
  let book: any

  beforeEach(async () => {
    // Create test data
    student = await StudentModel.create({
      name: 'Test Student',
      email: 'test@student.com',
      password: 'password123',
    })

    teacher = await TeacherModel.create({
      name: 'Test Teacher',
      email: 'test@teacher.com',
      password: 'password123',
    })

    book = await BookModel.create({
      title: 'Test Book',
      author: 'Test Author',
      isbn: '978-0-13-149505-0',
      publishedYear: 2023,
      quantity: 5,
      availableQuantity: 5,
    })
  })

  describe('GET /books', () => {
    it('should return all books', async () => {
      // Create additional test books
      await BookModel.create([
        {
          title: 'Book 1',
          author: 'Author 1',
          isbn: '978-0-13-149505-0',
          publishedYear: 2023,
          quantity: 5,
          availableQuantity: 5,
        },
        {
          title: 'Book 2',
          author: 'Author 2',
          isbn: '978-0-13-149505-1',
          publishedYear: 2023,
          quantity: 3,
          availableQuantity: 3,
        },
      ])

      const response = await request(app).get('/books')

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(3) // Including the book created in beforeEach
    })
  })

  describe('POST /books', () => {
    it('should create a new book', async () => {
      const bookData = {
        title: 'New Book',
        author: 'New Author',
        isbn: '978-0-13-149505-0',
        publishedYear: 2023,
        quantity: 5,
      }

      const response = await request(app).post('/books').send(bookData)

      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        ...bookData,
        availableQuantity: bookData.quantity,
      })
    })

    it('should validate required fields', async () => {
      const invalidData = {
        title: 'New Book',
        // Missing required fields
      }

      const response = await request(app).post('/books').send(invalidData)

      expect(response.status).toBe(400)
    })
  })

  describe('GET /books/:id', () => {
    it('should return a book by id', async () => {
      const response = await request(app).get(`/books/${book._id}`)

      expect(response.status).toBe(200)
      expect(response.body.id).toBe(book._id.toString())
    })

    it('should return 404 for non-existent book', async () => {
      const nonExistentId = new mongoose.Types.ObjectId()
      const response = await request(app).get(`/books/${nonExistentId}`)

      expect(response.status).toBe(404)
    })
  })

  describe('PUT /books/:id', () => {
    it('should update a book', async () => {
      const response = await request(app).put(`/books/${book._id}`).send({
        title: 'Updated Book',
        author: 'Updated Author',
        isbn: '978-0-13-149505-2',
        publishedYear: 2023,
        quantity: 4,
      })

      expect(response.status).toBe(200)
      expect(response.body.title).toBe('Updated Book')
    })
  })

  describe('DELETE /books/:id', () => {
    it('should delete a book', async () => {
      const response = await request(app).delete(`/books/${book._id}`)

      expect(response.status).toBe(200)
      expect(response.body.message).toBe('Book deleted successfully')
    })
  })

  describe('GET /books/student/:studentId', () => {
    it('should return books for a student', async () => {
      const response = await request(app).get(`/books/student/${student._id}`)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
    })
  })

  describe('POST /api/books', () => {
    it('should create a new book', async () => {
      const response = await request(app).post('/api/books').send({
        title: 'New Book',
        author: 'New Author',
        isbn: '978-0-13-149505-1',
        publishedYear: 2023,
        quantity: 3,
      })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('_id')
      expect(response.body.title).toBe('New Book')
    })
  })

  describe('GET /api/books', () => {
    it('should get all books', async () => {
      const response = await request(app).get('/api/books')

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
    })
  })

  describe('POST /api/books/student/:studentId/books/:bookId', () => {
    it('should add a book to a student', async () => {
      const response = await request(app).post(
        `/api/books/student/${student._id}/books/${book._id}`
      )

      expect(response.status).toBe(200)
      expect(response.body.books).toContainEqual(book._id.toString())
    })
  })

  describe('DELETE /api/books/student/:studentId/books/:bookId', () => {
    it('should remove a book from a student', async () => {
      // First, add the book to the student
      await request(app).post(
        `/api/books/student/${student._id}/books/${book._id}`
      )

      const response = await request(app).delete(
        `/api/books/student/${student._id}/books/${book._id}`
      )

      expect(response.status).toBe(200)
      expect(response.body.message).toBe('Book removed successfully')
      expect(response.body.books).not.toContainEqual(book._id.toString())
    })
  })
})
