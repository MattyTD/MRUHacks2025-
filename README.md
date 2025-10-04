# MRUHacks2025 MERN Stack Application

A modern full-stack web application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) for MRUHacks2025.

## Features

- 🔐 JWT-based authentication system
- 👤 User registration and login
- 🛡️ Protected routes and middleware
- 📱 Responsive design
- 🎨 Modern UI with CSS styling
- 🔄 Real-time data fetching
- 📊 User dashboard

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React.js** - Frontend framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Context API** - State management

## Project Structure

```
MRUHacks2025-/
├── backend/
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── users.js
│   ├── middleware/
│   │   └── auth.js
│   ├── config.env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   └── ProtectedRoute.js
│   │   ├── contexts/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   └── Dashboard.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MRUHacks2025-
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   - Copy `backend/config.env` and update the values:
     ```env
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/mruhacks2025
     JWT_SECRET=your_jwt_secret_key_here
     NODE_ENV=development
     ```

4. **Start MongoDB**
   - Make sure MongoDB is running on your system
   - Or use MongoDB Atlas and update the connection string

5. **Run the application**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend development server (port 3000).

## Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend in development mode
- `npm run install-all` - Install dependencies for all packages
- `npm run build` - Build the frontend for production
- `npm start` - Start the production server

### Backend
- `npm run server` - Start only the backend server
- `npm run dev` - Start backend with nodemon (auto-restart)

### Frontend
- `npm start` - Start the React development server
- `npm run build` - Build for production
- `npm test` - Run tests

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Users
- `GET /api/users` - Get all users (protected)
- `GET /api/users/:id` - Get user by ID (protected)

## Usage

1. **Register**: Create a new account at `/register`
2. **Login**: Sign in at `/login`
3. **Dashboard**: Access your dashboard at `/dashboard` (requires authentication)
4. **Home**: View the landing page at `/`

## Development

### Backend Development
- Server runs on `http://localhost:5000`
- API endpoints are prefixed with `/api`
- MongoDB connection is configured in `server.js`

### Frontend Development
- React app runs on `http://localhost:3000`
- Proxy is configured to forward API calls to the backend
- Authentication state is managed using React Context

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the MRUHacks2025 team.
