# Chiral-Dev API Documentation

## 🎯 **CORE FEATURES OVERVIEW**

Chiral-Dev is a learning platform with AI-powered explanations, featuring:

- Public article browsing from Dev.to API
- User authentication (email/password and Google OAuth)
- AI-powered text explanations using Gemini
- Personal notes management (traditional and highlight notes)
- Highlights management with automatic AI explanations
- User profile and learning interests management

### **Architecture:**

```
Client (React/Vite) ↔ API Server (Express) ↔ Database (PostgreSQL)
                             ↕
                        Gemini AI API
```

---

## **📋 API ENDPOINTS**

### **🔓 PUBLIC ENDPOINTS**

#### **1. Health Check**

**Endpoint:** `GET /` or `GET /api/health`

**Headers:** None required

**Parameters:** None

**Request Body:** None

**Success Response:**

- **Status:** `200 OK`
- **Content:**

```json
{
  "message": "Chiral server is running!",
  "timestamp": "2025-01-24T08:39:12.086Z",
  "version": "1.0.0"
}
```

**Error Responses:**

- **Status:** `500 Internal Server Error`
- **Content:**

```json
{
  "message": "Internal server error"
}
```

---

#### **2. Get Public Articles**

**Endpoint:** `GET /api/articles`

**Headers:** None required

**Query Parameters:**

- `tag` (string, optional) - Filter by tag (e.g., "react", "javascript")
- `per_page` (integer, optional, default: 20) - Number of articles per page
- `page` (integer, optional, default: 1) - Page number

**Request Body:** None

**Success Response:**

- **Status:** `200 OK`
- **Content:**

```json
{
  "articles": [
    {
      "type_of": "article",
      "id": 2636769,
      "title": "Thesys React SDK: Turn LLM Responses into real time User Interfaces",
      "description": "LLMs are becoming the backbone of modern dev tools and AI agents...",
      "readable_publish_date": "Jul 17",
      "slug": "thesys-react-sdk-turn-llm-responses-into-real-time-user-interfaces-30d5",
      "url": "https://dev.to/anmolbaranwal/thesys-react-sdk-turn-llm-responses-into-real-time-user-interfaces-30d5",
      "comments_count": 9,
      "public_reactions_count": 140,
      "reading_time_minutes": 14,
      "tag_list": ["react", "ai", "programming", "javascript"],
      "user": {
        "name": "Anmol Baranwal",
        "username": "anmolbaranwal",
        "profile_image": "https://media2.dev.to/dynamic/image/...",
        "profile_image_90": "https://media2.dev.to/dynamic/image/..."
      }
    }
  ],
  "total": 1
}
```

**Error Responses:**

- **Status:** `500 Internal Server Error`
- **Content:**

```json
{
  "message": "Internal server error"
}
```

- **Status:** `503 Service Unavailable`
- **Content:**

```json
{
  "message": "External API service unavailable"
}
```

---

#### **3. Get Article Detail**

**Endpoint:** `GET /api/articles/:id`

**Headers:** None required

**URL Parameters:**

- `id` (integer, required) - Article ID

**Request Body:** None

**Success Response:**

- **Status:** `200 OK`
- **Content:**

```json
{
  "article": {
    "id": 2636769,
    "title": "Article Title",
    "description": "Article description...",
    "url": "https://dev.to/...",
    "cover_image": "https://...",
    "social_image": "https://...",
    "body_markdown": "# Article content...",
    "readable_publish_date": "Jul 17",
    "reading_time_minutes": 14,
    "tag_list": ["react", "javascript"],
    "user": {
      "name": "Author Name",
      "username": "authorusername",
      "profile_image": "https://...",
      "profile_image_90": "https://..."
    }
  }
}
```

**Error Responses:**

- **Status:** `404 Not Found`
- **Content:**

```json
{
  "message": "Article not found"
}
```

- **Status:** `500 Internal Server Error`
- **Content:**

```json
{
  "message": "Internal server error"
}
```

---

### **🔐 AUTHENTICATION ENDPOINTS**

#### **4. User Registration**

**Endpoint:** `POST /api/auth/register`

**Headers:**

- `Content-Type: application/json`

**Parameters:** None

**Request Body:**

```json
{
  "name": "Test User API",
  "email": "testapi@example.com",
  "password": "password123",
  "learningInterests": ["React", "Node.js"]
}
```

**Request Body Fields:**

- `name` (string, required) - User's full name
- `email` (string, required) - User's email address
- `password` (string, required) - User's password
- `learningInterests` (array, optional) - Array of learning interests

**Success Response:**

- **Status:** `201 Created`
- **Content:**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 12,
    "name": "Test User API",
    "email": "testapi@example.com",
    "learningInterests": ["React", "Node.js"],
    "googleId": null,
    "profilePicture": null,
    "createdAt": "2025-01-22T08:48:33.178Z",
    "updatedAt": "2025-01-22T08:48:33.178Z"
  }
}
```

**Error Responses:**

- **Status:** `400 Bad Request`
- **Content:**

```json
{
  "message": "Name is required"
}
```

- **Status:** `400 Bad Request`
- **Content:**

```json
{
  "message": "Email is required"
}
```

- **Status:** `400 Bad Request`
- **Content:**

```json
{
  "message": "Password is required"
}
```

- **Status:** `400 Bad Request` (Sequelize validation)
- **Content:**

```json
{
  "message": "email must be unique"
}
```

---

#### **5. User Login**

**Endpoint:** `POST /api/auth/login`

**Headers:**

- `Content-Type: application/json`

**Parameters:** None

**Request Body:**

```json
{
  "email": "testapi@example.com",
  "password": "password123"
}
```

**Request Body Fields:**

- `email` (string, required) - User's email address
- `password` (string, required) - User's password

**Success Response:**

- **Status:** `200 OK`
- **Content:**

```json
{
  "message": "Login successful",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsImlhdCI6MTc1MzE3NDE0OH0.uA5NWspUjZVUO1-OT10tHTPLNdSMdCHJOBcl5eqP3BE",
  "user": {
    "id": 12,
    "name": "Test User API",
    "email": "testapi@example.com",
    "googleId": null,
    "learningInterests": ["React", "Node.js"],
    "profilePicture": null
  }
}
```

**Error Responses:**

- **Status:** `400 Bad Request`
- **Content:**

```json
{
  "message": "Email is required"
}
```

- **Status:** `400 Bad Request`
- **Content:**

```json
{
  "message": "Password is required"
}
```

- **Status:** `401 Unauthorized`
- **Content:**

```json
{
  "message": "Invalid email/password"
}
```

---

#### **6. Google OAuth Login**

**Endpoint:** `POST /api/google-login`

**Headers:**

- `Content-Type: application/json`

**Parameters:** None

**Request Body:**

```json
{
  "googleToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjdkYzBkM..."
}
```

**Request Body Fields:**

- `googleToken` (string, required) - Google ID token from client-side authentication

**Success Response:**

- **Status:** `200 OK`
- **Content:**

```json
{
  "message": "Google login successful",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 13,
    "name": "John Doe",
    "email": "john.doe@gmail.com",
    "googleId": "108472731234567890123",
    "learningInterests": [],
    "profilePicture": "https://lh3.googleusercontent.com/...",
    "createdAt": "2025-01-23T03:50:00.000Z",
    "updatedAt": "2025-01-23T03:50:00.000Z"
  }
}
```

**Error Responses:**

- **Status:** `400 Bad Request`
- **Content:**

```json
{
  "message": "Google token is required"
}
```

- **Status:** `400 Bad Request`
- **Content:**

```json
{
  "message": "Invalid Google token"
}
```

---

### **👤 USER PROFILE ENDPOINTS**

#### **7. Get User Profile**

**Endpoint:** `GET /api/auth/profile`

**Headers:**

- `Authorization: Bearer <access_token>`

**Parameters:** None

**Request Body:** None

**Success Response:**

- **Status:** `200 OK`
- **Content:**

```json
{
  "user": {
    "id": 12,
    "name": "Test User API",
    "email": "testapi@example.com",
    "googleId": null,
    "learningInterests": ["React", "Node.js"],
    "profilePicture": null,
    "createdAt": "2025-01-22T08:48:33.178Z",
    "updatedAt": "2025-01-22T08:48:33.178Z"
  }
}
```

**Error Responses:**

- **Status:** `401 Unauthorized`
- **Content:**

```json
{
  "message": "Access token required"
}
```

- **Status:** `401 Unauthorized`
- **Content:**

```json
{
  "message": "Invalid token"
}
```

- **Status:** `404 Not Found`
- **Content:**

```json
{
  "message": "User not found"
}
```

---

#### **8. Update Learning Interests**

**Endpoint:** `PUT /api/auth/interests`

**Headers:**

- `Authorization: Bearer <access_token>`
- `Content-Type: application/json`

**Parameters:** None

**Request Body:**

```json
{
  "learningInterests": ["Vue.js", "TypeScript", "GraphQL"]
}
```

**Request Body Fields:**

- `learningInterests` (array, required) - Array of learning interests

**Success Response:**

- **Status:** `200 OK`
- **Content:**

```json
{
  "message": "Learning interests updated successfully",
  "learningInterests": ["Vue.js", "TypeScript", "GraphQL"]
}
```

**Error Responses:**

- **Status:** `401 Unauthorized`
- **Content:**

```json
{
  "message": "Access token required"
}
```

- **Status:** `404 Not Found`
- **Content:**

```json
{
  "message": "User not found"
}
```

---

### **📚 PERSONALIZED ARTICLES ENDPOINTS**

#### **9. Get Articles by User Interests**

**Endpoint:** `GET /api/my-articles`

**Headers:**

- `Authorization: Bearer <access_token>`

**Query Parameters:**

- `per_page` (integer, optional, default: 20) - Number of articles per page
- `page` (integer, optional, default: 1) - Page number

**Request Body:** None

**Success Response:**

- **Status:** `200 OK`
- **Content:**

```json
{
  "articles": [
    {
      "type_of": "article",
      "id": 2636769,
      "title": "React Best Practices",
      "description": "Learn the best practices for React development...",
      "readable_publish_date": "Jul 17",
      "url": "https://dev.to/...",
      "tag_list": ["react", "javascript"],
      "user": {
        "name": "Author Name",
        "username": "authorusername"
      }
    }
  ],
  "total": 15
}
```

**Error Responses:**

- **Status:** `401 Unauthorized`
- **Content:**

```json
{
  "message": "Access token required"
}
```

---

### **🤖 AI EXPLANATION ENDPOINTS**

#### **10. Explain Text with AI**

**Endpoint:** `POST /api/gemini/explain`

**Headers:**

- `Authorization: Bearer <access_token>`
- `Content-Type: application/json`

**Parameters:** None

**Request Body:**

```json
{
  "highlightedText": "async/await",
  "context": "JavaScript programming"
}
```

**Request Body Fields:**

- `highlightedText` (string, required) - Text to be explained (max 5000 characters)
- `context` (string, optional) - Additional context for explanation (max 10000 characters)

**Success Response:**

- **Status:** `200 OK`
- **Content:**

```json
{
  "highlightedText": "async/await",
  "explanation": "async/await is a modern JavaScript syntax that provides a cleaner way to handle asynchronous operations. The 'async' keyword is used to declare an asynchronous function, while 'await' is used to pause the execution of the function until a Promise is resolved...",
  "context": "JavaScript programming"
}
```

**Error Responses:**

- **Status:** `400 Bad Request`
- **Content:**

```json
{
  "message": "Highlighted text is required"
}
```

- **Status:** `400 Bad Request`
- **Content:**

```json
{
  "message": "Highlighted text is too long (max 5000 characters)"
}
```

- **Status:** `400 Bad Request`
- **Content:**

```json
{
  "message": "Context is too long (max 10000 characters)"
}
```

- **Status:** `503 Service Unavailable`
- **Content:**

```json
{
  "message": "AI service temporarily unavailable"
}
```

---

### **📝 NOTES MANAGEMENT ENDPOINTS**

#### **11. Create Note**

**Endpoint:** `POST /api/notes`

**Headers:**

- `Authorization: Bearer <access_token>`
- `Content-Type: application/json`

**Parameters:** None

**Request Body (Traditional Note):**

```json
{
  "noteType": "traditional",
  "title": "React Hooks Notes",
  "content": "useState is a hook that allows you to add state to functional components...",
  "isFavorite": false
}
```

**Request Body (Highlight Note):**

```json
{
  "noteType": "highlight",
  "highlightedText": "useState hook",
  "explanation": "useState is a React hook that lets you add state to functional components",
  "originalContext": "React documentation"
}
```

**Request Body Fields:**

- `noteType` (string, optional, default: "traditional") - Type of note: "traditional" or "highlight"
- For traditional notes:
  - `title` (string, required) - Note title
  - `content` (string, required) - Note content
  - `isFavorite` (boolean, optional, default: false) - Whether note is favorited
- For highlight notes:
  - `highlightedText` (string, required) - The highlighted text
  - `explanation` (string, optional) - AI explanation of the text
  - `originalContext` (string, optional) - Original context where text was highlighted

**Success Response:**

- **Status:** `201 Created`
- **Content:**

```json
{
  "message": "Note created successfully",
  "note": {
    "id": 15,
    "userId": 12,
    "noteType": "traditional",
    "title": "React Hooks Notes",
    "content": "useState is a hook that allows you to add state to functional components...",
    "isFavorite": false,
    "highlightedText": null,
    "explanation": null,
    "originalContext": null,
    "createdAt": "2025-01-24T10:30:00.000Z",
    "updatedAt": "2025-01-24T10:30:00.000Z"
  }
}
```

**Error Responses:**

- **Status:** `400 Bad Request`
- **Content:**

```json
{
  "message": "Title is required for traditional notes"
}
```

- **Status:** `400 Bad Request`
- **Content:**

```json
{
  "message": "Content is required for traditional notes"
}
```

- **Status:** `400 Bad Request`
- **Content:**

```json
{
  "message": "Highlighted text is required for highlight notes"
}
```

---

#### **12. Get All Notes**

**Endpoint:** `GET /api/notes`

**Headers:**

- `Authorization: Bearer <access_token>`

**Query Parameters:**

- `search` (string, optional) - Search term to filter notes
- `noteType` (string, optional) - Filter by note type: "traditional" or "highlight"
- `isFavorite` (boolean, optional) - Filter by favorite status
- `page` (integer, optional, default: 1) - Page number
- `limit` (integer, optional, default: 10) - Number of notes per page

**Request Body:** None

**Success Response:**

- **Status:** `200 OK`
- **Content:**

```json
{
  "notes": [
    {
      "id": 15,
      "userId": 12,
      "noteType": "traditional",
      "title": "React Hooks Notes",
      "content": "useState is a hook that allows you to add state to functional components...",
      "isFavorite": false,
      "highlightedText": null,
      "explanation": null,
      "originalContext": null,
      "createdAt": "2025-01-24T10:30:00.000Z",
      "updatedAt": "2025-01-24T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalNotes": 25,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Error Responses:**

- **Status:** `401 Unauthorized`
- **Content:**

```json
{
  "message": "Access token required"
}
```

---

#### **13. Get Note by ID**

**Endpoint:** `GET /api/notes/:id`

**Headers:**

- `Authorization: Bearer <access_token>`

**URL Parameters:**

- `id` (integer, required) - Note ID

**Request Body:** None

**Success Response:**

- **Status:** `200 OK`
- **Content:**

```json
{
  "note": {
    "id": 15,
    "userId": 12,
    "noteType": "traditional",
    "title": "React Hooks Notes",
    "content": "useState is a hook that allows you to add state to functional components...",
    "isFavorite": false,
    "highlightedText": null,
    "explanation": null,
    "originalContext": null,
    "createdAt": "2025-01-24T10:30:00.000Z",
    "updatedAt": "2025-01-24T10:30:00.000Z"
  }
}
```

**Error Responses:**

- **Status:** `404 Not Found`
- **Content:**

```json
{
  "message": "Note not found"
}
```

- **Status:** `403 Forbidden`
- **Content:**

```json
{
  "message": "Access denied. This note doesn't belong to you."
}
```

---

#### **14. Update Note**

**Endpoint:** `PUT /api/notes/:id`

**Headers:**

- `Authorization: Bearer <access_token>`
- `Content-Type: application/json`

**URL Parameters:**

- `id` (integer, required) - Note ID

**Request Body:**

```json
{
  "title": "Updated React Hooks Notes",
  "content": "Updated content about React hooks...",
  "isFavorite": true
}
```

**Success Response:**

- **Status:** `200 OK`
- **Content:**

```json
{
  "message": "Note updated successfully",
  "note": {
    "id": 15,
    "userId": 12,
    "noteType": "traditional",
    "title": "Updated React Hooks Notes",
    "content": "Updated content about React hooks...",
    "isFavorite": true,
    "highlightedText": null,
    "explanation": null,
    "originalContext": null,
    "createdAt": "2025-01-24T10:30:00.000Z",
    "updatedAt": "2025-01-24T11:45:00.000Z"
  }
}
```

**Error Responses:**

- **Status:** `404 Not Found`
- **Content:**

```json
{
  "message": "Note not found"
}
```

- **Status:** `403 Forbidden`
- **Content:**

```json
{
  "message": "Access denied. This note doesn't belong to you."
}
```

---

#### **15. Delete Note**

**Endpoint:** `DELETE /api/notes/:id`

**Headers:**

- `Authorization: Bearer <access_token>`

**URL Parameters:**

- `id` (integer, required) - Note ID

**Request Body:** None

**Success Response:**

- **Status:** `200 OK`
- **Content:**

```json
{
  "message": "Note deleted successfully"
}
```

**Error Responses:**

- **Status:** `404 Not Found`
- **Content:**

```json
{
  "message": "Note not found"
}
```

- **Status:** `403 Forbidden`
- **Content:**

```json
{
  "message": "Access denied. This note doesn't belong to you."
}
```

---

### **🎯 HIGHLIGHTS MANAGEMENT ENDPOINTS**

#### **16. Create Highlight**

**Endpoint:** `POST /api/highlights`

**Headers:**

- `Authorization: Bearer <access_token>`
- `Content-Type: application/json`

**Parameters:** None

**Request Body:**

```json
{
  "articleId": "2636769",
  "articleTitle": "React Best Practices",
  "articleUrl": "https://dev.to/article-url",
  "highlightedText": "React hooks are functions",
  "context": "React hooks are functions that let you use state and other React features in functional components",
  "position": {
    "start": 150,
    "end": 175
  },
  "tags": ["react", "hooks"],
  "autoExplain": true
}
```

**Request Body Fields:**

- `articleId` (string, required) - ID of the article
- `articleTitle` (string, optional) - Title of the article
- `articleUrl` (string, optional) - URL of the article
- `highlightedText` (string, required) - The highlighted text (max 5000 characters)
- `context` (string, optional) - Surrounding context
- `position` (object, optional) - Position information with start and end
- `tags` (array, optional) - Array of tags
- `autoExplain` (boolean, optional, default: true) - Whether to auto-generate AI explanation

**Success Response:**

- **Status:** `201 Created`
- **Content:**

```json
{
  "message": "Highlight created successfully",
  "highlight": {
    "id": 25,
    "userId": 12,
    "articleId": "2636769",
    "articleTitle": "React Best Practices",
    "articleUrl": "https://dev.to/article-url",
    "highlightedText": "React hooks are functions",
    "explanation": "React hooks are special functions that allow you to 'hook into' React features like state and lifecycle methods from functional components...",
    "context": "React hooks are functions that let you use state and other React features in functional components",
    "position": {
      "start": 150,
      "end": 175
    },
    "tags": ["react", "hooks"],
    "isBookmarked": false,
    "createdAt": "2025-01-24T12:15:00.000Z",
    "updatedAt": "2025-01-24T12:15:00.000Z"
  }
}
```

**Error Responses:**

- **Status:** `400 Bad Request`
- **Content:**

```json
{
  "message": "Article ID is required"
}
```

- **Status:** `400 Bad Request`
- **Content:**

```json
{
  "message": "Highlighted text is required"
}
```

- **Status:** `400 Bad Request`
- **Content:**

```json
{
  "message": "Highlighted text is too long (max 5000 characters)"
}
```

---

#### **17. Get All Highlights**

**Endpoint:** `GET /api/highlights`

**Headers:**

- `Authorization: Bearer <access_token>`

**Query Parameters:**

- `search` (string, optional) - Search term to filter highlights
- `articleId` (string, optional) - Filter by article ID
- `tags` (string, optional) - Filter by tags (comma-separated)
- `isBookmarked` (boolean, optional) - Filter by bookmark status
- `page` (integer, optional, default: 1) - Page number
- `limit` (integer, optional, default: 10) - Number of highlights per page

**Request Body:** None

**Success Response:**

- **Status:** `200 OK`
- **Content:**

```json
{
  "highlights": [
    {
      "id": 25,
      "userId": 12,
      "articleId": "2636769",
      "articleTitle": "React Best Practices",
      "articleUrl": "https://dev.to/article-url",
      "highlightedText": "React hooks are functions",
      "explanation": "React hooks are special functions that allow you to 'hook into' React features...",
      "context": "React hooks are functions that let you use state and other React features...",
      "position": {
        "start": 150,
        "end": 175
      },
      "tags": ["react", "hooks"],
      "isBookmarked": false,
      "createdAt": "2025-01-24T12:15:00.000Z",
      "updatedAt": "2025-01-24T12:15:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalHighlights": 15,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Error Responses:**

- **Status:** `401 Unauthorized`
- **Content:**

```json
{
  "message": "Access token required"
}
```

---

#### **18. Get Highlight by ID**

**Endpoint:** `GET /api/highlights/:id`

**Headers:**

- `Authorization: Bearer <access_token>`

**URL Parameters:**

- `id` (integer, required) - Highlight ID

**Request Body:** None

**Success Response:**

- **Status:** `200 OK`
- **Content:**

```json
{
  "highlight": {
    "id": 25,
    "userId": 12,
    "articleId": "2636769",
    "articleTitle": "React Best Practices",
    "articleUrl": "https://dev.to/article-url",
    "highlightedText": "React hooks are functions",
    "explanation": "React hooks are special functions that allow you to 'hook into' React features...",
    "context": "React hooks are functions that let you use state and other React features...",
    "position": {
      "start": 150,
      "end": 175
    },
    "tags": ["react", "hooks"],
    "isBookmarked": false,
    "createdAt": "2025-01-24T12:15:00.000Z",
    "updatedAt": "2025-01-24T12:15:00.000Z"
  }
}
```

**Error Responses:**

- **Status:** `404 Not Found`
- **Content:**

```json
{
  "message": "Highlight not found"
}
```

- **Status:** `403 Forbidden`
- **Content:**

```json
{
  "message": "Access denied. This highlight doesn't belong to you."
}
```

---

#### **19. Update Highlight**

**Endpoint:** `PUT /api/highlights/:id`

**Headers:**

- `Authorization: Bearer <access_token>`
- `Content-Type: application/json`

**URL Parameters:**

- `id` (integer, required) - Highlight ID

**Request Body:**

```json
{
  "highlightedText": "Updated highlighted text",
  "tags": ["react", "hooks", "updated"],
  "isBookmarked": true
}
```

**Success Response:**

- **Status:** `200 OK`
- **Content:**

```json
{
  "message": "Highlight updated successfully",
  "highlight": {
    "id": 25,
    "userId": 12,
    "articleId": "2636769",
    "articleTitle": "React Best Practices",
    "articleUrl": "https://dev.to/article-url",
    "highlightedText": "Updated highlighted text",
    "explanation": "React hooks are special functions that allow you to 'hook into' React features...",
    "context": "React hooks are functions that let you use state and other React features...",
    "position": {
      "start": 150,
      "end": 175
    },
    "tags": ["react", "hooks", "updated"],
    "isBookmarked": true,
    "createdAt": "2025-01-24T12:15:00.000Z",
    "updatedAt": "2025-01-24T13:30:00.000Z"
  }
}
```

**Error Responses:**

- **Status:** `404 Not Found`
- **Content:**

```json
{
  "message": "Highlight not found"
}
```

- **Status:** `403 Forbidden`
- **Content:**

```json
{
  "message": "Access denied. This highlight doesn't belong to you."
}
```

---

#### **20. Delete Highlight**

**Endpoint:** `DELETE /api/highlights/:id`

**Headers:**

- `Authorization: Bearer <access_token>`

**URL Parameters:**

- `id` (integer, required) - Highlight ID

**Request Body:** None

**Success Response:**

- **Status:** `200 OK`
- **Content:**

```json
{
  "message": "Highlight deleted successfully"
}
```

**Error Responses:**

- **Status:** `404 Not Found`
- **Content:**

```json
{
  "message": "Highlight not found"
}
```

- **Status:** `403 Forbidden`
- **Content:**

```json
{
  "message": "Access denied. This highlight doesn't belong to you."
}
```

---

#### **21. Explain Highlight**

**Endpoint:** `POST /api/highlights/:id/explain`

**Headers:**

- `Authorization: Bearer <access_token>`
- `Content-Type: application/json`

**URL Parameters:**

- `id` (integer, required) - Highlight ID

**Request Body:**

```json
{
  "regenerate": true
}
```

**Request Body Fields:**

- `regenerate` (boolean, optional, default: false) - Whether to regenerate explanation even if one exists

**Success Response:**

- **Status:** `200 OK`
- **Content:**

```json
{
  "message": "Highlight explanation generated successfully",
  "highlight": {
    "id": 25,
    "highlightedText": "React hooks are functions",
    "explanation": "React hooks are special functions that allow you to 'hook into' React features like state and lifecycle methods from functional components. They were introduced in React 16.8 to allow functional components to have the same capabilities as class components...",
    "context": "React hooks are functions that let you use state and other React features...",
    "updatedAt": "2025-01-24T14:00:00.000Z"
  }
}
```

**Error Responses:**

- **Status:** `404 Not Found`
- **Content:**

```json
{
  "message": "Highlight not found"
}
```

- **Status:** `403 Forbidden`
- **Content:**

```json
{
  "message": "Access denied. This highlight doesn't belong to you."
}
```

- **Status:** `503 Service Unavailable`
- **Content:**

```json
{
  "message": "AI service temporarily unavailable"
}
```

---

#### **22. Get Article Highlights**

**Endpoint:** `GET /api/articles/:articleId/highlights`

**Headers:**

- `Authorization: Bearer <access_token>`

**URL Parameters:**

- `articleId` (string, required) - Article ID

**Query Parameters:**

- `page` (integer, optional, default: 1) - Page number
- `limit` (integer, optional, default: 10) - Number of highlights per page

**Request Body:** None

**Success Response:**

- **Status:** `200 OK`
- **Content:**

```json
{
  "highlights": [
    {
      "id": 25,
      "userId": 12,
      "articleId": "2636769",
      "articleTitle": "React Best Practices",
      "articleUrl": "https://dev.to/article-url",
      "highlightedText": "React hooks are functions",
      "explanation": "React hooks are special functions...",
      "context": "React hooks are functions that let you use state...",
      "position": {
        "start": 150,
        "end": 175
      },
      "tags": ["react", "hooks"],
      "isBookmarked": false,
      "createdAt": "2025-01-24T12:15:00.000Z",
      "updatedAt": "2025-01-24T12:15:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalHighlights": 3,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

**Error Responses:**

- **Status:** `401 Unauthorized`
- **Content:**

```json
{
  "message": "Access token required"
}
```

---

## **🔒 AUTHENTICATION & AUTHORIZATION**

### **Authentication Methods**

1. **JWT Bearer Token**: Used for all protected endpoints

   - Header format: `Authorization: Bearer <access_token>`
   - Token expires based on server configuration
   - Obtained through login or Google OAuth

2. **Google OAuth**: Alternative authentication method
   - Requires Google ID token from client-side authentication
   - Automatically creates user account if not exists

### **Authorization Levels**

- **Public**: No authentication required (health check, public articles)
- **Authenticated**: Valid JWT token required (all other endpoints)
- **Owner**: Resource must belong to authenticated user (notes, highlights)

---

## **📊 ERROR HANDLING**

### **Common HTTP Status Codes**

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data or missing required fields
- `401 Unauthorized` - Authentication required or invalid credentials
- `403 Forbidden` - Insufficient permissions to access resource
- `404 Not Found` - Resource not found
- `413 Payload Too Large` - Request payload exceeds size limit
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - External service (AI, database) unavailable

### **Error Response Format**

All errors follow a consistent format:

```json
{
  "message": "Descriptive error message"
}
```

### **Input Validation**

- **Text length limits**: highlightedText (5000 chars), context (10000 chars)
- **Required fields**: Validated and return specific error messages
- **Data sanitization**: Input is trimmed and validated for security
- **Type validation**: Ensures correct data types for all fields

---

## **🚀 RATE LIMITING & PERFORMANCE**

### **Request Limits**

- **Payload size**: Maximum 10MB for request body
- **Text processing**: Character limits for AI explanations
- **Pagination**: Default page size 10-20 items, configurable per endpoint

### **Caching**

- Public articles are cached to improve performance
- User-specific data is not cached for security

---

## **🔧 DEVELOPMENT & TESTING**

### **Base URL**

- Development: `http://localhost:3000`
- Production: `https://your-production-domain.com`

### **Content Types**

- Request: `application/json`
- Response: `application/json`

### **Sample Authentication Flow**

1. Register user: `POST /api/auth/register`
2. Login: `POST /api/auth/login`
3. Get access token from response
4. Use token in Authorization header for protected endpoints
5. Token format: `Authorization: Bearer <access_token>`

---

**Last Updated:** January 24, 2025
**API Version:** 1.0.0
**Documentation Version:** 2.0.0
"userId": 2,
"highlightedText": "async/await",
"explanation": "JavaScript feature for handling asynchronous operations",
"originalContext": "JavaScript programming tutorial",
"createdAt": "2025-07-22T09:40:14.606Z",
"updatedAt": "2025-07-22T09:40:14.606Z"
}
}

````

#### **11. Update Note**

```http
PUT /api/notes/:id
Authorization: Bearer <token>
````

**Request:**

```json
{
  "highlightedText": "updated async/await",
  "explanation": "Updated explanation for async/await in JavaScript",
  "originalContext": "updated JavaScript tutorial context"
}
```

**Response:**

```json
{
  "message": "Note updated successfully",
  "note": {
    "id": 2,
    "userId": 2,
    "highlightedText": "updated async/await",
    "explanation": "Updated explanation for async/await in JavaScript",
    "originalContext": "updated JavaScript tutorial context",
    "createdAt": "2025-07-22T09:40:14.606Z",
    "updatedAt": "2025-07-22T09:40:29.601Z"
  }
}
```

**Response:**

```json
{
  "message": "Note deleted successfully"
}
```

---

### **🔖 HIGHLIGHTS MANAGEMENT**

#### **13. Create Highlight**

```http
POST /api/highlights
Authorization: Bearer <token>
```

**Request:**

```json
{
  "articleId": "2636769",
  "articleTitle": "Article Title", // optional
  "articleUrl": "https://dev.to/...", // optional
  "highlightedText": "This is the highlighted text from the article",
  "context": "surrounding context", // optional
  "position": { "start": 100, "end": 200 }, // optional
  "tags": ["important", "react"], // optional
  "autoExplain": true // optional, default: true
}
```

**Response:**

```json
{
  "message": "Highlight created successfully",
  "highlight": {
    "id": 1,
    "userId": 2,
    "articleId": "2636769",
    "articleTitle": "Article Title",
    "articleUrl": "https://dev.to/...",
    "highlightedText": "This is the highlighted text from the article",
    "explanation": "AI-generated explanation of the highlighted text",
    "context": "surrounding context",
    "position": { "start": 100, "end": 200 },
    "tags": ["important", "react"],
    "isBookmarked": false,
    "createdAt": "2025-07-24T09:40:14.606Z",
    "updatedAt": "2025-07-24T09:40:14.606Z"
  }
}
```

#### **14. Get Highlights**

```http
GET /api/highlights?page=1&limit=20&articleId=123&search=async
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 20) - Items per page
- `articleId` (optional) - Filter by article ID
- `search` (optional) - Search in highlighted text and explanations
- `isBookmarked` (optional) - Filter bookmarked highlights
- `sortBy` (optional: newest|oldest|article, default: newest) - Sort order

**Response:**

```json
{
  "highlights": [
    {
      "id": 1,
      "userId": 2,
      "articleId": "2636769",
      "articleTitle": "Article Title",
      "articleUrl": "https://dev.to/...",
      "highlightedText": "This is the highlighted text",
      "explanation": "AI explanation",
      "context": "context",
      "position": { "start": 100, "end": 200 },
      "tags": ["important"],
      "isBookmarked": false,
      "createdAt": "2025-07-24T09:40:14.606Z",
      "updatedAt": "2025-07-24T09:40:14.606Z"
    }
  ],
  "total": 1,
  "currentPage": 1,
  "totalPages": 1
}
```

#### **15. Get Highlight by ID**

```http
GET /api/highlights/:id
Authorization: Bearer <token>
```

**Response:**

```json
{
  "highlight": {
    "id": 1,
    "userId": 2,
    "articleId": "2636769",
    "articleTitle": "Article Title",
    "highlightedText": "This is the highlighted text",
    "explanation": "AI explanation",
    "context": "context",
    "position": { "start": 100, "end": 200 },
    "tags": ["important"],
    "isBookmarked": false,
    "createdAt": "2025-07-24T09:40:14.606Z",
    "updatedAt": "2025-07-24T09:40:14.606Z"
  }
}
```

#### **16. Update Highlight**

```http
PUT /api/highlights/:id
Authorization: Bearer <token>
```

**Request:**

```json
{
  "highlightedText": "Updated highlighted text",
  "explanation": "Updated explanation",
  "tags": ["updated", "important"],
  "isBookmarked": true
}
```

**Response:**

```json
{
  "message": "Highlight updated successfully",
  "highlight": {
    "id": 1,
    "userId": 2,
    "articleId": "2636769",
    "highlightedText": "Updated highlighted text",
    "explanation": "Updated explanation",
    "tags": ["updated", "important"],
    "isBookmarked": true,
    "createdAt": "2025-07-24T09:40:14.606Z",
    "updatedAt": "2025-07-24T10:15:30.123Z"
  }
}
```

#### **17. Delete Highlight**

```http
DELETE /api/highlights/:id
Authorization: Bearer <token>
```

**Response:**

```json
{
  "message": "Highlight deleted successfully"
}
```

#### **18. Explain Highlight**

```http
POST /api/highlights/:id/explain
Authorization: Bearer <token>
```

**Request:**

```json
{
  "context": "additional context for better explanation" // optional
}
```

**Response:**

```json
{
  "message": "Explanation generated successfully",
  "explanation": "AI-generated explanation of the highlighted text",
  "highlight": {
    "id": 1,
    "highlightedText": "The highlighted text",
    "explanation": "AI-generated explanation of the highlighted text",
    "updatedAt": "2025-07-24T10:20:45.789Z"
  }
}
```

#### **19. Get Article Highlights**

```http
GET /api/articles/:articleId/highlights
Authorization: Bearer <token>
```

**Response:**

```json
{
  "highlights": [
    {
      "id": 1,
      "userId": 2,
      "articleId": "2636769",
      "highlightedText": "This is highlighted text",
      "explanation": "AI explanation",
      "position": { "start": 100, "end": 200 },
      "tags": ["important"],
      "isBookmarked": false,
      "createdAt": "2025-07-24T09:40:14.606Z"
    }
  ],
  "total": 1
}
```

#### **20. Get User Articles by Interests**

```http
GET /api/my-articles?page=1&per_page=20
Authorization: Bearer <token>
```

**Response:**

```json
{
  "articles": [
    // Same format as public articles
  ],
  "total": 10,
  "page": 1,
  "per_page": 20
}
```

---

## **🔒 AUTHENTICATION**

Semua protected endpoints memerlukan header:

```
Authorization: Bearer <JWT_TOKEN>
```

---

## **📝 IMPORTANT NOTES**

### **Error Examples:**

```json
{
  "message": "Highlighted text is required"
}
```

```json
{
  "message": "Invalid email/password"
}
```

```json
{
  "message": "Access token required"
}
```

```json
{
  "message": "Invalid token"
}
```

```json
{
  "message": "Note not found"
}
```

---

## **❌ ERROR RESPONSES**

```json
{
  "message": "Error description"
}
```

**Status Codes:**

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found
- `500` - Internal Server Error

---

## **🎯 CORE WORKFLOW**

### **User Journey:**

1. **Register/Login** → Get JWT token
2. **Update Learning Interests** → Set preferences
3. **Browse Public Articles** → Find interesting content
4. **Highlight Text** → Select confusing terms
5. **AI Explain** → Get simplified explanation
6. **Save as Note** → Store for future reference
7. **Manage Notes** → View, edit, delete notes

### **Technical Flow:**

```
User highlights text → AI explains → Save as note → Manage notes
```

### **Frontend Integration Example:**

```javascript
// Complete workflow example for frontend integration
class ChiralAPI {
  constructor(baseURL = "http://localhost:3000/api") {
    this.baseURL = baseURL;
    this.token = localStorage.getItem("token");
  }

  // Authentication
  async login(email, password) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.access_token) {
      this.token = data.access_token;
      localStorage.setItem("token", this.token);
    }
    return data;
  }

  // AI Explain
  async explainText(highlightedText, context = "") {
    const response = await fetch(`${this.baseURL}/gemini/explain`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({ highlightedText, context }),
    });
    return await response.json();
  }

  // Notes Management
  async createNote(highlightedText, explanation, originalContext = "") {
    const response = await fetch(`${this.baseURL}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({ highlightedText, explanation, originalContext }),
    });
    return await response.json();
  }

  async getNotes(page = 1, limit = 20) {
    const response = await fetch(
      `${this.baseURL}/notes?page=${page}&limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${this.token}` },
      }
    );
    return await response.json();
  }
}

// Usage example
const api = new ChiralAPI();

// Complete user workflow
async function handleTextHighlight(selectedText, context) {
  try {
    // 1. Get AI explanation
    const explanation = await api.explainText(selectedText, context);

    // 2. Save as note
    const note = await api.createNote(
      selectedText,
      explanation.explanation,
      context
    );

    // 3. Refresh notes list
    const notes = await api.getNotes();

    return { explanation, note, notes };
  } catch (error) {
    console.error("Error in workflow:", error);
  }
}
```

---

## **🚀 REMOVED FEATURES (For Simplicity)**

### **Dihapus dari MVP:**

- ❌ Complex article recommendations
- ❌ Article search & filtering
- ❌ Save articles to favorites
- ❌ PDF export
- ❌ Markdown export
- ❌ Google OAuth (akan ditambah nanti)
- ❌ AI learning paths
- ❌ AI quiz generation
- ❌ AI content summarization
- ❌ Complex article management

### **Mengapa Dihapus:**

- **Focus on Core Value:** AI text explanation + note management
- **Reduce Complexity:** Easier to develop, test, and maintain
- **Faster MVP:** Get to market quicker
- **User Experience:** Less overwhelming, more focused
- **Technical Debt:** Fewer dependencies and edge cases

---

## **📦 TECHNOLOGY STACK (Simplified)**

### **Backend:**

- Express.js (API server)
- Sequelize + PostgreSQL (database)
- GeminiAI (text explanation)
- JWT (authentication)
- bcrypt (password hashing)

### **Dependencies Removed:**

- `multer` (file upload)
- `pdf-lib` (PDF generation)
- `marked` (markdown processing)
- `path-to-regexp` (complex routing)

---

## **🎯 NEXT STEPS**

1. ✅ **Core MVP Complete**
2. 🔄 **Frontend Integration** (React/Vite)
3. 🔄 **State Management** (Redux)
4. 🔄 **Testing Coverage** (90%+)
5. 🔄 **Deployment** (Production ready)

**Future Features (Phase 2):**

- Google OAuth
- PDF/Markdown export
- Advanced AI features
- Article recommendations
- Real-time collaboration

---

## **💡 KEY BENEFITS OF SIMPLIFICATION**

✅ **Faster Development** - Less code, fewer bugs
✅ **Better UX** - Focused, not overwhelming
✅ **Easier Testing** - Fewer edge cases
✅ **Maintainable** - Simple architecture
✅ **Scalable** - Core features as foundation

**The simplified Chiral-Dev focuses on what matters most: helping users understand complex text with AI and manage their learning notes efficiently.**

---

## **🔒 SECURITY & VALIDATION**

### **Input Validation:**

- Maximum text length limits (5,000 chars for highlighted text, 10,000 for explanation/context)
- Input sanitization and trimming
- Required field validation

### **Error Handling:**

- Comprehensive error types and status codes
- Development vs production error messaging
- Gemini API specific error handling (rate limits, service unavailable)

### **Security Features:**

- JWT token validation
- Password hashing with bcrypt
- Request size limits (10MB)
- Environment variable validation on startup

### **Common Error Responses:**

```json
// Validation Error
{
  "message": "Highlighted text is too long (max 5000 characters)"
}

// Authentication Error
{
  "message": "Access token required"
}

// Service Error
{
  "message": "AI service is temporarily unavailable"
}
```

---

## **📊 CHANGELOG (v1.1)**

### **🆕 Recent Improvements:**

- Enhanced input validation and length limits
- Better error handling for AI service failures
- Request size limits for security
- Environment variable validation
- Improved logging for development debugging
- Rate limit handling for Gemini API

### **🐛 Bug Fixes:**

- Fixed hardcoded API URLs to use environment variables
- Improved error messages consistency
- Enhanced input sanitization
