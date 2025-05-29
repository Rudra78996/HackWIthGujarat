# 🚀 Hack With Gujarat

A full-stack web application for the Hack With Gujarat hackathon platform, built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## 🌐 Live Demo

Visit the live application at: [https://hack-w-ith-gujarat.vercel.app/](https://hack-w-ith-gujarat.vercel.app/)

## ✨ Features

- 🔐 User authentication and authorization
- 👤 User profile management with skills and social links
- 👨‍💼 Admin dashboard for user management
- 📱 Responsive design for all devices
- ⚡ Real-time updates
- 🔒 Secure password handling with bcrypt
- 🗄️ MongoDB database integration

## 🛠️ Tech Stack

### Frontend
- ⚛️ React.js
- 🎨 Tailwind CSS
- 🔄 Redux Toolkit for state management
- 🛣️ React Router for navigation
- 📡 Axios for API requests

### Backend
- 🟢 Node.js
- 🚂 Express.js
- 🍃 MongoDB with Mongoose
- 🔑 JWT for authentication
- 🔐 bcrypt for password hashing

## 📋 Prerequisites

Before running this project, make sure you have the following installed:
- 📦 Node.js (v14 or higher)
- 🗄️ MongoDB
- 📦 npm or yarn

## 🚀 Getting Started

### 1️⃣ Clone the repository
```bash
git clone <repository-url>
cd hack-with-gujarat
```

### 2️⃣ Install dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 3️⃣ Environment Setup

Create a `.env` file in the backend directory with the following variables:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 4️⃣ Run the application

#### Backend
```bash
cd backend
npm run dev
```

#### Frontend
```bash
cd frontend
npm run dev
```

The application will be available at:
- 🌐 Frontend: http://localhost:3000
- 🔧 Backend: http://localhost:5000

## 📁 Project Structure

```
hack-with-gujarat/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   ├── pages/
│   │   └── App.js
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- 🔐 POST /api/users/register - Register a new user
- 🔑 POST /api/users/login - Login user
- 👤 GET /api/users/me - Get current user

### User Management
- 👥 GET /api/users - Get all users (Admin only)
- 👤 GET /api/users/:id - Get user by ID
- ✏️ PUT /api/users/:id - Update user
- 🛠️ PUT /api/users/:id/skills - Update user skills
- 🔗 PUT /api/users/:id/social - Update user social links
- 🖼️ PUT /api/users/:id/avatar - Update user profile picture

## 🤝 Contributing

1. 🍴 Fork the repository
2. 🌿 Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push to the branch (`git push origin feature/AmazingFeature`)
5. 🔄 Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

For any queries or support, please reach out to the project maintainers.

## 🙏 Acknowledgments

- 👥 Thanks to all contributors who have helped in building this project
- 🏆 Special thanks to the Hack With Gujarat team for their support 