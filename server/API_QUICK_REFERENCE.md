# Chiral-Dev API Quick Reference

## Base URL: `http://localhost:3000`

## 🔓 Public Endpoints

```
GET /                           - Health check
GET /api/health                 - Health check
GET /api/articles               - Public articles from dev.to
```

## 🔐 Authentication

```
POST /api/auth/register         - Register new user
POST /api/auth/login            - Login user
GET  /api/auth/profile          - Get user profile (protected)
PUT  /api/auth/interests        - Update learning interests (protected)
```

## 🤖 AI Features (Protected)

```
POST /api/gemini/explain        - AI text explanation
```

## 📝 Notes Management (Protected)

```
POST   /api/notes               - Create note
GET    /api/notes               - Get all user notes (paginated)
GET    /api/notes/:id           - Get note by ID
PUT    /api/notes/:id           - Update note
DELETE /api/notes/:id           - Delete note
```

## 🔑 Authentication Header

```
Authorization: Bearer <JWT_TOKEN>
```

## 📋 Quick Examples

### Register & Login

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"123456"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"123456"}'
```

### AI Explain & Create Note

```bash
# Set token from login response
TOKEN="your-jwt-token-here"

# AI Explain
curl -X POST http://localhost:3000/api/gemini/explain \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"highlightedText":"recursion","context":"programming"}'

# Create Note
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"highlightedText":"recursion","explanation":"Function calls itself"}'
```

### Get Data

```bash
# Get articles
curl "http://localhost:3000/api/articles?tag=javascript&per_page=5"

# Get notes
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/notes?page=1&limit=10"

# Get profile
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/auth/profile
```

## 🚨 Common Errors

- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## 🎯 Core Workflow

1. Register/Login → Get JWT token
2. Browse articles → Find content to learn
3. Highlight text → Use AI explain
4. Save explanation → Create note
5. Manage notes → CRUD operations

---

**Ready for frontend integration with React/Vite + Redux!**
