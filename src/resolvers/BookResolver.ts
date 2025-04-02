import { Resolver, Query, Mutation, Arg } from 'type-graphql'
import { Book, BookModel } from '../models/Book'
import redis from '../config/redis'

@Resolver(Book)
export class BookResolver {
  @Query(() => [Book])
  async books(): Promise<Book[]> {
    const cachedBooks = await redis.get('books')
    if (cachedBooks) {
      return JSON.parse(cachedBooks)
    }

    const books = await BookModel.find()
    await redis.set('books', JSON.stringify(books), 'EX', 3600)
    return books
  }

  @Query(() => Book)
  async book(@Arg('id') id: string): Promise<Book> {
    const cacheKey = `book:${id}`
    const cachedBook = await redis.get(cacheKey)

    if (cachedBook) {
      return JSON.parse(cachedBook)
    }

    const book = await BookModel.findById(id)
    if (!book) {
      throw new Error('Book not found')
    }

    await redis.set(cacheKey, JSON.stringify(book), 'EX', 3600)
    return book
  }

  @Mutation(() => Book)
  async createBook(
    @Arg('title') title: string,
    @Arg('author') author: string,
    @Arg('isbn') isbn: string,
    @Arg('publishedYear') publishedYear: number,
    @Arg('quantity') quantity: number
  ): Promise<Book> {
    const book = await BookModel.create({
      title,
      author,
      isbn,
      publishedYear,
      quantity,
      availableQuantity: quantity,
    })

    await redis.del('books')
    return book
  }

  @Mutation(() => Book)
  async updateBook(
    @Arg('id') id: string,
    @Arg('title') title: string,
    @Arg('author') author: string,
    @Arg('isbn') isbn: string,
    @Arg('publishedYear') publishedYear: number,
    @Arg('quantity') quantity: number
  ): Promise<Book> {
    const book = await BookModel.findByIdAndUpdate(
      id,
      {
        title,
        author,
        isbn,
        publishedYear,
        quantity,
        availableQuantity: quantity,
      },
      { new: true }
    )

    if (!book) {
      throw new Error('Book not found')
    }

    await redis.del('books')
    await redis.del(`book:${id}`)
    return book
  }

  @Mutation(() => Boolean)
  async deleteBook(@Arg('id') id: string): Promise<boolean> {
    const result = await BookModel.findByIdAndDelete(id)
    if (!result) {
      throw new Error('Book not found')
    }

    await redis.del('books')
    await redis.del(`book:${id}`)
    return true
  }
}
