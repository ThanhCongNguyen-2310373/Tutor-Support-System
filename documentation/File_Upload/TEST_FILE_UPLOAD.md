# 🧪 Quick Test Script - File Upload

## Test với Swagger UI

### ✅ CHECKLIST

**Step 1: Start Server**
```bash
cd d:\HK251\CNPM\BTL\Sub3\TutorSupportSystem
npm run start:dev
```

**Step 2: Open Swagger**
```
http://localhost:3000/api-docs
```

**Step 3: Login**
- Endpoint: `POST /auth/login`
- Body:
  ```json
  {
    "email": "student1@hcmut.edu.vn",
    "password": "password123"
  }
  ```
- Copy `access_token` from response

**Step 4: Authorize**
- Click 🔒 "Authorize" button
- Paste: `Bearer <your_token>`
- Click "Authorize"

**Step 5: Upload Avatar**
- Endpoint: `POST /users/me/avatar`
- Click "Try it out"
- Choose file (image, < 5MB)
- Click "Execute"
- ✅ Expected: Status 200, returns `avatarUrl`

**Step 6: Verify Profile**
- Endpoint: `GET /users/me`
- Click "Try it out" → "Execute"
- ✅ Expected: `avatarUrl` field contains Cloudinary URL

**Step 7: Delete Avatar**
- Endpoint: `DELETE /users/me/avatar`
- Click "Try it out" → "Execute"
- ✅ Expected: Status 200, "Avatar deleted successfully"

**Step 8: Verify Deletion**
- Endpoint: `GET /users/me`
- ✅ Expected: `avatarUrl` is `null`

---

## Test với Postman

### Collection: Tutor Support System

**1. Login**
```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "student1@hcmut.edu.vn",
  "password": "password123"
}
```

**2. Upload Avatar**
```http
POST http://localhost:3000/users/me/avatar
Authorization: Bearer {{access_token}}
Content-Type: multipart/form-data

Body → form-data:
  Key: avatar
  Type: File
  Value: [Select image file]
```

**3. Get Profile**
```http
GET http://localhost:3000/users/me
Authorization: Bearer {{access_token}}
```

**4. Delete Avatar**
```http
DELETE http://localhost:3000/users/me/avatar
Authorization: Bearer {{access_token}}
```

---

## Test Cases

### ✅ Positive Tests
- [ ] Upload JPG file (< 5MB) → Success
- [ ] Upload PNG file (< 5MB) → Success
- [ ] Upload WEBP file (< 5MB) → Success
- [ ] Upload replaces old avatar → Old deleted, new uploaded
- [ ] Delete avatar → Success
- [ ] Profile shows avatarUrl → Correct URL

### ❌ Negative Tests
- [ ] Upload without auth → 401 Unauthorized
- [ ] Upload file > 5MB → 400 Bad Request
- [ ] Upload GIF file → 400 Bad Request (not allowed)
- [ ] Upload PDF file → 400 Bad Request (not allowed)
- [ ] Upload without file → 400 Bad Request
- [ ] Delete non-existent avatar → 404 Not Found

---

## Verify on Cloudinary

1. Login: https://cloudinary.com/console
2. Go to: Media Library
3. Navigate to: `tutor-support-system/avatars/`
4. ✅ Check: Files are organized by user ID
5. ✅ Check: Images are optimized (500x500px)
6. ✅ Check: Old avatars are deleted when new uploaded

---

## Expected Results

### Upload Response
```json
{
  "message": "Avatar uploaded successfully",
  "avatarUrl": "https://res.cloudinary.com/do7iqcmlo/image/upload/v1700312345/tutor-support-system/avatars/user-1/abc123.jpg"
}
```

### Profile Response (with avatar)
```json
{
  "id": 1,
  "email": "student1@hcmut.edu.vn",
  "fullName": "Nguyen Van A",
  "role": "STUDENT",
  "avatarUrl": "https://res.cloudinary.com/.../abc123.jpg",
  "createdAt": "2025-11-18T..."
}
```

### Delete Response
```json
{
  "message": "Avatar deleted successfully"
}
```

---

