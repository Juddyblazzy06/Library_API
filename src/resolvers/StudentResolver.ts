import { Resolver, Query, Mutation, Arg } from 'type-graphql'
import { Student, StudentModel } from '../models/Student'
import { Book, BookModel } from '../models/Book'
import redis from '../config/redis'
import mongoose from 'mongoose'

@Resolver(Student)
export class StudentResolver {
  @Query(() => [Student])
  async students(): Promise<Student[]> {
    const cachedStudents = await redis.get('students')
    if (cachedStudents) {
      return JSON.parse(cachedStudents)
    }

    const students = await StudentModel.find()
    await redis.set('students', JSON.stringify(students), 'EX', 3600)
    return students
  }

  @Query(() => Student)
  async student(@Arg('id') id: string): Promise<Student> {
    const cacheKey = `student:${id}`
    const cachedStudent = await redis.get(cacheKey)

    if (cachedStudent) {
      return JSON.parse(cachedStudent)
    }

    const student = await StudentModel.findById(id)
    if (!student) {
      throw new Error('Student not found')
    }

    await redis.set(cacheKey, JSON.stringify(student), 'EX', 3600)
    return student
  }

  @Query(() => [Book])
  async studentBooks(@Arg('studentId') studentId: string): Promise<Book[]> {
    const cacheKey = `student:${studentId}:books`
    const cachedBooks = await redis.get(cacheKey)

    if (cachedBooks) {
      return JSON.parse(cachedBooks)
    }

    const student = await StudentModel.findById(studentId).populate('books')
    if (!student) {
      throw new Error('Student not found')
    }

    await redis.set(cacheKey, JSON.stringify(student.books), 'EX', 3600)
    return student.books
  }

  @Mutation(() => Student)
  async createStudent(
    @Arg('name') name: string,
    @Arg('email') email: string,
    @Arg('password') password: string
  ): Promise<Student> {
    const student = await StudentModel.create({
      name,
      email,
      password, // Note: In production, hash the password before saving
    })

    await redis.del('students')
    return student
  }

  @Mutation(() => Student)
  async addBookToStudent(
    @Arg('studentId') studentId: string,
    @Arg('bookId') bookId: string
  ): Promise<Student> {
    const student = await StudentModel.findById(studentId)
    const book = await BookModel.findById(bookId)

    if (!student || !book) {
      throw new Error(!student ? 'Student not found' : 'Book not found')
    }

    if (book.availableQuantity <= 0) {
      throw new Error('Book is not available')
    }

    student.books.push(book)
    await student.save()

    book.availableQuantity -= 1
    await book.save()

    await redis.del(`student:${studentId}:books`)
    await redis.del(`book:${bookId}`)

    return student
  }

  @Mutation(() => Student)
  async removeBookFromStudent(
    @Arg('studentId') studentId: string,
    @Arg('bookId') bookId: string
  ): Promise<Student> {
    const student = await StudentModel.findById(studentId)
    const book = await BookModel.findById(bookId)

    if (!student || !book) {
      throw new Error(!student ? 'Student not found' : 'Book not found')
    }

    student.books = student.books.filter((b: any) => b.toString() !== bookId)
    await student.save()

    book.availableQuantity += 1
    await book.save()

    await redis.del(`student:${studentId}:books`)
    await redis.del(`book:${bookId}`)

    return student
  }
}
