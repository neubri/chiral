# Chiral-Dev API Documentation (Updated)

## 🎯 **CORE FEATURES OVERVIEW**

Chiral-Dev is a learning platform with AI-powered explanations, featuring:

- Public article browsing
- User authentication (email/password and Google OAuth)
- AI-powered text explanations using Gemini
- Personal notes management
- Highlights management with automatic AI explanations
- User profile and learning interests

### **Arsitektur:**

```
Client (React/Vite) ↔ API Server (Express) ↔ Database (PostgreSQL)
                             ↕
                        GeminiAI API
```

---

## **📋 API ENDPOINTS**

### **🔓 PUBLIC ENDPOINTS**

#### **1. Health Check**

```http
GET /
GET /api/health
```

**Response:**

```json
{
  "message": "Chiral server is running!",
  "timestamp": "2025-07-24T08:39:12.086Z",
  "version": "1.0.0"
}
```

#### **2. Public Articles**

```http
GET /api/articles?tag=react&per_page=20&page=1
```

**Query Parameters:**

- `tag` (optional) - Filter by tag
- `per_page` (optional, default: 20) - Number of articles per page
- `page` (optional, default: 1) - Page number

**Response:**

```json
{
  "articles": [
    {
      "type_of": "article",
      "id": 2636769,
      "title": "Thesys React SDK: Turn LLM Responses into real time User Interfaces",
      "description": "LLMs are becoming the backbone of modern dev tools and AI agents. It can already generate code. But...",
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
        "profile_image": "https://media2.dev.to/dynamic/image/width=640,height=640,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F950976%2F69363f37-b7c5-4f1e-a2fe-29b4e4e33e92.png",
        "profile_image_90": "https://media2.dev.to/dynamic/image/width=90,height=90,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F950976%2F69363f37-b7c5-4f1e-a2fe-29b4e4e33e92.png"
      }
    }
  ],
  "total": 1
}
```

#### **3. Get Article Detail**

```http
GET /api/articles/:id
```

**Response:**

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

---

### **🔐 AUTHENTICATION**

#### **4. Register**

```http
POST /api/auth/register
```

**Request:**

```json
{
  "name": "Test User API",
  "email": "testapi@example.com",
  "password": "password123",
  "learningInterests": ["React", "Node.js"] // optional
}
```

**Response:**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 12,
    "name": "Test User API",
    "email": "testapi@example.com",
    "learningInterests": ["React", "Node.js"],
    "updatedAt": "2025-07-22T08:48:33.178Z",
    "createdAt": "2025-07-22T08:48:33.178Z",
    "googleId": null,
    "profilePicture": null
  }
}
```

#### **5. Login**

```http
POST /api/auth/login
```

**Request:**

```json
{
  "email": "testapi@example.com",
  "password": "password123"
}
```

**Response:**

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

#### **6. Google Login**

```http
POST /api/google-login
```

**Request:**

```json
{
  "googleToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjdkYzBkM..."
}
```

**Response:**

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
    "createdAt": "2025-07-23T03:50:00.000Z",
    "updatedAt": "2025-07-23T03:50:00.000Z"
  }
}
```

**Error Responses:**

```json
// Invalid Google token
{
  "name": "Bad Request",
  "message": "Invalid Google token"
}

// Missing Google token
{
  "name": "Bad Request",
  "message": "Google token is required"
}
```

---

### **👤 USER PROFILE**

**Response:**

```json
{
  "user": {
    "id": 12,
    "name": "Test User API",
    "email": "testapi@example.com",
    "googleId": null,
    "learningInterests": ["React", "Node.js"],
    "profilePicture": null,
    "createdAt": "2025-07-22T08:48:33.178Z",
    "updatedAt": "2025-07-22T08:48:33.178Z"
  }
}
```

#### **7. Update Learning Interests**

```http
PUT /api/auth/interests
Authorization: Bearer <token>
```

**Request:**

```json
{
  "learningInterests": ["Vue.js", "TypeScript", "GraphQL"]
}
```

**Response:**

```json
{
  "message": "Learning interests updated successfully",
  "learningInterests": ["Vue.js", "TypeScript", "GraphQL"]
}
```

---

### **🤖 AI EXPLAIN (CORE FEATURE)**

#### **8. Explain Text with AI**

```http
POST /api/gemini/explain
Authorization: Bearer <token>
```

**Request:**

```json
{
  "highlightedText": "async/await",
  "context": "JavaScript programming" // optional
}
```

**Response:**

```json
{
  "highlightedText": "async/await",
  "explanation": "\"Async/await\" adalah fitur di JavaScript untuk menjalankan tugas yang butuh waktu lama (misalnya, mengambil data dari internet) tanpa membuat seluruh program jadi \"macet\" atau berhenti merespons. Singkatnya, `async` menandai fungsi yang akan melakukan pekerjaan \"tunda\", dan `await` membuat program *menunggu* pekerjaan tunda itu selesai sebelum melanjutkan ke perintah berikutnya, namun tetap membiarkan bagian lain dari program berfungsi normal.",
  "context": "JavaScript programming"
}
```

---

### **📝 NOTES MANAGEMENT (CORE FEATURE)**

#### **9. Create Note**

```http
POST /api/notes
Authorization: Bearer <token>
```

**Request:**

```json
{
  "highlightedText": "async/await",
  "explanation": "JavaScript feature for handling asynchronous operations",
  "originalContext": "JavaScript programming tutorial" // optional
}
```

**Response:**

```json
{
  "message": "Note created successfully",
  "note": {
    "id": 2,
    "userId": 2,
    "highlightedText": "async/await",
    "explanation": "JavaScript feature for handling asynchronous operations",
    "originalContext": "JavaScript programming tutorial",
    "createdAt": "2025-07-22T09:40:14.606Z",
    "updatedAt": "2025-07-22T09:40:14.606Z"
  }
}
```

#### **10. Get Notes**

```http
GET /api/notes?page=1&limit=20
Authorization: Bearer <token>
```

**Response:**

```json
{
  "notes": [
    {
      "id": 2,
      "userId": 2,
      "highlightedText": "async/await",
      "explanation": "JavaScript feature for handling asynchronous operations",
      "originalContext": "JavaScript programming tutorial",
      "createdAt": "2025-07-22T09:40:14.606Z",
      "updatedAt": "2025-07-22T09:40:14.606Z"
    }
  ],
  "total": 1,
  "currentPage": 1,
  "totalPages": 1
}
```

**Response:**

```json
{
  "note": {
    "id": 2,
    "userId": 2,
    "highlightedText": "async/await",
    "explanation": "JavaScript feature for handling asynchronous operations",
    "originalContext": "JavaScript programming tutorial",
    "createdAt": "2025-07-22T09:40:14.606Z",
    "updatedAt": "2025-07-22T09:40:14.606Z"
  }
}
```

#### **11. Update Note**

```http
PUT /api/notes/:id
Authorization: Bearer <token>
```

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
