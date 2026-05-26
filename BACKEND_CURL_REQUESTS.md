# Backend API Curl Requests

Base URL: `http://localhost:3000/api`

**Note:** Replace `YOUR_CLERK_TOKEN` with a valid Clerk JWT token from your frontend

---

## User Endpoints

### 1. Get All Users

```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json"
```

### 2. Search Users

```bash
curl -X GET "http://localhost:3000/api/users/search?q=john" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json"
```

### 3. Upsert User (Create/Update)

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "avatar": "https://example.com/avatar.jpg"
  }'
```

---

## Chat Endpoints

### 4. Get All Chats (for current user)

```bash
curl -X GET http://localhost:3000/api/chats \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json"
```

### 5. Create Direct Chat (1-on-1)

```bash
curl -X POST http://localhost:3000/api/chats \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "participantIds": ["user_id_of_other_person"]
  }'
```

### 6. Create Group Chat

```bash
curl -X POST http://localhost:3000/api/chats \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "participantIds": ["user_id_1", "user_id_2", "user_id_3"],
    "name": "Project Discussion"
  }'
```

### 7. Get Chat by ID

```bash
curl -X GET http://localhost:3000/api/chats/CHAT_ID \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json"
```

### 8. Delete Chat

```bash
curl -X DELETE http://localhost:3000/api/chats/CHAT_ID \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Message Endpoints

### 9. Get All Messages from a Chat

```bash
curl -X GET http://localhost:3000/api/messages/CHAT_ID \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json"
```

### 10. Send a Simple Message

```bash
curl -X POST http://localhost:3000/api/messages/CHAT_ID \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello, how are you?"
  }'
```

---

## Upload Endpoints

### 11. Upload a File (up to 50MB)

```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -F "file=@/path/to/your/file.pdf"
```

**Example with an image:**

```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -F "file=@./screenshot.png"
```

**Response:**

```json
{
  "url": "https://your-r2-bucket.example.com/uuid-filename.ext",
  "name": "screenshot.png",
  "type": "image/png",
  "size": 245832
}
```

---

## Complete Workflow Example

### Step 1: Get All Users

```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

### Step 2: Create a Chat with Another User

```bash
# Assuming you got user_id from step 1
curl -X POST http://localhost:3000/api/chats \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"participantIds": ["user_id_123"]}'
```

### Step 3: Send a Message

```bash
# Assuming you got chat_id from step 2
curl -X POST http://localhost:3000/api/messages/chat_id_456 \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Hey there!"}'
```

### Step 4: Retrieve Messages

```bash
curl -X GET http://localhost:3000/api/messages/chat_id_456 \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

### Step 5: Upload a File

```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -F "file=@./document.pdf"
```

### Step 6: Send a Message with File URL

```bash
curl -X POST http://localhost:3000/api/messages/chat_id_456 \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Check this file!",
    "fileUrl": "https://your-r2-bucket.example.com/uuid-document.pdf",
    "fileName": "document.pdf",
    "fileType": "application/pdf",
    "fileSize": 123456
  }'
```

---

## Error Responses

### Missing Auth Token

```
400 Bad Request
```

### Unauthorized (Invalid Token)

```
401 Unauthorized
```

### Chat/Message Not Found

```
404 Not Found
```

### File Too Large (>50MB)

```
400 Bad Request
{
  "error": "File exceeds 50MB limit"
}
```

---

## Tips

1. **Get Clerk Token:** Open your browser dev tools → Network tab → Look for any request to your backend and copy the Authorization header token

2. **Test with Postman:** You can import these curl commands into Postman for easier testing

3. **Save to Variable:**

```bash
TOKEN="your_clerk_token_here"

curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN"
```

4. **Pretty Print JSON Response:**

```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN" | jq .
```

5. **Check Backend Logs:** Look at your terminal running the backend server to see detailed error logs

---

## Database Schema Reference

### Users Table

- `id` - Clerk user ID
- `username` - Display name
- `email` - Email address
- `avatar` - Avatar URL
- `created_at`, `updated_at` - Timestamps

### Chats Table

- `id` - Chat ID
- `name` - Group chat name (null for 1-on-1)
- `is_group` - Boolean
- `created_at` - Creation timestamp

### Chat Members Table

- `chat_id` - Reference to chat
- `user_id` - Reference to user

### Messages Table

- `id` - Message ID
- `chat_id` - Reference to chat
- `sender_id` - Reference to sender user
- `content` - Message text
- `file_url`, `file_name`, `file_type`, `file_size` - File attachments
- `created_at` - Message timestamp
