import { Router } from 'express'
import { teacherController } from '../controllers/teacherController'

const router = Router()

router.get('/', teacherController.getAllTeachers)
router.get('/:teacherId/students', teacherController.getTeacherStudents)
router.post('/', teacherController.createTeacher)

export default router
