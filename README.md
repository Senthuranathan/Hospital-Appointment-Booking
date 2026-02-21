# SkillBridge Backend API

Backend API for the SkillBridge Job Portal application.

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation

```bash
cd backend
npm install
```

## Running the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check
- `GET /api/health` - Check if API is running

### Jobs
- `GET /api/jobs` - Get all jobs (supports query params: keyword, location, type, category, page, limit)
- `GET /api/jobs/:id` - Get a specific job by ID

### Categories
- `GET /api/categories` - Get all job categories

### Training
- `GET /api/training` - Get all training courses
- `GET /api/training/:id` - Get a specific training course
- `POST /api/training/enroll` - Enroll in a training course

### Applications
- `GET /api/applications` - Get all job applications
- `POST /api/applications` - Submit a job application

### Salary Calculator
- `POST /api/salary/calculate` - Calculate estimated salary

## Example Requests

### Get all IT jobs
```
GET http://localhost:3000/api/jobs?category=it
```

### Search jobs
```
GET http://localhost:3000/api/jobs?keyword=developer&location=Bangalore
```

### Filter by job type
```
GET http://localhost:3000/api/jobs?type=full-time
```

### Submit job application
```
POST http://localhost:3000/api/applications
Content-Type: application/json

{
  "jobId": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "experience": 3,
  "skills": "JavaScript, React, Node.js"
}
```

### Calculate salary
```
POST http://localhost:3000/api/salary/calculate
Content-Type: application/json

{
  "experience": 3,
  "expLevel": "mid",
  "category": "it",
  "jobType": "full-time",
  "skills": "intermediate"
}
```

## Project Structure

```
backend/
├── package.json
├── server.js
└── README.md
```

## Dependencies

- express - Web framework for Node.js
- cors - CORS middleware
- body-parser - Body parsing middleware

## Notes

- The backend uses in-memory storage for data (data is reset when server restarts)
- All salary values are in Indian Rupees (INR)
- The API supports both English and Hindi languages for categories and training content
