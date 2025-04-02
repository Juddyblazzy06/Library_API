import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { AppError } from './errorHandler'

type ValidationTarget = 'body' | 'params' | 'query'

interface ValidationOptions {
  target?: ValidationTarget
  stripUnknown?: boolean
  abortEarly?: boolean
  allowUnknown?: boolean
}

export const validate = (
  schema: Joi.ObjectSchema,
  options: ValidationOptions = {}
) => {
  const {
    target = 'body',
    stripUnknown = true,
    abortEarly = false,
    allowUnknown = false,
  } = options

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = schema.validate(req[target], {
        abortEarly,
        stripUnknown,
        allowUnknown,
        messages: {
          'string.empty': 'This field cannot be empty',
          'string.min': 'This field must be at least {#limit} characters long',
          'string.max': 'This field cannot exceed {#limit} characters',
          'string.pattern.base': 'Invalid format',
          'number.base': 'Must be a number',
          'number.integer': 'Must be a whole number',
          'number.min': 'Cannot be less than {#limit}',
          'number.max': 'Cannot be greater than {#limit}',
          'any.required': 'This field is required',
        },
      })

      if (error) {
        const errorMessages = error.details.map((detail) => {
          const field = detail.path.join('.')
          return `${field}: ${detail.message}`
        })
        const message = errorMessages.join(', ')
        res.status(400).json({ message, errors: errorMessages })
        return
      }

      // Update the request with validated data
      req[target] = value
      next()
    } catch (err) {
      // Handle unexpected errors during validation
      next(new AppError('Validation error occurred', 500))
    }
  }
}
