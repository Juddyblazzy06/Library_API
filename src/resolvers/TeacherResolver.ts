import { Resolver, Query, Mutation, Arg } from 'type-graphql'
import { Teacher, TeacherModel } from '../models/Teacher'
import { Student } from '../models/Student'
import redis from '../config/redis'

@Resolver(Teacher)
export class TeacherResolver {
  @Query(() => [Teacher])
  async teachers(): Promise<Teacher[]> {
    const cachedTeachers = await redis.get('teachers')
    if (cachedTeachers) {
      return JSON.parse(cachedTeachers)
    }

    const teachers = await TeacherModel.find()
    await redis.set('teachers', JSON.stringify(teachers), 'EX', 3600)
    return teachers
  }

  @Query(() => [Student])
  async teacherStudents(
    @Arg('teacherId') teacherId: string
  ): Promise<Student[]> {
    const cacheKey = `teacher:${teacherId}:students`
    const cachedStudents = await redis.get(cacheKey)

    if (cachedStudents) {
      return JSON.parse(cachedStudents)
    }

    const teacher = await TeacherModel.findById(teacherId).populate('students')
    if (!teacher) {
      throw new Error('Teacher not found')
    }

    await redis.set(cacheKey, JSON.stringify(teacher.students), 'EX', 3600)
    return teacher.students
  }

  @Mutation(() => Teacher)
  async createTeacher(
    @Arg('name') name: string,
    @Arg('email') email: string,
    @Arg('password') password: string
  ): Promise<Teacher> {
    const teacher = await TeacherModel.create({
      name,
      email,
      password, // Note: In production, hash the password before saving
    })

    await redis.del('teachers')
    return teacher
  }
}
