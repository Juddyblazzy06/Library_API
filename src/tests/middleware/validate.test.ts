import { Request, Response, NextFunction } from 'express'
import { validate } from '../../middleware/validate'
import { bookSchema, studentIdSchema } from '../../validations/schemas'
import { AppError } from '../../middleware/errorHandler'
import Joi from 'joi'

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let nextFunction: jest.Mock

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      query: {},
    }
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    }
    nextFunction = jest.fn()
  })

  describe('Body Validation', () => {
    it('should pass validation for valid book data', () => {
      mockRequest.body = {
        title: ' Test Book ',
        author: ' Test Author ',
        isbn: ' 978-0-13-149505-0 ',
        publishedYear: 2023,
        quantity: 5,
      }

      validate(bookSchema)(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )

      expect(nextFunction).toHaveBeenCalled()
      expect(mockResponse.status).not.toHaveBeenCalled()
      expect(mockRequest.body.title).toBe('Test Book')
      expect(mockRequest.body.author).toBe('Test Author')
      expect(mockRequest.body.isbn).toBe('978-0-13-149505-0')
    })

    it('should return 400 for invalid book data with field-specific errors', () => {
      mockRequest.body = {
        title: 'T', // Too short
        author: 'A', // Too short
        isbn: 'invalid-isbn',
        publishedYear: 'not-a-number',
        quantity: -1, // Negative quantity
      }

      validate(bookSchema)(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )

      expect(nextFunction).not.toHaveBeenCalled()
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining(
            'title: Title must be at least 1 character'
          ),
        })
      )
    })

    it('should handle missing required fields', () => {
      mockRequest.body = {
        title: 'Test Book',
        // Missing required fields
      }

      validate(bookSchema)(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )

      expect(nextFunction).not.toHaveBeenCalled()
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalled()
    })

    it('should handle invalid ISBN format', () => {
      mockRequest.body = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: 'invalid-isbn',
        publishedYear: 2023,
        quantity: 5,
      }

      validate(bookSchema)(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )

      expect(nextFunction).not.toHaveBeenCalled()
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('isbn: Please enter a valid ISBN')
        })
      )
    })

    it('should handle invalid published year', () => {
      mockRequest.body = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '978-0-13-149505-0',
        publishedYear: 1899, // Before 1900
        quantity: 5,
      }

      validate(bookSchema)(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('publishedYear: Published year cannot be before 1900')
        })
      )
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalled()
    })

    it('should handle empty strings', () => {
      mockRequest.body = {
        title: '   ',
        author: 'Test Author',
        isbn: '978-0-13-149505-0',
        publishedYear: 2023,
        quantity: 5,
      }

      validate(bookSchema)(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )

      expect(nextFunction).not.toHaveBeenCalled()
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalled()
    })

    it('should handle null values', () => {
      mockRequest.body = {
        title: null,
        author: 'Test Author',
        isbn: '978-0-13-149505-0',
        publishedYear: 2023,
        quantity: 5,
      }

      validate(bookSchema)(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )

      expect(nextFunction).not.toHaveBeenCalled()
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalled()
    })
  })

  describe('Path Parameters Validation', () => {
    it('should pass validation for valid student ID and trim whitespace', () => {
      mockRequest.params = {
        studentId: ' 507f1f77bcf86cd799439011 ',
      }

      validate(studentIdSchema, { target: 'params' })(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )

      expect(nextFunction).toHaveBeenCalled()
      expect(mockResponse.status).not.toHaveBeenCalled()
      expect(mockRequest.params.studentId).toBe('507f1f77bcf86cd799439011')
    })

    it('should return 400 for invalid student ID with field-specific error', () => {
      mockRequest.params = {
        studentId: 'invalid-id',
      }

      validate(studentIdSchema, { target: 'params' })(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )

      expect(nextFunction).not.toHaveBeenCalled()
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('studentId: Invalid ID format'),
        })
      )
    })

    it('should handle missing required path parameters', () => {
      mockRequest.params = {}

      validate(studentIdSchema, { target: 'params' })(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )

      expect(nextFunction).not.toHaveBeenCalled()
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalled()
    })

    it('should handle null path parameters', () => {
      mockRequest.params = {
        studentId: '',
      }

      validate(studentIdSchema, { target: 'params' })(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )

      expect(nextFunction).not.toHaveBeenCalled()
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalled()
    })
  })

  describe('Query Parameters Validation', () => {
    it('should validate query parameters', () => {
      const querySchema = studentIdSchema
      mockRequest.query = {
        studentId: '507f1f77bcf86cd799439011',
      }

      validate(querySchema, { target: 'query' })(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )

      expect(nextFunction).toHaveBeenCalled()
      expect(mockResponse.status).not.toHaveBeenCalled()
    })

    it('should handle empty query parameters', () => {
      const querySchema = studentIdSchema
      mockRequest.query = {
        studentId: '',
      }

      validate(querySchema, { target: 'query' })(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )

      expect(nextFunction).not.toHaveBeenCalled()
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalled()
    })
  })

  describe('Validation Options', () => {
    it('should handle stripUnknown option', () => {
      mockRequest.body = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '978-0-13-149505-0',
        publishedYear: 2023,
        quantity: 5,
        unknownField: 'should be stripped',
      }

      validate(bookSchema, { stripUnknown: true })(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )

      expect(nextFunction).toHaveBeenCalled()
      expect(mockRequest.body.unknownField).toBeUndefined()
    })

    it('should handle abortEarly option', () => {
      mockRequest.body = {
        title: 'T',
        author: 'A',
        isbn: 'invalid-isbn',
        publishedYear: 'not-a-number',
        quantity: -1,
      }

      validate(bookSchema, { abortEarly: true })(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )

      expect(nextFunction).not.toHaveBeenCalled()
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      // Should only include the first error
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.not.stringContaining('author'),
        })
      )
    })

    it('should handle allowUnknown option', () => {
      mockRequest.body = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '978-0-13-149505-0',
        publishedYear: 2023,
        quantity: 5,
        unknownField: 'should be allowed',
      }

      validate(bookSchema, { allowUnknown: true })(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )

      expect(nextFunction).toHaveBeenCalled()
      expect(mockRequest.body.unknownField).toBe('should be allowed')
    })
  })

  describe('Error Handling', () => {
    it('should handle unexpected validation errors', () => {
      // Mock a schema that will throw an error
      const invalidSchema = {
        validate: () => {
          throw new Error('Unexpected error')
        },
      } as unknown as Joi.ObjectSchema

      validate(invalidSchema)(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError))
      expect(nextFunction.mock.calls[0][0].statusCode).toBe(500)
    })
  })

  describe('validate studentId', () => {
    const schema = Joi.object({
      studentId: Joi.string().required(),
    })

    it('should pass validation for valid studentId', () => {
      mockRequest = {
        params: {
          studentId: '123',
        },
      }

      validate(schema, { target: 'params' })(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )

      expect(nextFunction).toHaveBeenCalled()
      expect(mockResponse.status).not.toHaveBeenCalled()
    })

    it('should return 400 for invalid studentId', () => {
      mockRequest = {
        params: {
          studentId: '',
        },
      }

      validate(schema, { target: 'params' })(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )

      expect(nextFunction).not.toHaveBeenCalled()
      expect(mockResponse.status).toHaveBeenCalledWith(400)
    })
  })

  describe('validate bookId', () => {
    const schema = Joi.object({
      bookId: Joi.string().required(),
    })

    it('should pass validation for valid bookId', () => {
      mockRequest = {
        params: {
          bookId: '123',
        },
      }

      validate(schema, { target: 'params' })(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )

      expect(nextFunction).toHaveBeenCalled()
      expect(mockResponse.status).not.toHaveBeenCalled()
    })

    it('should return 400 for invalid bookId', () => {
      mockRequest = {
        params: {
          bookId: '',
        },
      }

      validate(schema, { target: 'params' })(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )

      expect(nextFunction).not.toHaveBeenCalled()
      expect(mockResponse.status).toHaveBeenCalledWith(400)
    })
  })

  describe('validate book data', () => {
    const schema = Joi.object({
      title: Joi.string().required(),
      author: Joi.string().required(),
      isbn: Joi.string().required(),
      publishedYear: Joi.number().required(),
      quantity: Joi.number().required(),
    })

    it('should pass validation for valid book data', () => {
      mockRequest = {
        body: {
          title: 'Test Book',
          author: 'Test Author',
          isbn: '978-0-13-149505-0',
          publishedYear: 2023,
          quantity: 5,
        },
      }

      validate(schema, { target: 'body' })(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )

      expect(nextFunction).toHaveBeenCalled()
      expect(mockResponse.status).not.toHaveBeenCalled()
    })

    it('should return 400 for invalid book data', () => {
      mockRequest = {
        body: {
          title: 'Test Book',
          // Missing required fields
        },
      }

      validate(schema, { target: 'body' })(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )

      expect(nextFunction).not.toHaveBeenCalled()
      expect(mockResponse.status).toHaveBeenCalledWith(400)
    })
  })

  describe('error handling', () => {
    it('should handle validation errors', () => {
      const schema = Joi.object({
        field: Joi.string().required(),
      })

      mockRequest = {
        body: {
          field: '',
        },
      }

      validate(schema, { target: 'body' })(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )

      expect(nextFunction).not.toHaveBeenCalled()
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
        })
      )
    })
  })
})
