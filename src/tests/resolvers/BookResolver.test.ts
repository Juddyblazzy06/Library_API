import { buildSchema } from 'type-graphql'
import { BookResolver } from '../../resolvers/BookResolver'
import { BookModel } from '../../models/Book'
import { graphql } from 'graphql'
import mongoose from 'mongoose'

describe('BookResolver', () => {
  let schema: any

  beforeAll(async () => {
    schema = await buildSchema({
      resolvers: [BookResolver],
    })
  })

  afterEach(async () => {
    await BookModel.deleteMany({})
  })

  describe('createBook', () => {
    const createBookMutation = `
      mutation CreateBook(
        $title: String!
        $author: String!
        $isbn: String!
        $publishedYear: Int!
        $quantity: Int!
      ) {
        createBook(
          title: $title
          author: $author
          isbn: $isbn
          publishedYear: $publishedYear
          quantity: $quantity
        ) {
          id
          title
          author
          isbn
          publishedYear
          quantity
        }
      }
    `

    it('should create a new book', async () => {
      const input = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '978-0-13-149505-0',
        publishedYear: 2023,
        quantity: 5,
      }

      const result = await graphql({
        schema,
        source: createBookMutation,
        variableValues: input,
      })

      expect(result.errors).toBeUndefined()
      expect(result.data?.createBook).toMatchObject({
        title: input.title,
        author: input.author,
        isbn: input.isbn,
        publishedYear: input.publishedYear,
        quantity: input.quantity,
      })
    })

    it('should validate ISBN format', async () => {
      const input = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: 'invalid-isbn',
        publishedYear: 2023,
        quantity: 5,
      }

      const result = await graphql({
        schema,
        source: createBookMutation,
        variableValues: input,
      })
      expect(result.errors).toBeDefined()
      expect(result.errors?.[0].message).toContain('Invalid ISBN format')
    })
  })

  describe('books', () => {
    const getAllBooksQuery = `
      query {
        books {
          id
          title
          author
          isbn
          publishedYear
          quantity
        }
      }
    `

    it('should return all books', async () => {
      // Create test books
      await BookModel.create([
        {
          title: 'Book 1',
          author: 'Author 1',
          isbn: '978-0-13-149505-0',
          publishedYear: 2023,
          quantity: 5,
        },
        {
          title: 'Book 2',
          author: 'Author 2',
          isbn: '978-0-13-149505-1',
          publishedYear: 2023,
          quantity: 3,
        },
      ])

      const result = await graphql({
        schema,
        source: getAllBooksQuery,
      })

      expect(result.errors).toBeUndefined()
      expect(result.data?.books).toHaveLength(2)
    })
  })

  describe('book', () => {
    const getBookByIdQuery = `
      query GetBook($id: String!) {
        book(id: $id) {
          id
          title
          author
          isbn
          publishedYear
          quantity
        }
      }
    `

    it('should return a book by id', async () => {
      const book = await BookModel.create({
        title: 'Test Book',
        author: 'Test Author',
        isbn: '978-0-13-149505-0',
        publishedYear: 2023,
        quantity: 5,
      })

      const result = await graphql({
        schema,
        source: getBookByIdQuery,
        variableValues: {
          id: book._id.toString(),
        },
      })

      expect(result.errors).toBeUndefined()
      expect(result.data?.book).toMatchObject({
        id: book._id.toString(),
        title: book.title,
        author: book.author,
      })
    })

    it('should throw error for non-existent book', async () => {
      const result = await graphql({
        schema,
        source: getBookByIdQuery,
        variableValues: {
          id: new mongoose.Types.ObjectId().toString(),
        },
      })

      expect(result.errors).toBeDefined()
    })
  })
})
