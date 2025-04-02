import { Resolver, Query, Mutation, Arg } from 'type-graphql'
import { Teacher, TeacherModel } from '../models/Teacher'
import { StudentModel } from '../models/Student'
import redis from '../config/redis'

@Resolver(Teacher)
export class TeacherResolver {
  @Query(() => [Teacher])
  async teachers(): Promise<Teacher[]> {
    try {
      const cachedTeachers = await redis.get('teachers')
      if (cachedTeachers) {
        return JSON.parse(cachedTeachers)
      }

      const teachers = await TeacherModel.find()
      await redis.set('teachers', JSON.stringify(teachers), 'EX', 3600)
      return teachers
    } catch (error) {
      console.error('Error fetching teachers:', error)
      throw new Error('Failed to fetch teachers')
    }
  }

  @Query(() => [String])
  async teacherStudents(
    @Arg('teacherId') teacherId: string
  ): Promise<string[]> {
    try {
      const cacheKey = `teacher:${teacherId}:students`
      const cachedStudents = await redis.get(cacheKey)
      if (cachedStudents) {
        return JSON.parse(cachedStudents)
      }

      const teacher = await TeacherModel.findById(teacherId)
      if (!teacher) {
        throw new Error('Teacher not found')
      }

      // Return the array of student IDs directly
      await redis.set(cacheKey, JSON.stringify(teacher.students), 'EX', 3600)
      return teacher.students
    } catch (error) {
      console.error('Error fetching teacher students:', error)
      throw new Error('Failed to fetch teacher students')
    }
  }

  @Mutation(() => Teacher)
  async createTeacher(
    @Arg('name') name: string,
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Arg('subject') subject: string,
    @Arg('phone') phone: string
  ): Promise<Teacher> {
    try {
      const teacher = await TeacherModel.create({
        name,
        email,
        password, // Note: In production, hash the password before saving
        subject,
        phone,
        students: [],
      })

      await redis.del('teachers')
      return teacher
    } catch (error) {
      console.error('Error creating teacher:', error)
      throw new Error('Failed to create teacher')
    }
  }

  @Mutation(() => Teacher)
  async addStudentToTeacher(
    @Arg('teacherId') teacherId: string,
    @Arg('studentId') studentId: string
  ): Promise<Teacher> {
    try {
      const teacher = await TeacherModel.findById(teacherId)
      if (!teacher) {
        throw new Error('Teacher not found')
      }

      const student = await StudentModel.findById(studentId)
      if (!student) {
        throw new Error('Student not found')
      }

      if (!teacher.students.includes(studentId)) {
        teacher.students.push(studentId)
        await teacher.save()
      }

      await redis.del(`teacher:${teacherId}:students`)
      await redis.del('teachers')

      return teacher
    } catch (error) {
      console.error('Error adding student to teacher:', error)
      throw new Error('Failed to add student to teacher')
    }
  }

  @Mutation(() => Teacher)
  async removeStudentFromTeacher(
    @Arg('teacherId') teacherId: string,
    @Arg('studentId') studentId: string
  ): Promise<Teacher> {
    try {
      const teacher = await TeacherModel.findById(teacherId)
      if (!teacher) {
        throw new Error('Teacher not found')
      }

      teacher.students = teacher.students.filter((id) => id !== studentId)
      await teacher.save()

      await redis.del(`teacher:${teacherId}:students`)
      await redis.del('teachers')

      return teacher
    } catch (error) {
      console.error('Error removing student from teacher:', error)
      throw new Error('Failed to remove student from teacher')
    }
  }
}
