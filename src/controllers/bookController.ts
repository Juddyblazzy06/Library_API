import { Request, Response } from 'express'
import { BookModel } from '../models/Book'
import redis from '../config/redis'

export const bookController = {
  async getAllBooks(req: Request, res: Response) {
    try {
      const cachedBooks = await redis.get('books')
      if (cachedBooks) {
        return res.json(JSON.parse(cachedBooks))
      }

      const books = await BookModel.find()
      await redis.set('books', JSON.stringify(books), 'EX', 3600)
      res.json(books)
    } catch (error) {
      res.status(500).json({ message: 'Error fetching books', error })
    }
  },

  async getBookById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const cacheKey = `book:${id}`

      const cachedBook = await redis.get(cacheKey)
      if (cachedBook) {
        return res.json(JSON.parse(cachedBook))
      }

      const book = await BookModel.findById(id)
      if (!book) {
        return res.status(404).json({ message: 'Book not found' })
      }

      await redis.set(cacheKey, JSON.stringify(book), 'EX', 3600)
      res.json(book)
    } catch (error) {
      res.status(500).json({ message: 'Error fetching book', error })
    }
  },

  async createBook(req: Request, res: Response) {
    try {
      const { title, author, isbn, publishedYear, quantity } = req.body
      const book = await BookModel.create({
        title,
        author,
        isbn,
        publishedYear,
        quantity,
        availableQuantity: quantity,
      })

      await redis.del('books')
      res.status(201).json(book)
    } catch (error) {
      res.status(500).json({ message: 'Error creating book', error })
    }
  },

  async updateBook(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { title, author, isbn, publishedYear, quantity } = req.body

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
        return res.status(404).json({ message: 'Book not found' })
      }

      await redis.del('books')
      await redis.del(`book:${id}`)
      res.json(book)
    } catch (error) {
      res.status(500).json({ message: 'Error updating book', error })
    }
  },

  async deleteBook(req: Request, res: Response) {
    try {
      const { id } = req.params
      const book = await BookModel.findByIdAndDelete(id)

      if (!book) {
        return res.status(404).json({ message: 'Book not found' })
      }

      await redis.del('books')
      await redis.del(`book:${id}`)
      res.json({ message: 'Book deleted successfully' })
    } catch (error) {
      res.status(500).json({ message: 'Error deleting book', error })
    }
  },
}
