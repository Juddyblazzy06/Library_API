# Library Management System

A Node.js-based Library Management System built with Express and MongoDB, following the MVC architecture pattern.

## Features

- User Authentication (Register/Login)
- Book Management (Add/Edit/Delete/List books)
- Student Management
- Teacher Management
- Borrowing System
- Redis Caching
- GraphQL API
- REST API

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Redis
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=4000
   MONGODB_URI=your_mongodb_connection_string
   REDIS_URL=your_redis_url
   JWT_SECRET=your_jwt_secret
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

### REST API Endpoints

#### Teachers

- GET /api/teachers - Get all teachers
- GET /api/teachers/:id - Get a specific teacher
- GET /api/teachers/:teacherId/students - Get all students of a teacher
- POST /api/teachers - Create a new teacher

#### Students

- GET /api/students - Get all students
- GET /api/students/:id - Get a specific student
- GET /api/students/:studentId/books - Get all books of a student
- POST /api/students - Create a new student
- POST /api/students/:studentId/books/:bookId - Add a book to student
- DELETE /api/students/:studentId/books/:bookId - Remove a book from student

#### Books

- GET /api/books - Get all books
- GET /api/books/:id - Get a specific book
- POST /api/books - Create a new book
- PUT /api/books/:id - Update a book
- DELETE /api/books/:id - Delete a book

### GraphQL API

The GraphQL playground is available at `/graphql` when running in development mode.

Example Queries:

```graphql
# Get all teachers
query {
  teachers {
    id
    name
    email
    students {
      id
      name
    }
  }
}

# Get all books of a student
query {
  studentBooks(studentId: "student_id") {
    id
    title
    author
    availableQuantity
  }
}
```

## Deployment

### Deploy to Heroku

1. Create a Heroku account and install the Heroku CLI
2. Login to Heroku:
   ```bash
   heroku login
   ```
3. Create a new Heroku app:
   ```bash
   heroku create your-app-name
   ```
4. Add MongoDB and Redis add-ons:
   ```bash
   heroku addons:create mongolab
   heroku addons:create heroku-redis
   ```
5. Set environment variables:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your_jwt_secret
   ```
6. Deploy the application:
   ```bash
   git push heroku main
   ```

### Deploy to DigitalOcean

1. Create a DigitalOcean account
2. Create a new Droplet with Node.js image
3. SSH into your Droplet
4. Clone the repository
5. Install dependencies:
   ```bash
   npm install
   ```
6. Install and configure PM2:
   ```bash
   npm install -g pm2
   pm2 start dist/app.js
   ```
7. Configure Nginx as a reverse proxy

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Project Structure

```
├── config/
│   └── database.js
├── controllers/
│   ├── authController.js
│   ├── bookController.js
│   └── userController.js
├── middleware/
│   ├── auth.js
│   └── errorHandler.js
├── models/
│   ├── Book.js
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   ├── bookRoutes.js
│   └── userRoutes.js
├── utils/
│   └── helpers.js
├── .env
├── .gitignore
├── app.js
└── package.json
```

## API Endpoints

### Authentication

- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user

### Books

- GET /api/books - Get all books
- GET /api/books/:id - Get a specific book
- POST /api/books - Create a new book
- PUT /api/books/:id - Update a book
- DELETE /api/books/:id - Delete a book

### Users

- GET /api/users - Get all users (Admin only)
- GET /api/users/:id - Get user profile
- PUT /api/users/:id - Update user profile
- DELETE /api/users/:id - Delete user (Admin only)
