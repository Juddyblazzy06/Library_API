import { Router } from 'express'
import { bookController } from '../controllers/bookController'
import { studentController } from '../controllers/studentController'
import { validate } from '../middleware/validate'
import {
  bookSchema,
  studentIdSchema,
  bookIdSchema,
} from '../validations/schemas'

const router = Router()

// Student-specific book endpoints (as per requirements)
router.get(
  '/student/:studentId',
  validate(studentIdSchema, { target: 'params' }),
  studentController.getStudentBooks
)
router.post(
  '/student/:studentId/books/:bookId',
  validate(studentIdSchema, { target: 'params' }),
  validate(bookIdSchema, { target: 'params' }),
  studentController.addBookToStudent
)
router.delete(
  '/student/:studentId/books/:bookId',
  validate(studentIdSchema, { target: 'params' }),
  validate(bookIdSchema, { target: 'params' }),
  studentController.removeBookFromStudent
)

// Book management
router.get('/', bookController.getAllBooks)
router.post('/', validate(bookSchema), bookController.createBook)
router.get(
  '/:id',
  validate(bookIdSchema, { target: 'params' }),
  bookController.getBookById
)
router.put(
  '/:id',
  validate(bookIdSchema, { target: 'params' }),
  validate(bookSchema),
  bookController.updateBook
)
router.delete(
  '/:id',
  validate(bookIdSchema, { target: 'params' }),
  bookController.deleteBook
)

export default router
