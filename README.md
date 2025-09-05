# Chiral - AI-Powered Learning Platform

<div align="center">

![Chiral Logo](https://res.cloudinary.com/dts0ewxuq/image/upload/v1757094693/brain_sjhqky.png)

**Transform technical articles into interactive learning experiences with AI-powered explanations**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19+-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v14+-blue.svg)](https://postgresql.org/)

[Live Demo](https://chiral.neubri.site) • [API Documentation](./server/API_DOC.md) • [Report Bug](https://github.com/neubri/chiral-dev/issues) • [Request Feature](https://github.com/neubri/chiral-dev/issues)

</div>

---

## About Chiral

Chiral is an intelligent learning platform that transforms how developers learn from technical articles. By integrating AI-powered explanations with intuitive highlighting and note-taking features, Chiral makes complex programming concepts accessible to everyone.

### Key Features

- **Smart Article Discovery**: Browse curated articles from Dev.to API with personalized recommendations
- **AI-Powered Explanations**: Get instant, simplified explanations for complex terms using Google Gemini AI
- **Intelligent Highlighting**: Highlight confusing text and receive automatic AI explanations
- **Comprehensive Notes**: Create traditional notes or save highlighted content for future reference
- **Secure Authentication**: Email/password and Google OAuth integration
- **Personalized Experience**: Customize learning interests for tailored content recommendations
- **Modern UI/UX**: Clean, responsive design built with React and Tailwind CSS

### Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Express.js)  │◄──►│  (PostgreSQL)   │
│                 │    │                 │    │                 │
│ • Vite          │    │ • JWT Auth      │    │ • Sequelize ORM │
│ • Redux Toolkit │    │ • RESTful API   │    │ • User Data     │
│ • Tailwind CSS  │    │ • Gemini AI     │    │ • Notes/Highlights│
└─────────────────┘    └─────────────────┘    └─────────────────┘
                               │
                       ┌───────▼───────┐
                       │  External APIs │
                       │                │
                       │ • Dev.to API   │
                       │ • Google AI    │
                       │ • Google OAuth │
                       └───────────────┘
```

---

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/neubri/chiral-dev.git
   cd chiral-dev
   ```

2. **Set up the backend**

   ```bash
   cd server
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**

   ```bash
   npm run db:migrate
   npm run db:seed  # Optional: Add sample data
   ```

5. **Start the backend server**

   ```bash
   npm run dev  # Development mode
   # or
   npm start    # Production mode
   ```

6. **Set up the frontend**

   ```bash
   cd ../client
   npm install
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

---

## Environment Configuration

### Backend (.env)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chiral_dev
DB_USERNAME=your_username
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Google AI (Gemini)
GEMINI_API_KEY=your-gemini-api-key

# Environment
NODE_ENV=development
PORT=3000
```

### Frontend

```env
# API Base URL
VITE_API_BASE_URL=http://localhost:3000/api

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

---

## API Documentation

Comprehensive API documentation is available in [API_DOC.md](./server/API_DOC.md).

### Key Endpoints

| Method | Endpoint              | Description         |
| ------ | --------------------- | ------------------- |
| `GET`  | `/api/articles`       | Get public articles |
| `GET`  | `/api/articles/:id`   | Get article details |
| `POST` | `/api/auth/register`  | User registration   |
| `POST` | `/api/auth/login`     | User login          |
| `POST` | `/api/notes`          | Create note         |
| `POST` | `/api/highlights`     | Create highlight    |
| `POST` | `/api/gemini/explain` | AI explanation      |

---

## Technology Stack

### Frontend

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Sequelize** - PostgreSQL ORM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Google AI (Gemini)** - AI explanations
- **Google Auth Library** - OAuth integration

### Database

- **PostgreSQL** - Primary database
- **Sequelize** - ORM and migrations

### Development Tools

- **Jest** - Testing framework
- **Supertest** - API testing
- **ESLint** - Code linting
- **Nodemon** - Development server

---

## Project Structure

```
chiral-dev/
├── client/                     # Frontend React application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── layouts/           # Layout components
│   │   ├── store/             # Redux store configuration
│   │   ├── lib/               # Utility libraries
│   │   └── assets/            # Static assets
│   ├── public/                # Public assets
│   └── package.json           # Frontend dependencies
│
├── server/                     # Backend Express application
│   ├── controllers/           # Route controllers
│   ├── models/               # Database models
│   ├── middlewares/          # Express middlewares
│   ├── helpers/              # Utility functions
│   ├── migrations/           # Database migrations
│   ├── __tests__/            # Test files
│   └── package.json          # Backend dependencies
│
└── README.md                  # Project documentation
```

---

## Testing

### Backend Testing

```bash
cd server
npm test                    # Run all tests
npm run test:coverage      # Run tests with coverage
npm run test:watch         # Watch mode
```

### Test Coverage

The project maintains comprehensive test coverage including:

- Unit tests for controllers and helpers
- Integration tests for API endpoints
- Authentication and authorization tests
- Database model tests

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Project Status

This project is currently in active development as part of a Phase 2 Individual Project. New features and improvements are being added regularly.

---

<div align="center">

**Made with ❤️ by [Neubri Hidayah](https://github.com/neubri)**

_If you found this project helpful, please consider giving it a ⭐!_

</div>
