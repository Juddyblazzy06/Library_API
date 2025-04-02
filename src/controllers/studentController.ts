import { Request, Response } from 'express'
import { StudentModel } from '../models/Student'
import { BookModel } from '../models/Book'
import redis from '../config/redis'
import mongoose from 'mongoose'

export const studentController = {
  async getAllStudents(req: Request, res: Response) {
    try {
      const cachedStudents = await redis.get('students')
      if (cachedStudents) {
        return res.json(JSON.parse(cachedStudents))
      }

      const students = await StudentModel.find()
      await redis.set('students', JSON.stringify(students), 'EX', 3600)
      res.json(students)
    } catch (error) {
      res.status(500).json({ message: 'Error fetching students', error })
    }
  },

  async getStudentById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const cacheKey = `student:${id}`

      const cachedStudent = await redis.get(cacheKey)
      if (cachedStudent) {
        return res.json(JSON.parse(cachedStudent))
      }

      const student = await StudentModel.findById(id)
      if (!student) {
        return res.status(404).json({ message: 'Student not found' })
      }

      await redis.set(cacheKey, JSON.stringify(student), 'EX', 3600)
      res.json(student)
    } catch (error) {
      res.status(500).json({ message: 'Error fetching student', error })
    }
  },

  async getStudentBooks(req: Request, res: Response) {
    try {
      const { studentId } = req.params
      const cacheKey = `student:${studentId}:books`

      const cachedBooks = await redis.get(cacheKey)
      if (cachedBooks) {
        return res.json(JSON.parse(cachedBooks))
      }

      const student = await StudentModel.findById(studentId).populate('books')
      if (!student) {
        return res.status(404).json({ message: 'Student not found' })
      }

      await redis.set(cacheKey, JSON.stringify(student.books), 'EX', 3600)
      res.json(student.books)
    } catch (error) {
      res.status(500).json({ message: 'Error fetching student books', error })
    }
  },

  async createStudent(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body
      const student = await StudentModel.create({
        name,
        email,
        password, // Note: In production, hash the password before saving
      })

      await redis.del('students')
      res.status(201).json(student)
    } catch (error) {
      res.status(500).json({ message: 'Error creating student', error })
    }
  },

  async addBookToStudent(req: Request, res: Response) {
    try {
      const { studentId, bookId } = req.params

      const student = await StudentModel.findById(studentId)
      const book = await BookModel.findById(bookId)

      if (!student || !book) {
        return res.status(404).json({
          message: !student ? 'Student not found' : 'Book not found',
        })
      }

      if (book.availableQuantity <= 0) {
        return res.status(400).json({ message: 'Book is not available' })
      }

      // Add book to student's collection
      student.books.push(book)
      await student.save()

      // Update book availability
      book.availableQuantity -= 1
      await book.save()

      // Clear cache
      await redis.del(`student:${studentId}:books`)
      await redis.del(`book:${bookId}`)

      res.json(student)
    } catch (error) {
      res.status(500).json({ message: 'Error adding book to student', error })
    }
  },

  async removeBookFromStudent(req: Request, res: Response) {
    try {
      const { studentId, bookId } = req.params

      const student = await StudentModel.findById(studentId)
      const book = await BookModel.findById(bookId)

      if (!student || !book) {
        return res.status(404).json({
          message: !student ? 'Student not found' : 'Book not found',
        })
      }

      // Remove book from student's collection
      student.books = student.books.filter((b: any) => b.toString() !== bookId)
      await student.save()

      // Update book availability
      book.availableQuantity += 1
      await book.save()

      // Clear cache
      await redis.del(`student:${studentId}:books`)
      await redis.del(`book:${bookId}`)

      res.json({ message: 'Book removed successfully' })
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error removing book from student', error })
    }
  },
}
