# 🧪 Hướng Dẫn Test Email Notifications

## 📋 Mục Lục
1. [Chuẩn Bị](#chuẩn-bị)
2. [Cấu Hình Email Của Bạn](#cấu-hình-email-của-bạn)
3. [Các Bước Test](#các-bước-test)
4. [Kiểm Tra Kết Quả](#kiểm-tra-kết-quả)
5. [Troubleshooting](#troubleshooting)

---

## 🎯 Chuẩn Bị

### **Yêu cầu:**
- ✅ Có tài khoản Gmail @hcmut.edu.vn
- ✅ Đã bật 2-Factor Authentication trên Google Account
- ✅ Project đã được pull về máy và chạy được

### **Kiểm tra server:**
```bash
cd D:\HK251\CNPM\BTL\Sub3\TutorSupportSystem
npm run start:dev
```

Đợi đến khi thấy:
```
[Nest] Application successfully started
[Nest] Swagger is running on: http://localhost:3000/api
```

---

## 🔐 Cấu Hình Email Của Bạn

### **Bước 1: Tạo Gmail App Password**

1. **Truy cập:** https://myaccount.google.com/apppasswords
   - Đăng nhập bằng email HCMUT của bạn (ví dụ: `ten.ban@hcmut.edu.vn`)

2. **Tạo App Password:**
   - Chọn **App**: "Mail"
   - Chọn **Device**: "Windows Computer" (hoặc bất kỳ)
   - Click **"Generate"**

3. **Copy password:**
   - Bạn sẽ nhận được **16 ký tự** (ví dụ: `abcd efgh ijkl mnop`)
   - Copy toàn bộ

---

### **Bước 2: Cập Nhật File `.env`**

1. **Mở file `.env`** trong project:
   ```
   D:\HK251\CNPM\BTL\Sub3\TutorSupportSystem\.env
   ```

2. **Tìm phần Email Configuration** và **THAY ĐỔI** các dòng sau:

   ```env
   # ============================================
   # EMAIL / SMTP Configuration (Gmail)
   # ============================================
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=TEN_EMAIL_BAN@hcmut.edu.vn          # ← Thay email của bạn
   SMTP_PASS=abcdefghijklmnop                      # ← Thay App Password của bạn
   EMAIL_FROM="HCMUT Tutor System <TEN_EMAIL_BAN@hcmut.edu.vn>"  # ← Thay email của bạn
   
   # Frontend URL (for email links)
   FRONTEND_URL=http://localhost:3000
   ```

   **⚠️ LƯU Ý:**
   - `SMTP_USER`: Email HCMUT đầy đủ của bạn
   - `SMTP_PASS`: 16 ký tự App Password (KHÔNG phải password đăng nhập thường)
   - `EMAIL_FROM`: Tên hiển thị + email của bạn

---

### **Bước 3: Restart Server**

1. **Dừng server:** Nhấn `Ctrl + C` trong terminal
2. **Chạy lại:**
   ```bash
   npm run start:dev
   ```
3. **Đợi server khởi động xong** (khoảng 30 giây)

---

## 🧪 Các Bước Test

### **Mở Swagger UI**

Truy cập: **http://localhost:3000/api**

Bạn sẽ thấy tất cả các API endpoints. Tìm section **"Email"** ở menu bên trái.

---

## 📧 TEST 1: Kiểm Tra Kết Nối SMTP

**Mục đích:** Xác nhận Gmail SMTP của bạn hoạt động

### **Các bước:**
1. Tìm endpoint: **GET /email/test-connection**
2. Click vào endpoint
3. Click nút **"Try it out"** (góc phải)
4. Click nút **"Execute"** (màu xanh)

### **✅ Kết quả mong đợi:**

**Response (HTTP 200):**
```json
{
  "status": "success",
  "message": "SMTP connection successful! Email service is ready."
}
```

**📬 Kiểm tra email:**
- Mở Gmail: `ten.ban@hcmut.edu.vn`
- Tìm email mới nhất với tiêu đề: **"✅ Test Email - HCMUT Tutor System"**
- Email có nội dung:
  ```
  ✅ SMTP Test Successful!
  Congratulations! If you receive this email, your email service is working correctly.
  
  📧 SMTP Host: smtp.gmail.com
  🔌 Port: 587
  
  🎉 Email Service Ready!
  ```

**❌ Nếu lỗi:**
- Response status: `"error"`
- **Giải pháp:** Kiểm tra lại `SMTP_USER` và `SMTP_PASS` trong `.env`
- Đảm bảo đã bật 2FA và tạo App Password đúng cách

---

## 📧 TEST 2: Email Chào Mừng (Welcome)

**Mục đích:** Test email gửi cho user mới đăng ký

### **Các bước:**
1. Tìm endpoint: **POST /email/test-welcome**
2. Click **"Try it out"**
3. Click **"Execute"** (không cần nhập gì)

### **✅ Kết quả mong đợi:**

**Response (HTTP 200):**
```json
{
  "status": "success",
  "message": "Test welcome email sent! Check your inbox."
}
```

**📬 Kiểm tra email:**
- Tiêu đề: **"🎓 Chào mừng đến với HCMUT Tutor Support System"**
- Email có:
  - Header gradient màu tím đẹp mắt
  - Lời chào: "Xin chào Nguyễn Văn Test! 👋"
  - Thông tin:
    ```
    📧 Email: cong.nguyen10082005@hcmut.edu.vn
    🆔 MSSV: 2212345
    👤 Vai trò: STUDENT
    ```
  - Danh sách tính năng cho STUDENT:
    - 🔍 Tìm kiếm và đặt lịch hẹn với Tutor
    - ⭐ Đánh giá và phản hồi sau mỗi buổi học
    - 📊 Theo dõi tiến độ học tập
    - 📢 Gửi khiếu nại nếu cần
  - Nút "Truy cập hệ thống ngay"

**💡 Lưu ý:** Email này gửi đến email trong code test, KHÔNG phải email của bạn. Để gửi về email của bạn, xem [Test Nâng Cao](#test-nâng-cao) bên dưới.

---

## 📧 TEST 3: Email Xác Nhận Meeting

**Mục đích:** Test email khi tutor xác nhận booking

### **Các bước:**
1. Tìm endpoint: **POST /email/test-confirmation**
2. Click **"Try it out"**
3. Click **"Execute"**

### **✅ Kết quả mong đợi:**

**Response (HTTP 200):**
```json
{
  "status": "success",
  "message": "Test confirmation email sent! Check your inbox."
}
```

**📬 Kiểm tra email:**
- Tiêu đề: **"✅ Buổi hẹn của bạn đã được xác nhận"**
- Email có:
  - Header gradient màu xanh lá
  - Thông tin meeting:
    ```
    👨‍🏫 Tutor: Trần Thị Tutor
    📅 Thời gian: Thứ Hai, 15 tháng 1, 2024 | 14:00 - 15:00
    📚 Chủ đề: Hỗ trợ làm bài tập Toán Cao Cấp
    ```
  - Danh sách chuẩn bị:
    - ✅ Chuẩn bị tài liệu và câu hỏi
    - ✅ Kiểm tra lịch và đến đúng giờ
    - ✅ Mang theo sách vở cần thiết
  - Nút "Xem Chi Tiết Meeting"

---

## 📧 TEST 4: Email Yêu Cầu Đánh Giá

**Mục đích:** Test email sau khi meeting hoàn thành

### **Các bước:**
1. Tìm endpoint: **POST /email/test-rating**
2. Click **"Try it out"**
3. Click **"Execute"**

### **✅ Kết quả mong đợi:**

**Response (HTTP 200):**
```json
{
  "status": "success",
  "message": "Test rating request email sent! Check your inbox."
}
```

**📬 Kiểm tra email:**
- Tiêu đề: **"⭐ Đánh giá buổi học của bạn"**
- Email có:
  - Header gradient màu tím/hồng
  - Biểu tượng 5 sao ⭐⭐⭐⭐⭐
  - Thông tin buổi học đã hoàn thành
  - Nút "Đánh Giá Ngay" màu tím nổi bật
  - Lời cảm ơn và khuyến khích feedback

---

## 📧 TEST 5: Email Thông Báo Khiếu Nại

**Mục đích:** Test email gửi cho coordinator khi có complaint

### **Các bước:**
1. Tìm endpoint: **POST /email/test-complaint**
2. Click **"Try it out"**
3. Click **"Execute"**

### **✅ Kết quả mong đợi:**

**Response (HTTP 200):**
```json
{
  "status": "success",
  "message": "Test complaint notification sent! Check your inbox."
}
```

**📬 Kiểm tra email:**
- Tiêu đề: **"🚨 Khiếu nại mới cần xử lý"**
- Email có:
  - Header gradient màu đỏ (alert)
  - Hộp cảnh báo: "⚠️ Yêu cầu xử lý khẩn"
  - Thông tin khiếu nại:
    ```
    🆔 ID: #42
    👨‍🎓 Sinh viên: Nguyễn Văn Test (test.student@hcmut.edu.vn)
    📌 Meeting: Meeting ID 123 với tutor Trần Thị Tutor
    📝 Nội dung: Tutor đến muộn 30 phút và không thông báo trước...
    📅 Thời gian: 15 tháng 1, 2024, 10:30
    ```
  - Nút "Xử lý khiếu nại" màu đỏ
  - Quy trình xử lý 4 bước

---

## 🎯 Kiểm Tra Kết Quả

### **Checklist đầy đủ:**

```
□ Test 1: GET /email/test-connection
  □ Response: "success"
  □ Nhận được email test trong inbox
  
□ Test 2: POST /email/test-welcome
  □ Response: "success"
  □ Email có header tím, thông tin user, danh sách tính năng
  
□ Test 3: POST /email/test-confirmation
  □ Response: "success"
  □ Email có header xanh lá, thông tin meeting, checklist chuẩn bị
  
□ Test 4: POST /email/test-rating
  □ Response: "success"
  □ Email có header tím, 5 sao, nút đánh giá
  
□ Test 5: POST /email/test-complaint
  □ Response: "success"
  □ Email có header đỏ, thông tin complaint, nút xử lý
```

### **Kiểm tra Terminal Logs:**

Mở terminal đang chạy server, bạn phải thấy:
```
[EmailService] Test email sent successfully
[EmailService] Welcome email sent to cong.nguyen10082005@hcmut.edu.vn
[EmailService] Meeting confirmation sent to cong.nguyen10082005@hcmut.edu.vn
[EmailService] Rating request sent to cong.nguyen10082005@hcmut.edu.vn
[EmailService] Complaint notification sent to cong.nguyen10082005@hcmut.edu.vn
```

**Không có dòng ERROR nào!** ✅

---

## 🚀 Test Nâng Cao

### **Test Gửi Email Về Email Của Bạn**

Nếu muốn test gửi email về **email của bạn** thay vì email mặc định trong code:

#### **Cách 1: Sửa Email Controller (Khuyến nghị)**

1. **Mở file:** `src/email/email.controller.ts`

2. **Tìm method `testWelcomeEmail()`** (dòng ~35):
   ```typescript
   @Post('test-welcome')
   async testWelcomeEmail() {
     await this.emailService.sendWelcomeEmail('cong.nguyen10082005@hcmut.edu.vn', {
       // ...
     });
   ```

3. **Thay đổi email:**
   ```typescript
   @Post('test-welcome')
   async testWelcomeEmail() {
     await this.emailService.sendWelcomeEmail('email_cua_ban@hcmut.edu.vn', {
       fullName: 'Tên Của Bạn',      // ← Đổi tên bạn
       email: 'email_cua_ban@hcmut.edu.vn',  // ← Đổi email bạn
       role: 'STUDENT',
       mssv: '2212XXX',                // ← Đổi MSSV bạn
     });
   ```

4. **Làm tương tự cho các method khác:**
   - `testConfirmationEmail()` (dòng ~50)
   - `testRatingEmail()` (dòng ~65)
   - `testComplaintEmail()` (dòng ~80)

5. **Save file** và server sẽ tự động reload

6. **Test lại qua Swagger** → Email sẽ gửi về email của bạn! 🎉

---

#### **Cách 2: Test Qua Business Flow (Advanced)**

Test email tự động khi sử dụng thực tế:

**Test Welcome Email:**
1. Đăng nhập với email mới: `POST /auth/login`
   ```json
   {
     "email": "email_cua_ban@hcmut.edu.vn"
   }
   ```
2. Nếu email chưa tồn tại → User mới được tạo → Welcome email tự động gửi!

**Test Meeting Confirmation:**
1. Login as student → Tạo booking
2. Login as tutor → Confirm booking
3. → Email confirmation tự động gửi cho student!

---

## 🐛 Troubleshooting

### **Lỗi 1: "Authentication failed (535)"**

**Nguyên nhân:** Sai App Password hoặc chưa bật 2FA

**Giải pháp:**
1. Vào Google Account Security
2. Bật 2-Factor Authentication
3. Tạo lại App Password mới
4. Copy password (16 ký tự, bỏ dấu cách)
5. Cập nhật vào `.env`:
   ```env
   SMTP_PASS=abcdefghijklmnop
   ```
6. Restart server

---

### **Lỗi 2: "Email sent nhưng không nhận được"**

**Kiểm tra:**
1. ✅ **Spam/Junk folder** trong Gmail
2. ✅ Các tab **Promotions**, **Updates**, **Social**
3. ✅ Đợi 1-2 phút (đôi khi Gmail delay)
4. ✅ Kiểm tra `SMTP_USER` trong `.env` đúng email của bạn chưa

**Thêm vào Contacts:**
- Thêm địa chỉ email gửi vào danh bạ để tránh spam

---

### **Lỗi 3: "Connection timeout (ETIMEDOUT)"**

**Nguyên nhân:** Firewall/Antivirus chặn port 587

**Giải pháp:**
1. Tạm tắt Firewall/Antivirus
2. Thử network khác (mobile hotspot)
3. Kiểm tra proxy/VPN
4. Mạng trường học đôi khi chặn SMTP → Dùng 4G

---

### **Lỗi 4: "Template error: 'eq' not defined"**

**Nguyên nhân:** Chưa đăng ký Handlebars helper

**Giải pháp:**
- Pull code mới nhất từ git
- File `src/email/email.module.ts` phải có:
  ```typescript
  adapter: new HandlebarsAdapter({
    eq: (a: any, b: any) => a === b,
  })
  ```

---

### **Lỗi 5: "Path argument must be string"**

**Nguyên nhân:** Template directory không đúng

**Giải pháp:**
1. Kiểm tra folder `templates/emails/` tồn tại
2. Kiểm tra các file `.hbs` trong folder:
   - `welcome.hbs`
   - `meeting-confirmation.hbs`
   - `meeting-reminder.hbs`
   - `rating-request.hbs`
   - `complaint-notification.hbs`

---

## 📊 Kết Quả Cuối Cùng

Sau khi test xong, bạn sẽ có **5 emails** trong inbox:

| # | Tiêu đề | Header Color | Nội dung chính |
|---|---------|--------------|----------------|
| 1 | ✅ Test Email | Trắng/Xanh | SMTP test successful |
| 2 | 🎓 Chào mừng | Tím | Welcome + role features |
| 3 | ✅ Buổi hẹn xác nhận | Xanh lá | Meeting details + checklist |
| 4 | ⭐ Đánh giá buổi học | Tím/Hồng | Rating request + stars |
| 5 | 🚨 Khiếu nại mới | Đỏ | Complaint info + action |

**Tất cả đều có:**
- ✅ Giao diện responsive (mobile + desktop)
- ✅ Gradient headers đẹp mắt
- ✅ Emoji icons
- ✅ Call-to-action buttons
- ✅ Footer với thông tin HCMUT

---

## 📞 Hỗ Trợ

Nếu gặp lỗi không giải quyết được:

1. **Check documentation:** `documentation/Email_Notifications/PHASE2_EMAIL_NOTIFICATIONS.md`
2. **Check quick start:** `documentation/Email_Notifications/QUICK_START.md`
3. **Hỏi lead:** Nguyễn Văn Công
4. **Email:** cong.nguyen10082005@hcmut.edu.vn

---

## ✅ Checklist Hoàn Tất

```
□ Đã tạo Gmail App Password
□ Đã cập nhật .env với email của mình
□ Đã restart server
□ Test 1: SMTP Connection - PASS
□ Test 2: Welcome Email - PASS
□ Test 3: Meeting Confirmation - PASS
□ Test 4: Rating Request - PASS
□ Test 5: Complaint Notification - PASS
□ Đã nhận được tất cả 5 emails trong inbox
□ Đã kiểm tra terminal logs (không có ERROR)
```

---

**🎉 Chúc mừng! Bạn đã test thành công Email Notification System!**

