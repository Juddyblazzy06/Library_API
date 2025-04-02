import { Request, Response } from 'express'
import { TeacherModel } from '../models/Teacher'
import { StudentModel } from '../models/Student'
import redis from '../config/redis'

export const teacherController = {
  async getAllTeachers(req: Request, res: Response) {
    try {
      const cachedTeachers = await redis.get('teachers')
      if (cachedTeachers) {
        return res.json(JSON.parse(cachedTeachers))
      }

      const teachers = await TeacherModel.find()
      await redis.set('teachers', JSON.stringify(teachers), 'EX', 3600)
      res.json(teachers)
    } catch (error) {
      res.status(500).json({ message: 'Error fetching teachers', error })
    }
  },

  async getTeacherStudents(req: Request, res: Response) {
    try {
      const { teacherId } = req.params
      const cacheKey = `teacher:${teacherId}:students`

      const cachedStudents = await redis.get(cacheKey)
      if (cachedStudents) {
        return res.json(JSON.parse(cachedStudents))
      }

      const teacher = await TeacherModel.findById(teacherId)
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' })
      }

      // Fetch student details for each student ID
      const students = await Promise.all(
        teacher.students.map((id) => StudentModel.findById(id))
      )

      await redis.set(cacheKey, JSON.stringify(students), 'EX', 3600)
      res.json(students)
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error fetching teacher students', error })
    }
  },

  async createTeacher(req: Request, res: Response) {
    try {
      const { name, email, password, subject, phone } = req.body

      const teacher = await TeacherModel.create({
        name,
        email,
        password, // Note: In production, hash the password before saving
        subject,
        phone,
        students: [], // Initialize empty students array
      })

      await redis.del('teachers')
      res.status(201).json(teacher)
    } catch (error) {
      console.error('Teacher creation error:', error)
      res.status(500).json({ message: 'Error creating teacher', error })
    }
  },

  async addStudentToTeacher(req: Request, res: Response) {
    try {
      const { teacherId, studentId } = req.params

      // Check if teacher exists
      const teacher = await TeacherModel.findById(teacherId)
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' })
      }

      // Check if student exists
      const student = await StudentModel.findById(studentId)
      if (!student) {
        return res.status(404).json({ message: 'Student not found' })
      }

      // Add student to teacher's students array if not already present
      if (!teacher.students.includes(studentId)) {
        teacher.students.push(studentId)
        await teacher.save()
      }

      // Clear cache
      await redis.del(`teacher:${teacherId}:students`)
      await redis.del('teachers')

      res.json({ message: 'Student added to teacher successfully', teacher })
    } catch (error) {
      console.error('Error adding student to teacher:', error)
      res
        .status(500)
        .json({ message: 'Error adding student to teacher', error })
    }
  },

  async removeStudentFromTeacher(req: Request, res: Response) {
    try {
      const { teacherId, studentId } = req.params

      // Check if teacher exists
      const teacher = await TeacherModel.findById(teacherId)
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' })
      }

      // Remove student from teacher's students array
      teacher.students = teacher.students.filter((id) => id !== studentId)
      await teacher.save()

      // Clear cache
      await redis.del(`teacher:${teacherId}:students`)
      await redis.del('teachers')

      res.json({
        message: 'Student removed from teacher successfully',
        teacher,
      })
    } catch (error) {
      console.error('Error removing student from teacher:', error)
      res
        .status(500)
        .json({ message: 'Error removing student from teacher', error })
    }
  },
}
