# Chiral Learning API Documentation

## Base URL

```
http://localhost:3000
```

## Overview

Chiral Learning API adalah backend service untuk platform pembelajaran yang mengintegrasikan artikel dari Dev.to, AI features menggunakan Gemini AI, dan sistem note-taking personal. API ini menggunakan JWT untuk authentication dan menyediakan public endpoints untuk akses tanpa autentikasi.

---

## Authentication

API menggunakan JWT (JSON Web Token) untuk authentication. Token harus disertakan dalam header `Authorization` dengan format `Bearer <token>`.

```
Authorization: Bearer <your_jwt_token>
```

---

## Public Endpoints

### 1. Health Check

#### GET /

Get server health status (root endpoint)

**Response:**

```json
{
  "message": "Chiral server is running!",
  "timestamp": "2025-07-22T00:43:45.062Z",
  "version": "1.0.0"
}
```

#### GET /api/health

Get server health status (API endpoint)

**Response:**

```json
{
  "message": "Chiral server is running!",
  "timestamp": "2025-07-22T00:43:45.062Z",
  "version": "1.0.0"
}
```

### 2. Public Articles

#### GET /api/articles

Get public articles from Dev.to

**Query Parameters:**

- `tag` (string, optional): Filter by tag (default: "programming")
- `per_page` (number, optional): Number of articles (max: 20, default: 10)

**Example Request:**

```
GET /api/articles?tag=javascript&per_page=5
```

**Response:**

```json
{
  "articles": [
    {
      "type_of": "article",
      "id": 2690431,
      "title": "Introducing Kiro – An AI IDE That Thinks Like a Developer",
      "description": "👋 Hey there, tech enthusiasts!...",
      "readable_publish_date": "Jul 15",
      "slug": "introducing-kiro-an-ai-ide-that-thinks-like-a-developer-42jp",
      "url": "https://dev.to/aws-builders/introducing-kiro-an-ai-ide-that-thinks-like-a-developer-42jp",
      "comments_count": 6,
      "public_reactions_count": 205,
      "published_timestamp": "2025-07-15T13:08:43Z",
      "tag_list": ["aws", "kiro", "programming", "ai"],
      "user": {
        "name": "Sarvar Nadaf",
        "username": "sarvar_04",
        "profile_image": "https://...",
        "profile_image_90": "https://..."
      }
    }
  ],
  "total": 10
}
```

### 3. Public Tags

#### GET /api/tags

Get popular tags from Dev.to

**Response:**

```json
{
  "tags": [
    {
      "id": 1,
      "name": "javascript",
      "bg_color_hex": "#f7df1e",
      "text_color_hex": "#000000"
    }
  ],
  "total": 50
}
```

---

## Authentication Endpoints

### 1. User Registration

#### POST /api/auth/register

Register new user

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "learningInterests": ["javascript", "react", "nodejs"]
}
```

**Response (201):**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "googleId": null,
    "learningInterests": ["javascript", "react", "nodejs"],
    "profilePicture": null
  }
}
```

**Error Response (400):**

```json
{
  "message": "Name is required"
}
```

### 2. User Login

#### POST /api/auth/login

Login user

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200):**

```json
{
  "message": "Login successful",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "googleId": null,
    "learningInterests": ["javascript", "react", "nodejs"],
    "profilePicture": null
  }
}
```

**Error Response (401):**

```json
{
  "message": "Invalid email/password"
}
```

### 3. Google OAuth Login

#### POST /api/auth/google

Login with Google OAuth (Coming Soon)

**Request Body:**

```json
{
  "token": "google_oauth_token_here"
}
```

**Response (501):**

```json
{
  "message": "Google OAuth integration coming soon",
  "token": "google_oauth_token_here"
}
```

---

## Protected Endpoints

> **Note:** All endpoints below require authentication. Include JWT token in Authorization header.

### User Profile

#### PUT /api/auth/interests

Update user learning interests

**Request Body:**

```json
{
  "learningInterests": ["python", "machine-learning", "data-science"]
}
```

**Response (200):**

```json
{
  "message": "Learning interests updated successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "learningInterests": ["python", "machine-learning", "data-science"]
  }
}
```

#### GET /api/auth/profile

Get user profile

**Response (200):**

```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "googleId": null,
    "learningInterests": ["python", "machine-learning", "data-science"],
    "profilePicture": null
  }
}
```

---

## Articles Endpoints

### 1. Get Recommendations

#### GET /api/articles/recommendations

Get personalized article recommendations based on user interests

**Response (200):**

```json
{
  "recommendations": [
    {
      "id": 2690431,
      "title": "Introducing Kiro – An AI IDE",
      "description": "AI IDE development...",
      "url": "https://dev.to/...",
      "tags": ["ai", "ide", "programming"],
      "relevanceScore": 0.95
    }
  ]
}
```

### 2. Search Articles

#### GET /api/articles/search

Search articles with query

**Query Parameters:**

- `q` (string, required): Search query
- `tag` (string, optional): Filter by tag
- `per_page` (number, optional): Results per page (max: 20)

**Example Request:**

```
GET /api/articles/search?q=react hooks&tag=react&per_page=10
```

**Response (200):**

```json
{
  "articles": [
    {
      "id": 123456,
      "title": "Understanding React Hooks",
      "description": "Deep dive into React Hooks...",
      "url": "https://dev.to/...",
      "tags": ["react", "hooks", "javascript"]
    }
  ],
  "total": 25,
  "query": "react hooks"
}
```

### 3. Get Dev.to Article

#### GET /api/articles/devto/:id

Get specific article from Dev.to by ID

**Parameters:**

- `id` (number): Dev.to article ID

**Response (200):**

```json
{
  "article": {
    "id": 123456,
    "title": "Understanding React Hooks",
    "body_markdown": "# React Hooks\n\nReact Hooks are...",
    "description": "Deep dive into React Hooks...",
    "url": "https://dev.to/...",
    "tags": ["react", "hooks", "javascript"],
    "user": {
      "name": "Jane Developer",
      "username": "jane_dev"
    }
  }
}
```

### 4. Save Article

#### POST /api/articles/save

Save article to user's collection

**Request Body:**

```json
{
  "devToId": 123456,
  "title": "Understanding React Hooks",
  "description": "Deep dive into React Hooks...",
  "url": "https://dev.to/...",
  "tags": ["react", "hooks", "javascript"],
  "author": "Jane Developer"
}
```

**Response (201):**

```json
{
  "message": "Article saved successfully",
  "article": {
    "id": 1,
    "devToId": 123456,
    "title": "Understanding React Hooks",
    "description": "Deep dive into React Hooks...",
    "url": "https://dev.to/...",
    "tags": ["react", "hooks", "javascript"],
    "author": "Jane Developer",
    "userId": 1,
    "createdAt": "2025-07-22T01:00:00.000Z"
  }
}
```

### 5. Get Saved Articles

#### GET /api/articles/saved

Get user's saved articles

**Query Parameters:**

- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 50)

**Response (200):**

```json
{
  "articles": [
    {
      "id": 1,
      "devToId": 123456,
      "title": "Understanding React Hooks",
      "description": "Deep dive into React Hooks...",
      "url": "https://dev.to/...",
      "tags": ["react", "hooks", "javascript"],
      "author": "Jane Developer",
      "createdAt": "2025-07-22T01:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### 6. Delete Saved Article

#### DELETE /api/articles/saved/:id

Delete saved article from user's collection

**Parameters:**

- `id` (number): Saved article ID

**Response (200):**

```json
{
  "message": "Article removed from saved collection"
}
```

---

## Notes Endpoints

### 1. Create Note

#### POST /api/notes

Create new note

**Request Body:**

```json
{
  "title": "React Hooks Summary",
  "content": "## React Hooks\n\n- useState\n- useEffect\n- useContext",
  "tags": ["react", "hooks", "summary"],
  "isPublic": false
}
```

**Response (201):**

```json
{
  "message": "Note created successfully",
  "note": {
    "id": 1,
    "title": "React Hooks Summary",
    "content": "## React Hooks\n\n- useState\n- useEffect\n- useContext",
    "tags": ["react", "hooks", "summary"],
    "isPublic": false,
    "userId": 1,
    "createdAt": "2025-07-22T01:00:00.000Z",
    "updatedAt": "2025-07-22T01:00:00.000Z"
  }
}
```

### 2. Get Notes

#### GET /api/notes

Get user's notes

**Query Parameters:**

- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 50)
- `search` (string, optional): Search in title and content
- `tag` (string, optional): Filter by tag

**Example Request:**

```
GET /api/notes?page=1&limit=10&search=react&tag=summary
```

**Response (200):**

```json
{
  "notes": [
    {
      "id": 1,
      "title": "React Hooks Summary",
      "content": "## React Hooks\n\n- useState\n- useEffect\n- useContext",
      "tags": ["react", "hooks", "summary"],
      "isPublic": false,
      "createdAt": "2025-07-22T01:00:00.000Z",
      "updatedAt": "2025-07-22T01:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

### 3. Get Note by ID

#### GET /api/notes/:id

Get specific note by ID

**Parameters:**

- `id` (number): Note ID

**Response (200):**

```json
{
  "note": {
    "id": 1,
    "title": "React Hooks Summary",
    "content": "## React Hooks\n\n- useState\n- useEffect\n- useContext",
    "tags": ["react", "hooks", "summary"],
    "isPublic": false,
    "userId": 1,
    "createdAt": "2025-07-22T01:00:00.000Z",
    "updatedAt": "2025-07-22T01:00:00.000Z"
  }
}
```

### 4. Update Note

#### PUT /api/notes/:id

Update existing note

**Parameters:**

- `id` (number): Note ID

**Request Body:**

```json
{
  "title": "React Hooks Complete Guide",
  "content": "## React Hooks Complete Guide\n\n### Basic Hooks\n- useState\n- useEffect\n- useContext\n\n### Advanced Hooks\n- useReducer\n- useMemo\n- useCallback",
  "tags": ["react", "hooks", "complete-guide"],
  "isPublic": true
}
```

**Response (200):**

```json
{
  "message": "Note updated successfully",
  "note": {
    "id": 1,
    "title": "React Hooks Complete Guide",
    "content": "## React Hooks Complete Guide\n\n### Basic Hooks\n- useState\n- useEffect\n- useContext\n\n### Advanced Hooks\n- useReducer\n- useMemo\n- useCallback",
    "tags": ["react", "hooks", "complete-guide"],
    "isPublic": true,
    "userId": 1,
    "updatedAt": "2025-07-22T02:00:00.000Z"
  }
}
```

### 5. Delete Note

#### DELETE /api/notes/:id

Delete note

**Parameters:**

- `id` (number): Note ID

**Response (200):**

```json
{
  "message": "Note deleted successfully"
}
```

### 6. Export Note to PDF

#### GET /api/notes/export/pdf

Export user's notes to PDF

**Query Parameters:**

- `noteIds` (string, optional): Comma-separated note IDs (if not provided, exports all notes)

**Example Request:**

```
GET /api/notes/export/pdf?noteIds=1,2,3
```

**Response (200):**

- Content-Type: `application/pdf`
- PDF file download

### 7. Get Note as Markdown

#### GET /api/notes/:id/markdown

Get note content as downloadable markdown file

**Parameters:**

- `id` (number): Note ID

**Response (200):**

- Content-Type: `text/markdown`
- Markdown file download

---

## Gemini AI Endpoints

### 1. Explain Text

#### POST /api/gemini/explain

Get AI explanation of complex concepts

**Request Body:**

```json
{
  "text": "What are React Hooks and how do they work?",
  "context": "I'm learning React and need a beginner-friendly explanation"
}
```

**Response (200):**

```json
{
  "explanation": "React Hooks are functions that let you 'hook into' React state and lifecycle features from function components...",
  "examples": ["useState for state management", "useEffect for side effects"],
  "relatedTopics": ["React Components", "State Management", "Lifecycle Methods"]
}
```

### 2. Generate Learning Path

#### POST /api/gemini/suggestions

Get personalized learning path suggestions

**Request Body:**

```json
{
  "topic": "Full Stack Web Development",
  "currentLevel": "beginner",
  "interests": ["javascript", "react", "nodejs"],
  "timeframe": "3 months"
}
```

**Response (200):**

```json
{
  "learningPath": {
    "title": "Full Stack Web Development - 3 Month Plan",
    "totalWeeks": 12,
    "phases": [
      {
        "phase": 1,
        "title": "Frontend Fundamentals",
        "weeks": "1-4",
        "topics": ["HTML/CSS", "JavaScript ES6+", "DOM Manipulation"],
        "resources": ["MDN Web Docs", "JavaScript.info"],
        "projects": ["Personal Portfolio", "Interactive Calculator"]
      }
    ]
  },
  "nextSteps": ["Set up development environment", "Start with HTML/CSS basics"]
}
```

### 3. Generate Quiz

#### POST /api/gemini/quiz

Generate quiz based on learning material

**Request Body:**

```json
{
  "topic": "React Hooks",
  "difficulty": "intermediate",
  "questionCount": 5,
  "types": ["multiple-choice", "true-false"]
}
```

**Response (200):**

```json
{
  "quiz": {
    "title": "React Hooks Quiz",
    "topic": "React Hooks",
    "difficulty": "intermediate",
    "questions": [
      {
        "id": 1,
        "type": "multiple-choice",
        "question": "Which Hook is used for managing component state?",
        "options": ["useEffect", "useState", "useContext", "useReducer"],
        "correctAnswer": "useState",
        "explanation": "useState is the Hook specifically designed for managing state in functional components."
      }
    ]
  },
  "estimatedTime": "10 minutes"
}
```

### 4. Summarize Content

#### POST /api/gemini/summarize

Summarize long articles or notes

**Request Body:**

```json
{
  "content": "Very long article content here...",
  "summaryType": "bullet-points",
  "maxLength": 300
}
```

**Response (200):**

```json
{
  "summary": {
    "type": "bullet-points",
    "content": "• React Hooks allow functional components to use state\n• useState manages component state\n• useEffect handles side effects\n• Custom hooks enable code reuse",
    "originalLength": 2500,
    "summaryLength": 180,
    "keyPoints": ["State management", "Side effects", "Code reuse"]
  }
}
```

---

## Error Responses

### Standard Error Format

All error responses follow this format:

```json
{
  "message": "Error description"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors, missing required fields)
- `401` - Unauthorized (invalid or missing authentication)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error
- `501` - Not Implemented (feature coming soon)

### Common Error Examples

**400 Bad Request:**

```json
{
  "message": "Email is required"
}
```

**401 Unauthorized:**

```json
{
  "message": "Invalid email/password"
}
```

**401 Authentication Required:**

```json
{
  "message": "Access token is required"
}
```

**404 Not Found:**

```json
{
  "message": "Note not found"
}
```

**500 Internal Server Error:**

```json
{
  "message": "Internal server error"
}
```

---

## Rate Limiting

- **Public endpoints**: 100 requests per minute per IP
- **Authenticated endpoints**: 1000 requests per minute per user
- **AI endpoints**: 50 requests per minute per user (due to external API costs)

---

## File Upload Support

The API includes multer middleware for file uploads with memory storage. This can be used for:

- Profile picture uploads
- Note attachments
- Document uploads

File upload endpoints will be added in future updates.

---

## Environment Variables

Required environment variables:

```env
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=your_postgresql_connection_string
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Maximum request body size: 10MB
- API supports CORS for frontend integration
- All endpoints return JSON except file downloads
- Google OAuth integration is planned for future release
- File upload endpoints will be added in future updates

---

**Version:** 1.0.0
**Last Updated:** July 22, 2025
**Contact:** Chiral Learning Development Team
