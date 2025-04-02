import { Request, Response } from 'express'
import { TeacherModel } from '../models/Teacher'
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

      const teacher = await TeacherModel.findById(teacherId).populate(
        'students'
      )
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' })
      }

      await redis.set(cacheKey, JSON.stringify(teacher.students), 'EX', 3600)
      res.json(teacher.students)
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error fetching teacher students', error })
    }
  },

  async createTeacher(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body
      const teacher = await TeacherModel.create({
        name,
        email,
        password, // Note: In production, hash the password before saving
      })

      await redis.del('teachers')
      res.status(201).json(teacher)
    } catch (error) {
      res.status(500).json({ message: 'Error creating teacher', error })
    }
  },
}
