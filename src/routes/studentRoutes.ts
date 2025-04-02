import { Router } from 'express'
import { studentController } from '../controllers/studentController'

const router = Router()

// Student management
router.get('/', studentController.getAllStudents)
router.get('/:id', studentController.getStudentById)
router.post('/', studentController.createStudent)

// Book management for students
router.get('/:studentId/books', studentController.getStudentBooks)
router.post('/:studentId/books/:bookId', studentController.addBookToStudent)
router.delete(
  '/:studentId/books/:bookId',
  studentController.removeBookFromStudent
)

export default router
