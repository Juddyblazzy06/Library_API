# Library Management System

A full-stack library management system with both REST and GraphQL APIs.

## Deployment Instructions

### Prerequisites

- MongoDB Atlas account
- Redis account
- Render account

### Environment Variables

Before deploying, you'll need to set up the following environment variables in your Render dashboard:

1. `MONGODB_URI`: Your MongoDB connection string
2. `REDIS_URL`: Your Redis connection string
3. `JWT_SECRET`: A secure secret for JWT token generation
4. `JWT_EXPIRES_IN`: Token expiration time (default: 24h)
5. `CORS_ORIGIN`: Allowed origins for CORS (default: "\*")

### Deployment Steps

1. Fork this repository to your GitHub account
2. Create a new Web Service in Render
3. Connect your GitHub repository
4. Configure the following settings:
   - Build Command: `npm install`
   - Start Command: `npm run start` (for REST API) or `npm run start:graphql` (for GraphQL API)
   - Environment: Node
   - Port: 4000 (REST) or 4001 (GraphQL)

### Postman Collection Setup

1. Import the `Library_Management_System.postman_collection.json` file
2. Create a new environment in Postman
3. Add the following variables:
   - `rest_api_url`: Your REST API URL (e.g., https://library-rest-api.onrender.com)
   - `graphql_api_url`: Your GraphQL API URL (e.g., https://library-graphql-api.onrender.com/graphql)

### API Endpoints

#### REST API

- Base URL: `https://library-rest-api.onrender.com`
- Documentation: Available at `/api-docs`

#### GraphQL API

- Endpoint: `https://library-graphql-api.onrender.com/graphql`
- Playground: Available at the same URL

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env` file
4. Start the development server:
   - REST API: `npm run dev`
   - GraphQL API: `npm run dev:graphql`

## Features

- User authentication and authorization
- Book management
- Student management
- Teacher management
- Book assignments
- Redis caching
- Rate limiting
- Input validation
- Error handling
- API documentation

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
