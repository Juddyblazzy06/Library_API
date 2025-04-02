const axios = require('axios')
const fs = require('fs')

const API_BASE_URL = 'http://localhost:3000/api'
const testData = JSON.parse(fs.readFileSync('test-data.json', 'utf8'))

async function testAPI() {
  try {
    console.log('Starting API tests...\n')

    // Test Teachers
    console.log('Testing Teacher endpoints...')
    for (const teacher of testData.teachers) {
      const response = await axios.post(`${API_BASE_URL}/teachers`, teacher)
      console.log(`Created teacher: ${teacher.name}`)
    }
    console.log('Teacher tests completed.\n')

    // Test Students
    console.log('Testing Student endpoints...')
    for (const student of testData.students) {
      const response = await axios.post(`${API_BASE_URL}/students`, student)
      console.log(`Created student: ${student.name}`)
    }
    console.log('Student tests completed.\n')

    // Test Books
    console.log('Testing Book endpoints...')
    for (const book of testData.books) {
      const response = await axios.post(`${API_BASE_URL}/books`, book)
      console.log(`Created book: ${book.title}`)
    }
    console.log('Book tests completed.\n')

    // Test Book Assignment
    console.log('Testing Book Assignment...')
    const students = await axios.get(`${API_BASE_URL}/students`)
    const books = await axios.get(`${API_BASE_URL}/books`)

    if (students.data.length > 0 && books.data.length > 0) {
      const studentId = students.data[0]._id
      const bookId = books.data[0]._id

      await axios.post(
        `${API_BASE_URL}/books/student/${studentId}/books/${bookId}`
      )
      console.log(`Assigned book to student successfully`)
    }
    console.log('Book assignment test completed.\n')

    console.log('All tests completed successfully!')
  } catch (error) {
    console.error(
      'Error during testing:',
      error.response?.data || error.message
    )
  }
}

testAPI()
