import Joi from 'joi'

const commonStringRules = {
  trim: true,
  min: 3,
  max: 50,
  messages: {
    'string.empty': 'This field cannot be empty',
    'string.min': 'This field must be at least {#limit} characters long',
    'string.max': 'This field cannot exceed {#limit} characters',
    'any.required': 'This field is required',
  },
};

const commonIdRules = {
  pattern: /^[0-9a-fA-F]{24}$/,
  messages: {
    'string.pattern.base': 'Invalid ID format',
    'any.required': 'ID is required',
  },
};

export const teacherSchema = Joi.object({
  name: Joi.string().required().min(3).max(50).trim().messages(commonStringRules.messages),
  email: Joi.string().email().required().trim().lowercase().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required',
  }),
  subject: Joi.string().required().min(2).max(50).trim().messages(commonStringRules.messages),
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .required()
    .trim()
    .messages({
      'string.pattern.base': 'Please enter a valid phone number',
      'any.required': 'Phone number is required',
    }),
})

export const studentSchema = Joi.object({
  name: Joi.string().required().min(3).max(50).trim().messages(commonStringRules.messages),
  email: Joi.string().email().required().trim().lowercase().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required',
  }),
  grade: Joi.string().required().min(1).max(10).trim().messages({
    'string.min': 'Grade must be at least 1 character',
    'string.max': 'Grade cannot exceed 10 characters',
    'any.required': 'Grade is required',
  }),
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .required()
    .trim()
    .messages({
      'string.pattern.base': 'Please enter a valid phone number',
      'any.required': 'Phone number is required',
    }),
})

export const bookSchema = Joi.object({
  title: Joi.string().required().min(1).max(100).trim().messages({
    'string.empty': 'Title cannot be empty',
    'string.min': 'Title must be at least 1 character',
    'string.max': 'Title cannot exceed 100 characters',
    'any.required': 'Title is required',
  }),
  author: Joi.string().required().min(2).max(100).trim().messages({
    'string.empty': 'Author name cannot be empty',
    'string.min': 'Author name must be at least 2 characters',
    'string.max': 'Author name cannot exceed 100 characters',
    'any.required': 'Author name is required',
  }),
  isbn: Joi.string()
    .required()
    .pattern(
      /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/
    )
    .trim()
    .messages({
      'string.pattern.base': 'Please enter a valid ISBN',
      'any.required': 'ISBN is required',
    }),
  publishedYear: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear())
    .required()
    .messages({
      'number.base': 'Published year must be a number',
      'number.integer': 'Published year must be a whole number',
      'number.min': 'Published year cannot be before 1900',
      'number.max': 'Published year cannot be in the future',
      'any.required': 'Published year is required',
    }),
  quantity: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      'number.base': 'Quantity must be a number',
      'number.integer': 'Quantity must be a whole number',
      'number.min': 'Quantity cannot be negative',
      'any.required': 'Quantity is required',
    }),
})

// ID validation schemas
export const teacherIdSchema = Joi.object({
  teacherId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/).trim().messages(commonIdRules.messages),
})

export const studentIdSchema = Joi.object({
  studentId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/).trim().messages(commonIdRules.messages),
})

export const bookIdSchema = Joi.object({
  bookId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/).trim().messages(commonIdRules.messages),
})
