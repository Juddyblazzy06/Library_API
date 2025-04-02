import { Router } from 'express'
import { teacherController } from '../controllers/teacherController'

const router = Router()

router.get('/', teacherController.getAllTeachers)
router.get('/:teacherId/students', teacherController.getTeacherStudents)
router.post('/', teacherController.createTeacher)
router.post(
  '/:teacherId/students/:studentId',
  teacherController.addStudentToTeacher
)
router.delete(
  '/:teacherId/students/:studentId',
  teacherController.removeStudentFromTeacher
)

export default router
