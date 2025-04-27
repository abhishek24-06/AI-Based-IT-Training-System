# AI-Based IT Training System

A web-based IT Training System that personalizes learning paths, adapts content difficulty, and tracks user progress using Artificial Intelligence algorithms — built on the MERN Stack.

## Features

- User Authentication (Registration, Login, Password Reset)
- Course Management
- Personalized Learning Paths
- Adaptive Assessments
- Progress Tracking
- Admin Dashboard
- AI-powered Recommendations

## Tech Stack

- **Frontend**: React.js, Redux Toolkit, Material-UI
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT, bcrypt.js
- **AI/ML**: Collaborative Filtering for Recommendations

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone https://github.com/abhishek24-06/AI-Based-IT-Training-System.git
cd AI-Based-IT-Training-System
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/it-training-system
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

4. Start the development server:

```bash
npm run dev
```

## Project Structure

```
ai-it-training-system/
├── models/             # MongoDB models
├── routes/             # API routes
├── middleware/         # Custom middleware
├── controllers/        # Route controllers
├── config/            # Configuration files
├── public/            # Static files
└── tests/             # Test files
```

## API Endpoints

### Authentication

- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- POST /api/auth/forgot-password - Request password reset
- POST /api/auth/reset-password - Reset password

### Courses

- GET /api/courses - Get all courses
- GET /api/courses/:id - Get course by ID
- POST /api/courses - Create new course (admin only)
- PUT /api/courses/:id - Update course (admin only)
- DELETE /api/courses/:id - Delete course (admin only)

### Assessments

- GET /api/assessments - Get all assessments
- GET /api/assessments/:id - Get assessment by ID
- POST /api/assessments - Create new assessment (admin only)
- PUT /api/assessments/:id - Update assessment (admin only)
- DELETE /api/assessments/:id - Delete assessment (admin only)

### User Progress

- GET /api/progress - Get user progress
- POST /api/progress - Update user progress
- GET /api/recommendations - Get personalized recommendations

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Material-UI for the UI components
- MongoDB for the database
- Express.js for the backend framework
- React.js for the frontend framework
