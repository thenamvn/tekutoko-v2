// server.js
const path = require("path");
const dotenv = require("dotenv");
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const fs = require("fs");
const multer = require("multer");
const nodeMailer = require("nodemailer");
const cron = require("node-cron");
const { getStorage, ref, deleteObject } = require("firebase/storage");
const { initializeApp } = require("firebase/app");
const { v4: uuidv4 } = require("uuid");
const fetch = require("node-fetch");
const { GoogleGenAI } = require('@google/genai');
const PORT = 9999;

// Cấu hình CORS
app.use(
  cors({
    origin: [
      "https://tekutoko.org",
      "https://wwww.tekutoko.org",
      "https://jptravelz.web.app",
      "https://test-tekutoko.vercel.app",
      "http://localhost:3000",
      "http://localhost",
      "175.41.175.176",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());
app.options("*", cors()); // Preflight request handler for all routes
// Load environment variables from .env file
const envPath = path.resolve(__dirname, ".env");
dotenv.config({ path: envPath });

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// app.use(favicon(path.join(__dirname, 'public', 'favicon.webp')));
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
});

const tekutokoGuide = `
# TEKUTOKO - Hướng dẫn sử dụng cho Người dùng

## 🎯 Giới thiệu về Tekutoko

Tekutoko là nền tảng trực tuyến miễn phí cho phép tham gia các hoạt động tương tác vui nhộn như:
- **Săn ảnh thú vị** - Chụp và chia sẻ ảnh để hoàn thành thử thách
- **Sưu tập tem** - Thu thập tem và đạt mục tiêu đề ra  
- **Thử thách đố vui** - Giải đố và trả lời câu hỏi
- **Nhật ký nhiệm vụ** - Hoàn thành các thử thách vui nhộn
- **Nộp báo cáo/bài tập** - Gửi và theo dõi tiến độ

## 🚀 Đăng ký và Đăng nhập

### **Tạo tài khoản mới**
1. Nhấn nút "Đăng ký" trên màn hình chính
2. Nhập thông tin:
   - Username (duy nhất)
   - Email (để nhận thông báo)
   - Password (ít nhất 6 ký tự)
   - Fullname (tên hiển thị)
3. Nhấn "Đăng ký" để hoàn tất

### **Đăng nhập**
- **Bằng tài khoản Tekutoko**: Nhập username/email + password
- **Bằng Google**: Nhấn nút Google để đăng nhập nhanh
- **Bằng LINE**: Kết nối qua tài khoản LINE

### **Quên mật khẩu**
1. Nhấn "Forgot Password?" ở màn hình đăng nhập
2. Nhập email đã đăng ký
3. Kiểm tra email để nhận link reset password
4. Nhấn vào link trong email
5. Nhập mật khẩu mới và xác nhận
6. Đăng nhập với mật khẩu mới

## 🏠 Dashboard - Màn hình chính

Sau khi đăng nhập, bạn sẽ thấy:
- **Rooms Joined**: Các phòng bạn đã tham gia
- **Join Game by Code**: Nhập mã để tham gia phòng mới
- **Discovery**: Khám phá các phòng có sẵn
- **Profile**: Quản lý thông tin cá nhân

## 🎨 Tạo phòng chơi mới

### **Điều kiện tạo phòng**
- Đã đăng nhập vào tài khoản Tekutoko
- Có quyền tạo phòng (host privileges)

### **Cách tạo phòng**
1. Vào Dashboard và nhấn "Create New Game"
2. Hoặc nhấn icon "+" trong Bottom Navigation
3. Điền thông tin cơ bản:
   - **Room Title**: Tên phòng (bắt buộc)
   - **Description**: Mô tả ngắn gọn về phòng
   - **Thumbnail**: Upload ảnh đại diện cho phòng
   - **How to Play**: Hướng dẫn chi tiết cho người chơi

### **Thiết lập câu hỏi**
1. **Thêm câu hỏi mới**: Nhấn "Add Question"
2. **Chọn loại câu hỏi**:
   - **Text**: Người chơi nhập văn bản
   - **Multiple Choice**: Chọn từ các đáp án có sẵn
   - **Upload**: Yêu cầu upload ảnh/file

3. **Nhập nội dung**:
   - Question Text: Đề bài câu hỏi
   - Correct Answer: Đáp án đúng
   - Explanation: Giải thích (tùy chọn)

4. **Với Multiple Choice**: Thêm các lựa chọn A, B, C, D

### **Thiết lập phần thưởng (tùy chọn)**
1. Bật "Enable Reward"
2. Chọn loại thưởng:
   - **Voucher**: Tạo mã giảm giá
   - **Certificate**: Chứng chỉ hoàn thành
   - **Custom**: Phần thưởng tùy chỉnh

3. **Thiết lập voucher**:
   - Discount Name: Tên ưu đãi
   - Discount Value: Giá trị giảm (% hoặc số tiền)
   - Description: Mô tả chi tiết
   - Expiration Date: Ngày hết hạn
   - Upload ticket image: Ảnh voucher

### **Hoàn tất và xuất bản**
1. Preview phòng để kiểm tra
2. Nhấn "Create Room" để tạo
3. Chia sẻ Room ID cho người chơi
4. Theo dõi tiến độ trong Room Management

### **Quản lý phòng đã tạo**
- Xem danh sách người tham gia
- Kiểm tra kết quả của từng người chơi
- Chỉnh sửa câu hỏi (nếu chưa có người chơi)
- Xóa phòng khi không cần thiết

### **Tips tạo phòng hiệu quả**
- Đặt tên phòng rõ ràng, dễ hiểu
- Viết hướng dẫn chi tiết trong "How to Play"
- Sử dụng ảnh thumbnail hấp dẫn
- Tạo câu hỏi đa dạng về độ khó
- Thiết lập phần thưởng để thu hút

## 🎮 Cách tham gia phòng game

### **Tham gia bằng mã phòng**
1. Lấy mã phòng từ người tổ chức (VD: "ABC123")
2. Nhập vào ô "Join Game by Code"
3. Nhấn "Join" để tham gia

### **Khám phá phòng trong Discovery**
- **Tab Popular**: Các phòng được nhiều người tham gia
- **Tab Nearby**: Phòng game gần vị trí của bạn (cần bật GPS)
- **Tab Search**: Tìm kiếm bằng từ khóa khi bạn gõ vào ô search

### **Cho phép truy cập vị trí**
- Khi sử dụng tính năng "Nearby", app sẽ xin phép truy cập GPS
- Nhấn "Allow" để tìm các phòng game gần bạn
- Hệ thống sẽ tự động phát hiện thành phố và hiển thị phòng phù hợp

## 🎯 Hoàn thành nhiệm vụ trong phòng

### **Các loại câu hỏi/nhiệm vụ**
1. **Trả lời văn bản**: Gõ câu trả lời vào ô text
2. **Trắc nghiệm**: Chọn đáp án đúng từ các lựa chọn
3. **Upload ảnh/file**: Chụp ảnh hoặc tải file lên

### **Quy trình hoàn thành**
1. Đọc kỹ đề bài và hướng dẫn
2. Thực hiện nhiệm vụ theo yêu cầu
3. Nhập câu trả lời hoặc upload file
4. Nhấn "Submit" để gửi
5. Xem kết quả ngay lập tức
6. Chuyển sang câu tiếp theo

### **Upload ảnh**
- Chọn "Take Photo" để chụp ảnh mới
- Hoặc "Choose from Gallery" để chọn ảnh có sẵn
- Ảnh sẽ được tự động nén để upload nhanh hơn
- Đợi upload hoàn tất rồi nhấn Submit

## 🎁 Nhận phần thưởng

### **Điều kiện nhận thưởng**
- Hoàn thành tất cả câu hỏi trong phòng
- Đạt điểm số yêu cầu (nếu có)

### **Cách nhận**
1. Sau khi hoàn thành, sẽ xuất hiện nút "Claim Reward"
2. Nhấn để xem phần thưởng
3. Quét QR code để sử dụng voucher (nếu có)
4. Hoặc screenshot để lưu thông tin

## 👤 Quản lý Profile

### **Cập nhật thông tin cá nhân**
1. Vào Profile từ menu
2. Nhấn "Edit Profile"
3. Thay đổi:
   - Avatar (ảnh đại diện)
   - Fullname (tên hiển thị)
   - Bio (giới thiệu bản thân)
   - Background image (ảnh nền profile)

### **Liên kết social media**
- Thêm link Instagram, Facebook, Twitter
- Hiển thị trên profile để người khác kết nối

## 🌐 Chuyển đổi ngôn ngữ

Tekutoko hỗ trợ 3 ngôn ngữ:
- **English (en)** - Tiếng Anh
- **Tiếng Việt (vi)** - Vietnamese  
- **日本語 (ja)** - Tiếng Nhật

Thay đổi bằng cách nhấn vào dropdown ngôn ngữ ở góc trên màn hình.

## 👥 Tính năng Follow

### **Follow người tổ chức**
1. Vào profile của người tổ chức
2. Nhấn nút "Follow"
3. Bạn sẽ nhận thông báo khi họ tạo sự kiện mới

### **Xem Following/Followers**
- Trong profile có hiển thị số người follow và đang follow
- Nhấn vào để xem danh sách chi tiết

## 📱 Navigation - Di chuyển trong app

### **Bottom Navigation Bar**
- **Home**: Về Dashboard chính
- **Discovery**: Khám phá phòng mới
- **Create**: Tạo phòng (nếu có quyền)
- **Profile**: Quản lý tài khoản

### **Header**
- Logo Tekutoko (nhấn để về Home)
- Search bar (tìm kiếm phòng)
- Language selector (chọn ngôn ngữ)
- Menu dropdown (logout, settings)

## 🔧 Troubleshooting - Xử lý sự cố

### **Không tham gia được phòng**
- Kiểm tra mã phòng có đúng không
- Đảm bảo phòng vẫn đang hoạt động
- Thử đăng xuất và đăng nhập lại

### **Upload ảnh không thành công**
- Kiểm tra kết nối internet
- Thử chụp ảnh mới với chất lượng thấp hơn
- Đảm bảo file không quá 10MB

### **Không nhận được email reset password**
- Kiểm tra thư mục Spam/Junk
- Đảm bảo email nhập đúng
- Thử lại sau 5-10 phút

### **GPS không hoạt động**
- Bật Location Services trong Settings điện thoại
- Cho phép browser truy cập vị trí
- Thử refresh trang và cho phép lại

### **App chạy chậm**
- Đóng các tab/app khác không cần thiết
- Kiểm tra kết nối wifi/4G
- Clear cache browser nếu cần

## 💡 Tips sử dụng hiệu quả

### **Cho người mới**
- Bắt đầu với các phòng Popular để làm quen
- Đọc kỹ hướng dẫn trước khi bắt đầu
- Thử các loại câu hỏi khác nhau để hiểu cách chơi

### **Cho người dùng thường xuyên**
- Follow các host yêu thích để không bỏ lỡ sự kiện
- Dùng tính năng Nearby để tìm hoạt động gần nhà
- Cập nhật profile để thu hút người khác follow

### **Bảo mật tài khoản**
- Sử dụng mật khẩu mạnh và duy nhất
- Không chia sẻ thông tin đăng nhập
- Đăng xuất khi sử dụng máy chung
`;
function buildPrompt(userQuestion) {
  return `Bạn là TekuBot - trợ lý ảo chuyên về ứng dụng Tekutoko.

**Nhiệm vụ:** Trả lời câu hỏi của người dùng về cách sử dụng Tekutoko một cách thân thiện và chính xác.

**Quy tắc:**
1. Chỉ trả lời dựa trên thông tin trong tài liệu hướng dẫn
2. Nếu không tìm thấy thông tin, trả lời: "Xin lỗi, tôi không tìm thấy thông tin này trong tài liệu hướng dẫn Tekutoko"
3. Trả lời ngắn gọn và dễ hiểu, ngôn ngữ trả lời luôn luôn phải cùng ngôn ngữ với câu hỏi của người dùng. Người dùng sử dụng ngôn ngữ nào thì TekuBot trả lời bằng ngôn ngữ đó. Nghiêm cấm trả lời bằng ngôn ngữ khác với ngôn ngữ của user đang trò chuyện.
4. Sử dụng emoji phù hợp để làm cho câu trả lời sinh động
5. Cho phép trò chuyện tự nhiên, nhưng không được đi lạc đề
6. Tài liệu hướng dẫn Tekutoko được cung cấp đang là tiếng Việt, tuy nhiên nếu người dùng hỏi bằng tiếng Anh hoặc tiếng Nhật, bạn phải trả lời bằng ngôn ngữ đó, bạn có thể phiên dịch hay chuyển đổi ngôn ngữ kiểu gì thì tùy, miễn là đảm bảo nội dung trả lời chính xác và dễ hiểu.
**Tài liệu hướng dẫn Tekutoko:**
${tekutokoGuide}

**Câu hỏi:** ${userQuestion}

**Trả lời:**`;
}
// Middleware để quản lý kết nối
const dbMiddleware = (req, res, next) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection from pool:", err);
      return res.status(500).json({ error: "Database connection error" });
    }

    // Gán kết nối vào req để sử dụng trong các route
    req.dbConnection = connection;

    // Giải phóng kết nối sau khi xử lý xong
    res.on("finish", () => {
      connection.release();
    });

    next(); // Tiếp tục đến middleware hoặc route tiếp theo
  });
};

// Sử dụng middleware cho tất cả các route
app.use(dbMiddleware);

function isFirebasePath(path) {
  // Firebase paths không được bắt đầu với "http" hoặc "https" và nên là đường dẫn tương đối.
  return !path.startsWith("http") && path.includes("/");
}

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};
// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);
const upload = multer({ storage: multer.memoryStorage() });

// Define the directory path
const uploadDir = path.join(__dirname, "public", "uploads");

// Check if the directory exists
if (!fs.existsSync(uploadDir)) {
  // Create the directory
  fs.mkdirSync(uploadDir, { recursive: true });
}

const transporter = nodeMailer.createTransport({
  host: "smtp.gmail.com",
  // port: 587,
  port: 465,
  secure: true,
  // requireTLS: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

function sendEmail(email, subject, text, html) {
  const mailOptions = {
    from: `TEKUTOKO <${process.env.EMAIL}>`,
    to: email,
    subject: subject,
    text: text,
    html: html, // Add the html property
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        console.log("Email sent: " + info.response);
        resolve(info);
      }
    });
  });
}

// Timeout middleware
const timeout = (req, res, next) => {
  // Set the timeout duration (in milliseconds)
  const timeoutDuration = 3000; // 5 seconds

  // Set a timeout for the request
  req.setTimeout(timeoutDuration, () => {
    console.error(
      `Request to ${req.originalUrl} timed out after ${timeoutDuration} ms`
    );
    res.status(408).json({ success: false, message: "alert.timeout" });
  });

  next();
};

// Use the timeout middleware
app.use(timeout);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(403).json({
      message: "Access denied",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
  } catch (err) {
    const decoded = jwt.decode(token);
    return res.status(401).json({
      message: "Invalid Token",
    });
  }
  return next();
};

// upload image
app.post("/upload", verifyToken, (req, res) => {
  const { room_id, uploader_username, fileUrls } = req.body;

  if (!room_id || !uploader_username || !fileUrls || fileUrls.length === 0) {
    return res
      .status(400)
      .json({ error: "Room ID, username, and file URLs are required." });
  }

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting database connection:", err);
      return res.status(500).send("Database connection error");
    }

    try {
      const values = fileUrls.map((url) => [room_id, uploader_username, url]);
      const query =
        "INSERT INTO images (room_id, uploader_username, image_path) VALUES ?";

      connection.query(query, [values], (err, result) => {
        if (err) {
          console.error("Error inserting into images table:", err);
          return res.status(500).json({ error: "alert.room.databaseError" });
        }

        const selectQuery =
          "SELECT * FROM images WHERE room_id = ? AND uploader_username = ?";
        connection.query(
          selectQuery,
          [room_id, uploader_username],
          (err, results) => {
            if (err) {
              console.error("Error fetching images:", err);
              return res
                .status(500)
                .json({ error: "alert.room.databaseError" });
            }
            res.status(200).json({ images: results });
          }
        );
      });
    } catch (error) {
      console.error("Error saving file URLs to database:", error);
      return res
        .status(500)
        .json({ error: "Failed to save file URLs to the database" });
    } finally {
      connection.release();
    }
  });
});

app.post("/sendemail", async (req, res) => {
  const { email, subject, text, html } = req.body; // Accept html in the request body
  try {
    await sendEmail(email, subject, text, html);
    res.json({ message: "Email sent successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to send email", error: error.message });
  }
});

// API để gửi tin nhắn đến người dùng Line
// Sending a message to LINE
app.post("/send-message-line", async (req, res) => {
  const { id, messages } = req.body;
  console.log(id, messages);

  // Validate input
  if (!id || !messages) {
    return res.status(400).json({ error: "id and messages are required" });
  }

  // Prepare the message payload
  const payload = {
    to: id,
    messages: [
      {
        type: "text",
        text: messages, // Ensure this is not empty and within limits
      },
    ],
    notificationDisabled: false, // Set to true if you want to disable notifications
  };

  try {
    // Send message using the LINE API
    const response = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LINE_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      res.status(200).json({ message: "Message sent successfully!" });
    } else {
      const errorResponse = await response.json();
      console.error("Error sending message to LINE:", errorResponse);
      res.status(response.status).json({ error: errorResponse });
    }
  } catch (error) {
    console.error("Error sending message to LINE:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

app.post("/createroom", verifyToken, (req, res) => {
  const { id, admin_username } = req.body;

  if (req.user.username !== admin_username) {
    return res
      .status(403)
      .json({ message: "You are not authorized to perform this action" });
  }

  if (!id || !admin_username) {
    return res
      .status(400)
      .json({ error: "Room ID and admin username are required." });
  }

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting database connection:", err);
      return res.status(500).send("Database connection error");
    }

    try {
      const query = "INSERT INTO room (room_id, admin_username) VALUES (?, ?)";
      connection.query(query, [id, admin_username], (err, result) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            console.error("Duplicate entry:", err.sqlMessage);
            return res.status(409).json({ error: "Room already exists." });
          } else {
            console.error("Error inserting into rooms table:", err);
            return res.status(500).json({ error: "Database error" });
          }
        }

        res.status(201).json({ message: "Room created successfully." });
      });
    } catch (err) {
      console.error("Unexpected error:", err);
      res.status(500).json({ error: "Unexpected error" });
    } finally {
      connection.release();
    }
  });
});

app.post("/joinroom", verifyToken, (req, res) => {
  const { id, username } = req.body;

  if (req.user.username !== username) {
    return res
      .status(403)
      .send("You are not authorized to perform this action");
  }

  if (!id || !username) {
    return res
      .status(400)
      .json({ error: "Room ID and username are required." });
  }

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting database connection:", err);
      return res.status(500).json({ error: "Database connection error" });
    }

    try {
      // BƯỚC 1: Kiểm tra xem room có tồn tại và lấy thông tin host
      const checkRoomQuery =
        "SELECT admin_username, room_type FROM room WHERE room_id = ?";
      connection.query(checkRoomQuery, [id], (err, roomResults) => {
        if (err) {
          console.error("Error checking room:", err);
          connection.release();
          return res
            .status(500)
            .json({ error: "Database error while checking room" });
        }

        if (roomResults.length === 0) {
          connection.release();
          return res.status(404).json({ error: "Room not found" });
        }

        const room = roomResults[0];

        // BƯỚC 2: Kiểm tra xem user có phải là host không
        if (room.admin_username === username) {
          connection.release();
          return res.status(400).json({
            error: "Host cannot join their own room",
            message: "You are already the host of this room",
          });
        }

        // BƯỚC 3: Kiểm tra room type nếu cần (optional)
        if (room.room_type === "private") {
          // Có thể thêm logic kiểm tra invitation ở đây
          // Tạm thời cho phép join private room
        }

        // BƯỚC 4: Thực hiện join room
        const insertQuery =
          "INSERT INTO room_users (room_id, username) VALUES (?, ?)";
        connection.query(insertQuery, [id, username], (err, result) => {
          connection.release();

          if (err) {
            if (err.code === "ER_DUP_ENTRY") {
              console.error("Duplicate entry:", err.sqlMessage);
              return res
                .status(200)
                .json({ message: "User already joined the room." });
            } else {
              console.error("Error inserting into room_users table:", err);
              return res.status(500).json({ error: "Database error" });
            }
          }

          res.status(201).json({
            message: "Joined room successfully.",
            room_id: id,
            username: username,
          });
        });
      });
    } catch (err) {
      console.error("Unexpected error:", err);
      connection.release();
      res.status(500).json({ error: "Unexpected error" });
    }
  });
});

app.get("/room/:username", async (req, res) => {
  const username = req.params.username;

  if (!username) {
    res.status(400).send("Username not provided");
    return;
  }

  try {
    // Query 1: Lấy hosted rooms
    const hostedRoomsQuery = `
      SELECT r.room_id, r.room_title, r.thumbnail, r.description, r.admin_username, 'hostedroom' as role
      FROM room r
      WHERE r.admin_username = ?
    `;

    // Query 2: Lấy joined rooms
    const joinedRoomsQuery = `
      SELECT r.room_id, r.room_title, r.thumbnail, r.description, r.admin_username, 'joinedroom' as role
      FROM room_users ru
      JOIN room r ON ru.room_id = r.room_id
      WHERE ru.username = ?
    `;

    const [hostedResults, joinedResults] = await Promise.all([
      new Promise((resolve, reject) => {
        pool.query(hostedRoomsQuery, [username], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      }),
      new Promise((resolve, reject) => {
        pool.query(joinedRoomsQuery, [username], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      }),
    ]);

    // Combine results
    const allRooms = [...hostedResults, ...joinedResults];

    // Lấy unique admin usernames
    const adminUsernames = [
      ...new Set(allRooms.map((room) => room.admin_username)),
    ];

    // Query avatars một lần cho tất cả admins
    if (adminUsernames.length > 0) {
      const avatarQuery = `
        SELECT username, COALESCE(avatarImage, 'https://www.svgrepo.com/show/341256/user-avatar-filled.svg') AS avatarImage
        FROM UserProfile
        WHERE username IN (${adminUsernames.map(() => "?").join(",")})
      `;

      pool.query(avatarQuery, adminUsernames, (err, avatarResults) => {
        if (err) {
          console.error("Error fetching avatars:", err);
          res.status(500).send("Server error");
          return;
        }

        // Create avatar map
        const avatarMap = {};
        avatarResults.forEach((row) => {
          avatarMap[row.username] = row.avatarImage;
        });

        // Add avatars to rooms
        const roomsWithAvatars = allRooms.map((room) => ({
          ...room,
          avatarImage:
            avatarMap[room.admin_username] ||
            "https://www.svgrepo.com/show/341256/user-avatar-filled.svg",
        }));

        res.json({ rooms: roomsWithAvatars });
      });
    } else {
      res.json({ rooms: [] });
    }
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).send("Server error");
  }
});

// Update room type endpoint
app.put("/room/:id/update-type", verifyToken, (req, res) => {
  const roomId = req.params.id;
  const { room_type, admin_username } = req.body;

  if (req.user.username !== admin_username) {
    return res
      .status(403)
      .send("You are not authorized to perform this action");
  }

  // Validate room_type
  if (!["public", "private"].includes(room_type)) {
    return res
      .status(400)
      .json({ error: 'Invalid room type. Must be "public" or "private".' });
  }

  // Validate admin_username
  if (!admin_username) {
    return res.status(400).json({ error: "Admin username is required." });
  }

  // SQL query to update the room type
  const query =
    "UPDATE room SET room_type = ? WHERE room_id = ? AND admin_username = ?";
  pool.query(query, [room_type, roomId, admin_username], (err, results) => {
    if (err) {
      console.error("Error updating room type:", err);
      return res.status(500).json({ error: "Database error." });
    }

    if (results.affectedRows === 0) {
      return res
        .status(404)
        .json({
          error:
            "Room not found or you are not authorized to update this room.",
        });
    }

    res.status(200).json({ message: "Room type updated successfully." });
  });
});

// Get room details by ID with admin's avatar and background images
app.get("/room/:id/info", (req, res) => {
  const roomId = req.params.id;

  const query = `
    SELECT r.room_id, r.room_title, r.room_type, r.admin_username, r.description, r.how2play, r.thumbnail, r.location, 
           u.fullname, (u.id + 1093046400) AS id,
           COALESCE(up.avatarImage, 'https://www.svgrepo.com/show/341256/user-avatar-filled.svg') AS avatarImage,
           up.backgroundImage
    FROM room r
    JOIN users u ON r.admin_username = u.username
    LEFT JOIN UserProfile up ON u.username = up.username
    WHERE r.room_id = ?
  `;

  pool.query(query, [roomId], (err, results) => {
    if (err) {
      console.error("Error fetching room details:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: "Room not found" });
      return;
    }

    res.json(results[0]);
  });
});

app.get("/room/:id/submited", (req, res) => {
  const roomId = req.params.id;

  const query = `
    SELECT su.username, u.fullname
    FROM submitedusers su
    JOIN users u ON su.username = u.username
    WHERE su.room_id = ?
  `;

  pool.query(query, [roomId], (err, results) => {
    if (err) {
      console.error("Error fetching submitted users:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    if (results.length === 0) {
      // res.status(404).json({ error: 'No submitted users found for this room' });
      res.json({}); // Return an empty JSON object
      return;
    }

    res.json(results);
  });
});

app.post("/submit", (req, res) => {
  const { id, username } = req.body;
  if (!id || !username) {
    return res
      .status(400)
      .json({ error: "Room ID and username are required." });
  }
  const query = "INSERT INTO submitedusers (room_id, username) VALUES (?, ?)";
  pool.query(query, [id, username], (err, result) => {
    if (err) {
      console.error("Error inserting into room table:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(201).json({ message: "Submited." });
  });
});

// Get images for a room uploaded by the admin
app.get("/room/:id/images", (req, res) => {
  const roomId = req.params.id;

  const query = `
    SELECT i.image_id, i.room_id, i.uploader_username, i.image_path, i.uploaded_at
    FROM images i
    JOIN room r ON i.room_id = r.room_id
    WHERE i.room_id = ? AND i.uploader_username = r.admin_username
  `;

  pool.query(query, [roomId], (err, results) => {
    if (err) {
      console.error("Error fetching images:", err);
      res.status(500).send("Server error");
      return;
    }
    res.json(results);
  });
});

// Get images for a room uploaded by host
app.get("/room/host/:id/userimages/:username", (req, res) => {
  const roomId = req.params.id;
  const username = req.params.username;

  pool.query(
    "SELECT * FROM images WHERE room_id = ? AND uploader_username = ?",
    [roomId, username],
    (err, results) => {
      if (err) {
        console.error("Error fetching images:", err);
        return res.status(500).json({ error: "Server error" });
      }
      res.json(results);
    }
  );
});

// Get images for a room uploaded by user
app.get("/room/:id/userimages/:username", verifyToken, (req, res) => {
  const roomId = req.params.id;
  const username = req.params.username;
  if (req.user.username !== username) {
    return res
      .status(403)
      .json({ error: "You are not authorized to access these images" });
  }

  pool.query(
    "SELECT * FROM images WHERE room_id = ? AND uploader_username = ?",
    [roomId, username],
    (err, results) => {
      if (err) {
        console.error("Error fetching images:", err);
        return res.status(500).json({ error: "Server error" });
      }
      res.json(results);
    }
  );
});

app.get("/room/:id/jobs", (req, res) => {
  const roomId = req.params.id;
  pool.query(
    "SELECT * FROM job WHERE room_id = ?",
    [roomId],
    (err, results) => {
      if (err) {
        console.error("Error fetching jobs:", err);
        res.status(500).send("Server error");
        return;
      }
      res.json(results);
    }
  );
});

app.post("/upload_job", verifyToken, (req, res) => {
  const room_id = req.body.room_id;
  const job_description = req.body.job;
  const job_owner = req.body.job_owner;
  // Check if the authenticated user matches the username from the body
  if (req.user.username !== job_owner) {
    return res
      .status(403)
      .send("You are not authorized to perform this action");
  }
  const query =
    "INSERT INTO job (room_id, job_description, job_owner) VALUES (?, ?, ?)";
  pool.query(query, [room_id, job_description, job_owner], (err, result) => {
    if (err) {
      console.error("Error inserting into job table:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(200).json({ message: "Job created successfully." });
  });
});

app.post("/signup", (req, res) => {
  const fullname = req.body.fullname;
  const username = req.body.username;
  const password = req.body.password;

  // Đầu tiên, kiểm tra xem username có trong danh sách banned users không
  pool.query(
    "SELECT * FROM banned_users WHERE username = ?",
    [username],
    function (error, results) {
      if (error) {
        return res.json({
          success: false,
          message: "alert.signUp.signupFailed",
        });
      }

      if (results.length > 0) {
        return res.json({
          success: false,
          message: "alert.signUp.banned",
        });
      }

      // Nếu username không bị cấm, tiến hành đăng ký
      pool.query(
        "INSERT INTO users (fullname, username, password) VALUES (?, ?, ?)",
        [fullname, username, password],
        function (error, results, fields) {
          if (error) {
            if (error.code === "ER_DUP_ENTRY") {
              res.json({ success: false, message: "alert.signUp.emailExists" });
            } else {
              res.json({
                success: false,
                message: "alert.signUp.signupFailed",
              });
            }
          } else {
            res.json({ success: true, message: "alert.signUp.signupSuccess" });
          }
        }
      );
    }
  );
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Đầu tiên, kiểm tra xem username có trong danh sách banned users không
  pool.query(
    "SELECT * FROM banned_users WHERE username = ?",
    [username],
    function (banError, banResults) {
      if (banError) {
        console.error("Database query error:", banError);
        return res
          .status(500)
          .json({ success: false, message: "alert.login.loginFailed" });
      }

      if (banResults.length > 0) {
        return res.json({
          success: false,
          message: "alert.login.banned",
        });
      }

      // Nếu không bị cấm, tiếp tục với quá trình đăng nhập
      pool.query(
        "SELECT * FROM users WHERE username = ?",
        [username],
        function (error, results, fields) {
          if (error) {
            console.error("Database query error:", error);
            return res
              .status(500)
              .json({
                success: false,
                message: "An error occurred during login.",
              });
          }

          if (results.length > 0) {
            if (password === results[0].password) {
              // Create a token
              const token = jwt.sign(
                { username: username },
                process.env.SECRET_KEY,
                { expiresIn: "1d" }
              );
              res.json({
                success: true,
                message: "Logged in successfully",
                token: token,
                fullname: results[0].fullname,
                username: results[0].username,
                id: results[0].id + 1093046400,
              });
            } else {
              res.json({
                success: false,
                message: "alert.login.incorrect",
              });
            }
          } else {
            res.json({
              success: false,
              message: "alert.login.notFound",
            });
          }
        }
      );
    }
  );
});

//api line login
app.post("/line/callback", async (req, res) => {
  const code = req.body.code;
  const url = req.body.url;

  try {
    // Gửi yêu cầu để lấy access token
    const tokenResponse = await fetch("https://api.line.me/oauth2/v2.1/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: url + "/line", // URL callback của bạn
        client_id: process.env.LINE_CLIENT_ID, // Channel ID của bạn
        client_secret: process.env.LINE_CLIENT_SECRET, // Channel Secret của bạn
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenResponse.ok) {
      // Giải mã id_token
      const decodedIdToken = jwt.decode(tokenData.id_token); // Sử dụng jwt.decode để giải mã

      // Trả về thông tin người dùng
      res.json({
        userId: decodedIdToken.sub, // ID người dùng
        name: decodedIdToken.name, // Tên người dùng
        email: decodedIdToken.email || null, // Email (nếu có)
        picture: decodedIdToken.picture || null, // URL ảnh đại diện
      });
    } else {
      res.status(400).json({ error: tokenData.error });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//api google login
app.post("/google-login", (req, res) => {
  const { username, fullname, picture } = req.body;

  // Kiểm tra xem người dùng có trong danh sách bị cấm không
  pool.query(
    "SELECT * FROM banned_users WHERE username = ?",
    [username],
    function (banError, banResults) {
      if (banError) {
        console.error("Database query error:", banError);
        return res
          .status(500)
          .json({ success: false, message: "alert.login.loginFailed" });
      }

      if (banResults.length > 0) {
        return res
          .status(403)
          .json({ success: false, message: "alert.login.banned" });
      }

      // Nếu không bị cấm, tiếp tục kiểm tra xem người dùng đã tồn tại chưa
      pool.query(
        "SELECT * FROM users WHERE username = ?",
        [username],
        function (error, results) {
          if (error) {
            console.error("Database query error:", error);
            return res
              .status(500)
              .json({ success: false, message: "alert.login.loginFailed" });
          }

          if (results.length > 0) {
            // Username đã tồn tại, trả về JWT token
            const token = jwt.sign(
              { username: username },
              process.env.SECRET_KEY,
              { expiresIn: "1d" }
            );

            res.json({
              success: true,
              message: "Logged in successfully with Google",
              token: token,
              fullname: results[0].fullname,
              username: results[0].username,
              id: results[0].id + 1093046400,
            });
          } else {
            // Username chưa tồn tại, thực hiện đăng ký
            const randomPassword = uuidv4();
            pool.query(
              "INSERT INTO users (fullname, username, password) VALUES (?, ?, ?)",
              [fullname, username, randomPassword],
              function (error, results) {
                if (error) {
                  console.error("Database insert error:", error);
                  return res
                    .status(500)
                    .json({
                      success: false,
                      message: "alert.login.loginFailed",
                    });
                }

                pool.query(
                  "INSERT INTO UserProfile (username, avatarImage) VALUES (?, ?)",
                  [username, picture],
                  function (error) {
                    if (error) {
                      console.error(
                        "Database insert error for UserProfile:",
                        error
                      );
                      return res
                        .status(500)
                        .json({
                          success: false,
                          message: "alert.login.loginFailed",
                        });
                    }

                    const token = jwt.sign(
                      { username: username },
                      process.env.SECRET_KEY,
                      { expiresIn: "1d" }
                    );
                    res.json({
                      success: true,
                      message:
                        "Registered and logged in successfully with Google",
                      token: token,
                      fullname: fullname,
                      username: username,
                      id: results.insertId + 1093046400,
                    });
                  }
                );
              }
            );
          }
        }
      );
    }
  );
});

app.post("/adminlogin", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  pool.query(
    "SELECT * FROM admin_account WHERE username = ?",
    [username],
    function (error, results, fields) {
      if (error) throw error;

      if (results.length > 0) {
        if (password === results[0].password) {
          // Create a token
          const token = jwt.sign(
            { username: username },
            process.env.SECRET_KEY,
            { expiresIn: "7d" }
          );

          // Send success message along with the token
          res.json({
            success: true,
            message: "Logged in successfully",
            token: token,
            fullname: results[0].fullname,
            username: results[0].username,
          });
        } else {
          res.json({
            success: false,
            message: "Incorrect Username and/or Password!",
          });
        }
      } else {
        res.json({
          success: false,
          message: "Username not found! Please register!",
        });
      }
    }
  );
});

app.post("/verify-token", (req, res) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.sendStatus(401); // No Authorization header
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401); // No token after "Bearer"
  }

  try {
    // Decode token without verification to check expiration
    const decodedToken = jwt.decode(token);

    if (!decodedToken) {
      return res.json({
        success: false,
        message: "Invalid token format",
      });
    }

    const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds

    // Check if token is expired
    if (decodedToken.exp < currentTime) {
      return res.json({
        success: false,
        message: "Token has expired",
      });
    }

    // Verify token signature and validity
    jwt.verify(token, process.env.SECRET_KEY, async (err, user) => {
      if (err) {
        return res.json({
          success: false,
          message: "Token not valid",
        });
      }

      // Check if user exists in database
      const query = "SELECT username FROM users WHERE username = ?";
      pool.query(query, [user.username], (dbErr, results) => {
        if (dbErr) {
          console.error("Database query error:", dbErr);
          return res.status(500).json({
            success: false,
            message: "Internal server error",
          });
        }

        if (results.length === 0) {
          return res.json({
            success: false,
            message: "User not found",
          });
        }

        return res.json({
          success: true,
          message: "Token is valid",
          user: results[0],
          exp: decodedToken.exp, // Return expiration time
        });
      });
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return res.json({
      success: false,
      message: "Invalid token format",
    });
  }
});

app.post("/verify-token-admin", (req, res) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.sendStatus(401); // No Authorization header
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401); // No token after "Bearer"
  }

  try {
    jwt.verify(token, process.env.SECRET_KEY, async (err, user) => {
      if (err) {
        return res.json({ success: false, message: "Token not valid" });
      }

      // Check if the user exists in the database
      const query = "SELECT username FROM admin_account WHERE username = ?";
      pool.query(query, [user.username], (dbErr, results) => {
        if (dbErr) {
          console.error("Database query error:", dbErr);
          return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
        }

        if (results.length === 0) {
          return res.json({ success: false, message: "User not found" });
        }

        return res.json({
          success: true,
          message: "Token is valid",
          user: results[0],
        });
      });
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return res.json({
      success: false,
      message: "Invalid token format",
    });
  }
});

//update room title
app.put("/host/room/update-title/:id", verifyToken, (req, res) => {
  const roomId = req.params.id;
  const { room_title, username } = req.body;

  // Check if the user is authorized to update the fullname
  if (req.user.username !== username) {
    return res
      .status(403)
      .send("You are not authorized to update this fullname");
  }
  // Check if the room title is provided
  if (!room_title) {
    return res.status(400).send("Room title is required");
  }

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection:", err);
      return res.status(500).send("Server error");
    }

    // Verify that the user is the admin of the room
    const verifyAdminQuery =
      "SELECT admin_username FROM room WHERE room_id = ?";
    connection.query(verifyAdminQuery, [roomId], (err, results) => {
      if (err) {
        connection.release();
        console.error("Error verifying admin:", err);
        return res.status(500).json({ error: "Server error" });
      }

      if (results.length === 0) {
        connection.release();
        return res.status(404).json({ message: "Room not found" });
      }

      const adminUsername = results[0].admin_username;
      if (adminUsername !== username) {
        connection.release();
        return res
          .status(403)
          .send("You are not authorized to update this room title");
      }

      // Proceed with updating the room title
      const updateQuery = "UPDATE room SET room_title = ? WHERE room_id = ?";
      connection.query(updateQuery, [room_title, roomId], (err, results) => {
        connection.release();

        if (err) {
          console.error("Error updating room title:", err);
          return res.status(500).json({ error: "Server error" });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({ message: "Room not found" });
        }

        res.json({ message: "Room title updated successfully" });
      });
    });
  });
});

//update password for user
app.put("/user/update/password/:username", verifyToken, (req, res) => {
  const username = req.params.username;
  const password = req.body.password;

  // Check if the user is authorized to update the password
  if (req.user.username !== username) {
    return res
      .status(403)
      .send("You are not authorized to update this password");
  }

  pool.query(
    "UPDATE users SET password = ? WHERE username = ?",
    [password, username],
    (err, results) => {
      if (err) {
        console.error("Error updating user:", err);
        res.status(500).send("Server error");
        return;
      }
      res.send("Password updated successfully.Please login again!");
    }
  );
});

//update fullname for user
app.put("/user/update/fullname/:username", verifyToken, (req, res) => {
  const username = req.params.username;
  const fullname = req.body.fullname;

  // Check if the user is authorized to update the fullname
  if (req.user.username !== username) {
    return res
      .status(403)
      .send("You are not authorized to update this fullname");
  }

  pool.query(
    "UPDATE users SET fullname = ? WHERE username = ?",
    [fullname, username],
    (err, results) => {
      if (err) {
        console.error("Error updating user:", err);
        res.status(500).send("Server error");
        return;
      }
      res.send("Fullname updated successfully");
    }
  );
});

//reward
// Add a new reward
app.post("/reward", (req, res) => {
  const { room_id, username, gift, used, gift_expiration } = req.body;

  pool.query(
    "INSERT INTO reward (room_id, username, gift, used, gift_expiration) VALUES (?, ?, ?, ?, ?)",
    [room_id, username, gift, used, gift_expiration],
    (err, results) => {
      if (err) {
        console.error("Error adding reward:", err);
        return res.status(500).json({ error: "Server error" });
      }
      res.status(201).json({ message: "Reward added successfully" });
    }
  );
});

// Check if a record exists in denyjob by room_id and username
app.get("/denycheck/:room_id/:username", (req, res) => {
  const room_id = req.params.room_id;
  const username = req.params.username;
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting database connection:", err);
      return res.status(500).send("Database connection error");
    }

    try {
      const query = "SELECT * FROM denyjob WHERE room_id = ? AND username = ?";
      connection.query(query, [room_id, username], (err, results) => {
        if (err) {
          console.error("Error checking denyjob record:", err);
          return res.status(500).json({ error: "Server error" });
        }

        if (results.length === 0) {
          return res.status(200).json({ message: "Not denied" });
        }

        res.status(200).json({ message: "Denied" });
      });
    } catch (err) {
      console.error("Unexpected error:", err);
      res.status(500).json({ error: "Unexpected error" });
    } finally {
      connection.release();
    }
  });
});

// Add denyjob record
app.post("/denyjob", (req, res) => {
  const { room_id, username } = req.body;

  if (!room_id || !username) {
    console.error("Missing room_id or username in request body");
    return res.status(400).send("Bad Request: Missing room_id or username");
  }

  pool.query(
    "INSERT INTO denyjob (room_id, username) VALUES (?, ?)",
    [room_id, username],
    (err, results) => {
      if (err) {
        console.error("Error adding denyjob record:", err);
        return res.status(500).send("Server error");
      }

      res.status(201).send("Denied");
    }
  );
});

app.delete("/deletedeny/:room_id/:username", (req, res) => {
  const room_id = req.params.room_id;
  const username = req.params.username;

  pool.query(
    "DELETE FROM denyjob WHERE room_id = ? AND username = ?",
    [room_id, username],
    (err, results) => {
      if (err) {
        console.error("Error deleting denyjob record:", err);
        return res.status(500).send("Server error");
      }

      res.status(200).send("Record deleted successfully");
    }
  );
});

//admin

// Get sum of rooms, empty rooms, and private rooms
app.get("/admin/room/dashboard", (req, res) => {
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM room) AS total_rooms,
      (SELECT COUNT(*) FROM room r LEFT JOIN room_users ru ON r.room_id = ru.room_id WHERE ru.room_id IS NULL) AS empty_rooms,
      (SELECT COUNT(*) FROM room WHERE room_type = 'private') AS private_rooms
  `;

  pool.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching room data:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    const data = result[0] || {
      total_rooms: 0,
      empty_rooms: 0,
      private_rooms: 0,
    };
    res.json(data);
  });
});

//api to delete a user from submitedusers table
app.delete("/host/delete/submiteduser/:room_id/:username", (req, res) => {
  const room_id = req.params.room_id;
  const username = req.params.username;

  pool.query(
    "DELETE FROM submitedusers WHERE room_id = ? AND username = ?",
    [room_id, username],
    (err, results) => {
      if (err) {
        console.error("Error deleting submitted user:", err);
        return res.status(500).send("Server error");
      }

      res.status(200).send("User deleted successfully");
    }
  );
});

// API to get total number of users and active users
app.get("/admin/user/dashboard", (req, res) => {
  // Query 1: Total number of users
  pool.query(
    "SELECT COUNT(*) AS total_users FROM users",
    (err, totalUsersResult) => {
      if (err) {
        console.error("Error fetching total users:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      const totalUsers = totalUsersResult[0]?.total_users || 0;

      // Query 2: Total number of active users
      pool.query(
        `
      SELECT COUNT(DISTINCT u.username) AS active_users
      FROM users u
      LEFT JOIN room r ON u.username = r.admin_username
      LEFT JOIN room_users ru ON u.username = ru.username
      WHERE r.admin_username IS NOT NULL OR ru.username IS NOT NULL
    `,
        (err, activeUsersResult) => {
          if (err) {
            console.error("Error fetching active users:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }
          const activeUsers = activeUsersResult[0]?.active_users || 0;

          // Return the result
          res.json({ total_users: totalUsers, active_users: activeUsers });
        }
      );
    }
  );
});

app.get("/admin/roommanager", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const search = req.query.search || "";
  const filter = req.query.filter || "all";
  const maxPlayers = parseInt(req.query.maxPlayers) || 10;

  let baseQuery = `
    FROM room 
    LEFT JOIN room_users ON room.room_id = room_users.room_id 
    LEFT JOIN users ON room.admin_username = users.username
  `;

  let whereClauses = [];
  if (search) {
    whereClauses.push(
      `(room.room_id LIKE ? OR users.fullname LIKE ? OR room.admin_username LIKE ? OR room.room_title LIKE ? OR room.room_type LIKE ?)`
    ); // Updated to include room_title
  }
  if (filter === "empty") {
    whereClauses.push(`room.room_id NOT IN (SELECT room_id FROM room_users)`);
  } else if (filter === "over_max") {
    whereClauses.push(
      `(SELECT COUNT(*) FROM room_users WHERE room_users.room_id = room.room_id) > ?`
    );
  }

  let whereClause = "";
  if (whereClauses.length > 0) {
    whereClause = " WHERE " + whereClauses.join(" AND ");
  }

  let query = `
    SELECT 
      room.room_id, 
      room.room_title,
      room.room_type,
      room.admin_username AS room_owner, 
      users.fullname AS admin_fullname,
      COUNT(room_users.username) AS room_members 
    ${baseQuery}
    ${whereClause}
    GROUP BY room.room_id, room.admin_username, users.fullname
    LIMIT ?, ?;
  `;

  let countQuery = `
    SELECT COUNT(DISTINCT room.room_id) AS total
    ${baseQuery}
    ${whereClause};
  `;

  const queryParams = [];
  if (search) {
    queryParams.push(
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      `%${search}%`
    ); // Include room_title in search params
  }
  if (filter === "over_max") {
    queryParams.push(maxPlayers);
  }
  const countQueryParams = [...queryParams];
  queryParams.push(offset, limit);

  pool.query(countQuery, countQueryParams, (err, countResults) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const total = countResults[0].total;

    pool.query(query, queryParams, (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ rooms: results, total });
    });
  });
});

// lấy thông tin room có bao nhiêu member từ room_users
app.get("/room/:id/members", (req, res) => {
  const roomId = req.params.id;
  const query = "SELECT COUNT(*) AS members FROM room_users WHERE room_id = ?";
  pool.query(query, [roomId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results[0]);
  });
});

// lấy thông tin các users
app.get("/admin/users", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const searchTerm = req.query.searchTerm || "";
  const filterOption = req.query.filterOption || "all";
  const minCreatedRooms = parseInt(req.query.minCreatedRooms) || 1;

  let baseQuery = `
    SELECT 
      u.fullname, 
      u.username, 
      (SELECT COUNT(*) FROM room_users ru WHERE ru.username = u.username) AS joined_rooms,
      (SELECT COUNT(*) FROM room r WHERE r.admin_username = u.username) AS created_rooms
    FROM users u
  `;

  let countQuery = `SELECT COUNT(*) AS total FROM users u`;
  let whereConditions = [];
  let queryParams = [];

  // Add searchTerm filter
  if (searchTerm) {
    whereConditions.push(`u.fullname LIKE ? OR u.username LIKE ?`);
    queryParams.push(`%${searchTerm}%`, `%${searchTerm}%`);
  }

  // Add filterOption filter
  if (filterOption === "over_min") {
    whereConditions.push(
      `(SELECT COUNT(*) FROM room r WHERE r.admin_username = u.username) >= ?`
    );
    queryParams.push(minCreatedRooms);
  } else if (filterOption === "inactive") {
    whereConditions.push(
      `(SELECT COUNT(*) FROM room r WHERE r.admin_username = u.username) = 0 AND (SELECT COUNT(*) FROM room_users ru WHERE ru.username = u.username) = 0`
    );
  }

  // Add WHERE clause if there are any conditions
  if (whereConditions.length > 0) {
    baseQuery += ` WHERE ${whereConditions.join(" AND ")}`;
    countQuery += ` WHERE ${whereConditions.join(" AND ")}`;
  }

  // Add pagination to the query
  baseQuery += ` LIMIT ?, ?`;
  queryParams.push(offset, limit);

  // Execute count query to get total number of users
  pool.query(
    countQuery,
    queryParams.slice(0, queryParams.length - 2),
    (err, countResults) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      const total = countResults[0]?.total || 0;

      // Execute main query to get list of users
      pool.query(baseQuery, queryParams, (err, results) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ users: results, total });
      });
    }
  );
});

// POST endpoint to add a rewarded user
app.post("/rewarded_users", (req, res) => {
  const { room_id, username } = req.body;

  if (!room_id || !username) {
    return res.status(400).send("room_id and username are required");
  }

  const query = "INSERT INTO rewarded_users (room_id, username) VALUES (?, ?)";
  pool.query(query, [room_id, username], (error, results) => {
    if (error) {
      console.error("Error inserting into rewarded_users table:", error);
      return res.status(500).send("Internal Server Error");
    }
    res.status(201).send("User rewarded successfully");
  });
});

// Route to check if user is rewarded
app.get("/rewarded_users/check", (req, res) => {
  const { room_id, username } = req.query;

  if (!room_id || !username) {
    return res.status(400).send("room_id and username are required");
  }

  const query = `
    SELECT COUNT(*) AS count FROM (
      SELECT room_id, username FROM rewarded_users WHERE room_id = ? AND username = ?
      UNION
      SELECT room_id, username FROM submitedusers WHERE room_id = ? AND username = ?
    ) AS combined_results
  `;

  pool.query(
    query,
    [room_id, username, room_id, username],
    (error, results) => {
      if (error) {
        console.error("Error checking reward status:", error);
        return res.status(500).send("Internal Server Error");
      }
      const isRewarded = results[0].count > 0;
      res.status(200).json({ isRewarded });
    }
  );
});

// API delete room for admin
app.delete("/delete/room/:id", (req, res) => {
  const roomId = req.params.id;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Database connection error:", err);
      return res.status(500).json({ error: "Database connection error" });
    }

    connection.beginTransaction(async (err) => {
      if (err) {
        console.error("Transaction start error:", err);
        connection.release();
        return res.status(500).send("Server error");
      }

      try {
        // Lấy đường dẫn hình ảnh
        const [imageResults] = await connection
          .promise()
          .query("SELECT image_path FROM images WHERE room_id = ?", [roomId]);

        // Xoá hình ảnh từ Firebase Storage
        const deleteImagePromises = imageResults.map((row) => {
          const imagePath = row.image_path;
          const fileRef = ref(storage, imagePath);
          return deleteObject(fileRef).catch((error) => {
            console.error(`Error deleting file at ${imagePath}:`, error);
            // Bỏ qua lỗi và tiếp tục
          });
        });

        await Promise.all(deleteImagePromises);

        // Xoá phòng (các bảng liên quan sẽ tự động xóa nhờ ON DELETE CASCADE)
        await connection
          .promise()
          .query("DELETE FROM room WHERE room_id = ?", [roomId]);

        connection.commit((err) => {
          if (err) {
            console.error("Transaction commit error:", err);
            connection.rollback(() => {
              connection.release();
              return res.status(500).send("Server error");
            });
          }
          connection.release();
          res.json({
            message: "Room and all related data deleted successfully",
          });
        });
      } catch (error) {
        console.error("Error during transaction:", error);
        connection.rollback(() => {
          connection.release();
          return res.status(500).send("Server error");
        });
      }
    });
  });
});

// User delete them room
app.delete("/user/delete/room/:id/:username", verifyToken, async (req, res) => {
  const roomId = req.params.id;
  const username = req.params.username;

  // Check if the user is authorized to delete the room
  if (req.user.username !== username) {
    return res
      .status(403)
      .json({ error: "You are not authorized to delete this room" });
  }

  // Start a transaction
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection:", err);
      return res.status(500).send("Server error");
    }

    connection.beginTransaction(async (err) => {
      if (err) {
        console.error("Error starting transaction:", err);
        return res.status(500).send("Server error");
      }

      try {
        // Get image paths from images table
        const [imageResults] = await connection
          .promise()
          .query("SELECT image_path FROM images WHERE room_id = ?", [roomId]);

        // Delete image files from Firebase Storage
        const deleteImagePromises = imageResults.map((row) => {
          const imagePath = row.image_path;
          const fileRef = ref(storage, imagePath);
          return deleteObject(fileRef).catch((error) => {
            console.error(`Error deleting file at ${imagePath}:`, error);
            // Ignore the error and continue
          });
        });

        await Promise.all(deleteImagePromises);

        // Delete from room table (các bảng liên quan sẽ tự động xóa nhờ ON DELETE CASCADE)
        await connection
          .promise()
          .query("DELETE FROM room WHERE room_id = ?", [roomId]);

        connection.commit((err) => {
          if (err) {
            return connection.rollback(() => {
              console.error("Error committing transaction:", err);
              res.status(500).send("Server error");
            });
          }

          connection.release();
          res.send("Room and related data deleted successfully");
        });
      } catch (error) {
        connection.rollback(() => {
          console.error("Error during transaction:", error);
          res.status(500).send("Server error");
        });
      }
    });
  });
});

// Admin delete a user and all related data
app.delete("/delete/user/:username", async (req, res) => {
  const username = req.params.username;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Database connection error:", err);
      return res.status(500).json({ error: "Database connection error" });
    }

    connection.beginTransaction(async (err) => {
      if (err) {
        console.error("Transaction start error:", err);
        connection.release();
        return res.status(500).send("Server error");
      }

      try {
        // Fetch images associated with the user
        const [imageResults] = await connection
          .promise()
          .query("SELECT image_path FROM images WHERE uploader_username = ?", [
            username,
          ]);

        // Delete images from Firebase Storage
        const deleteImagePromises = imageResults.map((row) => {
          const imagePath = row.image_path;
          const fileRef = ref(storage, imagePath);
          return deleteObject(fileRef).catch((error) => {
            console.error(`Error deleting file at ${imagePath}:`, error);
            // Ignore the error and continue
          });
        });

        await Promise.all(deleteImagePromises);

        // Delete from users table (các bảng liên quan sẽ tự động xóa nhờ ON DELETE CASCADE)
        await connection
          .promise()
          .query("DELETE FROM users WHERE username = ?", [username]);

        connection.commit((err) => {
          if (err) {
            return connection.rollback(() => {
              console.error("Transaction commit error:", err);
              res.status(500).send("Server error");
            });
          }
          connection.release();
          res.json({
            message: "User and all related data deleted successfully",
          });
        });
      } catch (error) {
        connection.rollback(() => {
          console.error("Error during transaction:", error);
          res.status(500).send("Server error");
        });
      }
    });
  });
});

app.post("/ban/user/:username", (req, res) => {
  const { username } = req.params;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const query = "INSERT INTO banned_users (username) VALUES (?)";

  pool.query(query, [username], (error, results) => {
    if (error) {
      console.error("Error banning user:", error);
      return res
        .status(500)
        .json({ error: "An error occurred while banning the user" });
    }

    if (results.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "User not found or already banned" });
    }

    res.status(200).json({ message: "User banned successfully" });
  });
});

app.get("/admin/getinfo/:username", (req, res) => {
  const username = req.params.username;
  pool.query(
    "SELECT * FROM admin_account WHERE username = ?",
    [username],
    (err, results) => {
      if (err) {
        console.error("Error fetching user:", err);
        res.status(500).send("Server error");
        return;
      }

      if (results.length === 0) {
        res.status(404).send("User not found");
        return;
      }

      res.json(results[0]);
    }
  );
});

app.put("/admin/update/:username", verifyToken, (req, res) => {
  const username = req.params.username;
  const password = req.body.password;
  // Check if the user is authorized to update the password
  if (req.user.username !== username) {
    return res.status(403).json({ error: "You are not authorized" });
  }

  pool.query(
    "UPDATE admin_account SET password = ? WHERE username = ?",
    [password, username],
    (err, results) => {
      if (err) {
        console.error("Error updating user:", err);
        res.status(500).send("Server error");
        return;
      }
      res.send("Password updated successfully");
    }
  );
});

// User leave room
app.delete("/user/leave/room/:room_id/:username", async (req, res) => {
  const username = req.params.username;
  const room_id = req.params.room_id;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection:", err);
      res.status(500).json({ message: "Server error" });
      return;
    }

    connection.beginTransaction(async (err) => {
      if (err) {
        console.error("Error starting transaction:", err);
        res.status(500).json({ message: "Server error" });
        return;
      }

      try {
        // Fetch images associated with the user in the room
        const [imageResults] = await connection
          .promise()
          .query(
            "SELECT image_path FROM images WHERE uploader_username = ? AND room_id = ?",
            [username, room_id]
          );

        // Delete images from Firebase Storage
        const deleteImagePromises = imageResults.map((row) => {
          const imagePath = row.image_path;
          const fileRef = ref(storage, imagePath);
          return deleteObject(fileRef).catch((error) => {
            console.error(`Error deleting file at ${imagePath}:`, error);
            // Ignore the error and continue
          });
        });

        await Promise.all(deleteImagePromises);

        // Delete images from images table
        await connection
          .promise()
          .query(
            "DELETE FROM images WHERE uploader_username = ? AND room_id = ?",
            [username, room_id]
          );

        // Delete user-related data in the specified room
        await connection
          .promise()
          .query("DELETE FROM room_users WHERE username = ? AND room_id = ?", [
            username,
            room_id,
          ]);

        connection.commit((err) => {
          if (err) {
            return connection.rollback(() => {
              console.error("Error committing transaction:", err);
              res.status(500).json({ message: "Server error" });
            });
          }

          connection.release();
          res.json({
            message:
              "User-related data in the specified room deleted successfully",
          });
        });
      } catch (error) {
        connection.rollback(() => {
          console.error("Error during transaction:", error);
          res.status(500).json({ message: "Server error" });
        });
      }
    });
  });
});

// Deny user submit
app.delete("/deny/user/:username/room/:room_id", (req, res) => {
  const username = req.params.username;
  const room_id = req.params.room_id;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection:", err);
      res.status(500).json({ message: "Server error" });
      return;
    }

    connection.beginTransaction(async (err) => {
      if (err) {
        console.error("Error starting transaction:", err);
        res.status(500).json({ message: "Server error" });
        return;
      }

      try {
        // Fetch image paths from the database
        const [imageResults] = await connection
          .promise()
          .query(
            "SELECT image_path FROM images WHERE uploader_username = ? AND room_id = ?",
            [username, room_id]
          );

        // Delete images from Firebase Storage
        const deleteImagePromises = imageResults.map((row) => {
          const imagePath = row.image_path;
          const fileRef = ref(storage, imagePath);
          return deleteObject(fileRef).catch((error) => {
            console.error(`Error deleting file at ${imagePath}:`, error);
            // Ignore the error and continue
          });
        });

        await Promise.all(deleteImagePromises);

        // Delete images from images table
        await connection
          .promise()
          .query(
            "DELETE FROM images WHERE uploader_username = ? AND room_id = ?",
            [username, room_id]
          );

        // Delete user-related data in the specified room
        await connection
          .promise()
          .query(
            "DELETE FROM submitedusers WHERE username = ? AND room_id = ?",
            [username, room_id]
          );

        connection.commit((err) => {
          if (err) {
            return connection.rollback(() => {
              console.error("Error committing transaction:", err);
              res.status(500).json({ message: "Server error" });
            });
          }

          connection.release();
          res.json({
            message:
              "User-related data in the specified room deleted successfully",
          });
        });
      } catch (error) {
        connection.rollback(() => {
          console.error("Error during transaction:", error);
          res.status(500).json({ message: "Server error" });
        });
      }
    });
  });
});

//api forgot password
app.post("/forgot-password", (req, res) => {
  const { email } = req.body;

  pool.query(
    "SELECT users.username, otp.otp_expiry FROM users LEFT JOIN otp ON users.username = otp.username WHERE users.username = ?",
    [email],
    (err, results) => {
      if (err) {
        console.error("Error fetching user:", err);
        return res.status(500).json({ error: "Server error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "alert.login.notFound" });
      }

      const username = results[0].username;
      const otpExpiry = results[0].otp_expiry;

      if (otpExpiry && Date.now() < otpExpiry) {
        const waitTime = Math.ceil((otpExpiry - Date.now()) / 60000); // Calculate wait time in minutes
        return res.status(400).json({
          error: `OTP already sent. Please wait ${waitTime} minute(s) before requesting a new one.`,
        });
      }

      // Generate a random 4-digit OTP
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      const otpExpiryNew = Date.now() + 900000; // Expiry time is 15 minutes later

      // Save the new OTP in the otp table, replacing the old one if it exists
      pool.query(
        "REPLACE INTO otp (username, otp, otp_expiry) VALUES (?, ?, ?)",
        [username, otp, otpExpiryNew],
        (err, results) => {
          if (err) {
            console.error("Error saving OTP:", err);
            return res.status(500).json({ error: "Server error" });
          }

          const mailOptions = {
            from: `Tekutoko <${process.env.EMAIL}>`,
            to: email,
            subject: "Password Reset OTP",
            html: `
              <p>You requested a password reset</p>
              <p>Your OTP code is: <strong>${otp}</strong></p>
              <p>This code will expire in 15 minutes. Please do not share this code with anyone.</p>
            `,
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error("Error sending email:", error);
              return res.status(500).json({ error: "Server error" });
            }

            res.json({ message: "Email sent successfully" });
          });
        }
      );
    }
  );
});

//api verify OTP/
app.post("/verify-otp", (req, res) => {
  const { username, otp } = req.body;

  pool.query(
    "SELECT otp_expiry FROM otp WHERE username = ? AND otp = ?",
    [username, otp],
    (err, results) => {
      if (err) {
        console.error("Error verifying OTP:", err);
        return res.status(500).json({ error: "Server error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Invalid OTP" });
      }

      const otpExpiry = results[0].otp_expiry;

      if (Date.now() > otpExpiry) {
        return res
          .status(400)
          .json({ error: "OTP has expired. Please request a new one." });
      }

      res.json({ message: "OTP verified successfully" });
    }
  );
});
//api change password after OTP verified
app.put("/change-password-forgot", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  pool.query(
    "UPDATE users SET password = ? WHERE username = ?",
    [password, username],
    (err, results) => {
      if (err) {
        console.error("Error updating password:", err);
        return res.status(500).json({ error: "Server error" });
      }

      res.json({ message: "Password updated successfully" });
    }
  );
});

// add info profile
app.post("/info/userprofile", verifyToken, (req, res) => {
  const {
    username,
    avatarImage,
    backgroundImage,
    job,
    description,
    address,
    instagram,
    twitter,
    linkedin,
    facebook,
    homepage,
  } = req.body;
  if (req.user.username !== username) {
    return res.status(403).json({ error: "You are not authorized" });
  }
  // Kiểm tra sự tồn tại của username và xóa nếu đã tồn tại
  const deleteSql = "DELETE FROM UserProfile WHERE username = ?";
  pool.query(deleteSql, [username], (deleteErr) => {
    if (deleteErr) {
      return res.status(500).send(deleteErr);
    }

    // Tiếp tục thêm profile mới
    const sql =
      "INSERT INTO UserProfile (username, avatarImage, backgroundImage, job, description, address, instagram, twitter, linkedin, facebook, homepage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    pool.query(
      sql,
      [
        username,
        avatarImage,
        backgroundImage,
        job,
        description,
        address,
        instagram,
        twitter,
        linkedin,
        facebook,
        homepage,
      ],
      (err, result) => {
        if (err) {
          y;
          return res.status(500).send(err);
        }
        res.send("User profile added");
      }
    );
  });
});

// get info profile
app.get("/info/userprofile/:username", (req, res) => {
  const encodedId = req.params.username;
  const username = parseInt(encodedId, 10) - 1093046400;

  // Kiểm tra nếu `username` không phải là số hợp lệ
  if (isNaN(username)) {
    return res.status(400).json({ message: "Invalid username parameter" });
  }

  const sql = `
    SELECT UserProfile.avatarImage, UserProfile.backgroundImage, UserProfile.job, 
       UserProfile.description, UserProfile.address, 
       UserProfile.instagram, UserProfile.twitter, 
       UserProfile.linkedin, UserProfile.facebook, 
       UserProfile.homepage, users.fullname,
       users.following_count AS followCount,
       users.follower_count AS followerCount
    FROM UserProfile 
    JOIN users ON UserProfile.username = users.username 
    WHERE users.id = ?;
  `;
  pool.query(sql, [username], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (result.length === 0) {
      return res.status(404).send({ message: "User profile not found" });
    }
    res.json(result[0]);
  });
});

//api upload avatar
app.post("/avatar/upload", verifyToken, async (req, res) => {
  const { username, files } = req.body;
  if (!username || !files || files.length === 0) {
    return res
      .status(400)
      .json({ error: "Username and file URLs are required." });
  }
  try {
    res.status(200).json({ fileUrls: files });
  } catch (error) {
    console.error("Error saving file URLs to database:", error);
    return res
      .status(500)
      .json({ error: "Failed to save file URLs to the database" });
  }
});

//api upload background
app.post("/background/upload", verifyToken, async (req, res) => {
  const { username, files } = req.body;
  if (!username || !files || files.length === 0) {
    return res
      .status(400)
      .json({ error: "Username and file URLs are required." });
  }
  try {
    res.status(200).json({ fileUrls: files });
  } catch (error) {
    console.error("Error saving file URLs to database:", error);
    return res
      .status(500)
      .json({ error: "Failed to save file URLs to the database" });
  }
});

// check profile exists
app.get("/check-profile/:username", (req, res) => {
  const username = req.params.username;
  const query = "SELECT * FROM UserProfile WHERE username = ?";

  pool.query(query, [username], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length > 0) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(200).json({ exists: false });
    }
  });
});

// delete profile
app.delete("/delete-profile/:username", (req, res) => {
  const username = req.params.username;
  const query = "DELETE FROM UserProfile WHERE username = ?";

  pool.query(query, [username], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.affectedRows > 0) {
      return res.status(200).json({ message: "Profile deleted successfully" });
    } else {
      return res.status(404).json({ message: "Profile not found" });
    }
  });
});

// modify profile
app.put("/modify-profile/:username", verifyToken, (req, res) => {
  const {
    avatarImage,
    backgroundImage,
    job,
    description,
    address,
    instagram,
    twitter,
    linkedin,
    facebook,
    homepage,
  } = req.body;
  const username = req.params.username;
  if (req.user.username !== username) {
    return res.status(403).send("You are not authorized");
  }
  const sql = `
    UPDATE UserProfile 
    SET avatarImage = ?, backgroundImage = ?, job = ?, description = ?, address = ?, instagram = ?, twitter = ?, linkedin = ?, facebook = ?, homepage = ?
    WHERE username = ?
  `;

  pool.query(
    sql,
    [
      avatarImage,
      backgroundImage,
      job,
      description,
      address,
      instagram,
      twitter,
      linkedin,
      facebook,
      homepage,
      username,
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating profile:", err);
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows > 0) {
        return res
          .status(200)
          .json({ message: "Profile updated successfully" });
      } else {
        return res.status(404).json({ message: "Profile not found" });
      }
    }
  );
});

// API endpoint to add a voucher or ticket
app.post("/api/vouchers", verifyToken, (req, res) => {
  const {
    rewardType,
    roomId,
    hostId,
    ticketName,
    ticketDescription,
    discountName,
    discountValue,
    discountDescription,
    expirationDate,
    username,
    ticketImage,
  } = req.body;

  if (req.user.username !== username) {
    return res
      .status(403)
      .send("You are not authorized to update this voucher");
  }

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting database connection:", err);
      return res.status(500).send("Database connection error");
    }

    try {
      const sql = `
        INSERT INTO vouchers (room_id, host_room, reward_type, ticket_name, ticket_description, ticket_image_url, discount_name, discount_value, discount_description, expiration_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        roomId,
        hostId,
        rewardType,
        rewardType === "ticket" ? ticketName : null,
        rewardType === "ticket" ? ticketDescription : null,
        rewardType === "ticket" ? ticketImage : null, // Directly use the URL from client
        rewardType === "discount" ? discountName : null,
        rewardType === "discount" ? discountValue : null,
        rewardType === "discount" ? discountDescription : null,
        expirationDate,
      ];

      connection.query(sql, values, (err, result) => {
        if (err) {
          console.error("Error adding voucher or ticket:", err);
          return res.status(500).send({ message: "Internal server error" });
        }

        // Fetch the newly created voucher details
        const newVoucher = {
          voucher_id: result.insertId, // ID of the new voucher
          room_id: roomId,
          host_room: hostId,
          reward_type: rewardType,
          ticket_name: rewardType === "ticket" ? ticketName : null,
          ticket_description:
            rewardType === "ticket" ? ticketDescription : null,
          ticket_image_url: rewardType === "ticket" ? ticketImage : null,
          discount_name: rewardType === "discount" ? discountName : null,
          discount_value: rewardType === "discount" ? discountValue : null,
          discount_description:
            rewardType === "discount" ? discountDescription : null,
          expiration_date: expirationDate,
          // host_avatar_url: req.user.avatarUrl // Assuming you have the avatar URL in req.user
        };
        res
          .status(201)
          .send({
            message: "Voucher or ticket added successfully",
            voucher: newVoucher,
          });
      });
    } catch (error) {
      console.error("Error adding voucher or ticket:", error);
      res.status(500).send({ message: "Internal server error" });
    } finally {
      connection.release();
    }
  });
});

//api add voucher to user user_vouchers
app.post("/api/user-vouchers", (req, res) => {
  const { username, voucherIds } = req.body; // Expecting voucherIds to be an array
  if (!Array.isArray(voucherIds) || voucherIds.length === 0) {
    return res.status(400).send("Invalid voucherIds");
  }

  const sql = "INSERT INTO user_vouchers (username, voucher_id) VALUES ?";
  const values = voucherIds.map((voucherId) => [username, voucherId]);

  pool.query(sql, [values], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json({ message: "alert.room.giftsSentToUserSuccessfully" });
  });
});

//api get voucher by username and room_id
app.get("/api/vouchers/:username/:room_id", verifyToken, (req, res) => {
  const username = req.params.username;
  const room_id = req.params.room_id;
  if (req.user.username !== username) {
    return res
      .status(403)
      .send("You are not authorized to update this voucher");
  }
  const sql = `
    SELECT 
        v.id AS voucher_id,
        v.room_id,
        v.host_room,
        v.reward_type,
        v.ticket_name,
        v.ticket_description,
        v.ticket_image_url,
        v.discount_name,
        v.discount_value,
        v.discount_description,
        v.expiration_date,
        COALESCE(up.avatarImage, 'https://icons.veryicon.com/png/o/commerce-shopping/o2o-business-platform/coupon-59.png') AS host_avatar_url
    FROM 
        user_vouchers uv
    JOIN 
        vouchers v ON uv.voucher_id = v.id
    LEFT JOIN
        UserProfile up ON v.host_room = up.username
    WHERE 
        uv.username = ? AND v.room_id = ?
  `;
  pool.query(sql, [username, room_id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.length === 0) {
      return res.status(200).json({ message: "Voucher not found" });
    }
    res.json(result);
  });
});

//api get voucher by username
app.get("/api/vouchers/:username", (req, res) => {
  const username = req.params.username;
  const sql = `
    SELECT 
        v.id AS voucher_id,
        v.room_id,
        v.host_room,
        v.reward_type,
        v.ticket_name,
        v.ticket_description,
        v.ticket_image_url,
        v.discount_name,
        v.discount_value,
        v.discount_description,
        v.expiration_date,
        COALESCE(up.avatarImage, 'https://icons.veryicon.com/png/o/commerce-shopping/o2o-business-platform/coupon-59.png') AS host_avatar_url,
        u.fullname AS host_fullname,
        (u.id + 1093046400) AS user_id
    FROM 
        user_vouchers uv
    JOIN 
        vouchers v ON uv.voucher_id = v.id
    LEFT JOIN
        UserProfile up ON v.host_room = up.username
    JOIN
        users u ON v.host_room = u.username
    WHERE 
        uv.username = ?
  `;
  pool.query(sql, [username], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (result.length === 0) {
      return res
        .status(404)
        .json({ message: "No vouchers found for this user" });
    }
    res.json(result);
  });
});
//checkUserVoucher
app.post("/api/checkUserVoucher", (req, res) => {
  const { username, voucher_id } = req.body;
  const query =
    "SELECT * FROM user_vouchers WHERE username = ? AND voucher_id = ?";
  pool.query(query, [username, voucher_id], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  });
});

//api get info voucher by id
app.get("/api/voucher/:id", (req, res) => {
  const id = req.params.id;
  const sql = `
    SELECT 
        v.id AS voucher_id,
        v.room_id,
        v.host_room,
        v.reward_type,
        v.ticket_name,
        v.ticket_description,
        v.ticket_image_url,
        v.discount_name,
        v.discount_value,
        v.discount_description,
        v.expiration_date,
        COALESCE(up.avatarImage, 'https://icons.veryicon.com/png/o/commerce-shopping/o2o-business-platform/coupon-59.png') AS host_avatar_url
    FROM 
        vouchers v
    JOIN
        UserProfile up ON v.host_room = up.username
    WHERE 
        v.id = ?
  `;
  pool.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Voucher not found" });
    }
    res.json(result[0]);
  });
});
//api get info voucher by room_id
app.get("/get/vouchers/room/:room_id", (req, res) => {
  const room_id = req.params.room_id;
  const sql = `
    SELECT 
        v.id AS voucher_id,
        v.room_id,
        v.host_room,
        v.reward_type,
        v.ticket_name,
        v.ticket_description,
        v.ticket_image_url,
        v.discount_name,
        v.discount_value,
        v.discount_description,
        v.expiration_date,
        COALESCE(up.avatarImage, 'https://icons.veryicon.com/png/o/commerce-shopping/o2o-business-platform/coupon-59.png') AS host_avatar_url
    FROM 
        vouchers v
    LEFT JOIN
        UserProfile up ON v.host_room = up.username
    WHERE 
        v.room_id = ?
  `;
  pool.query(sql, [room_id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.length === 0) {
      return res.status(200).json({ message: "Voucher not found" });
    }
    res.json(result);
  });
});

// user delete account
app.delete("/user/delete/:username", verifyToken, (req, res) => {
  const username = req.params.username;
  // Check if the user is authorized to delete the user
  if (req.user.username !== username) {
    return res.status(403).send("You are not authorized to delete this user");
  }
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Database connection error:", err);
      return res.status(500).json({ error: "Database connection error" });
    }

    connection.beginTransaction(async (err) => {
      if (err) {
        console.error("Transaction start error:", err);
        connection.release();
        return res.status(500).send("Server error");
      }

      try {
        // Fetch images associated with the user
        const [imageResults] = await connection
          .promise()
          .query("SELECT image_path FROM images WHERE uploader_username = ?", [
            username,
          ]);

        // Delete images from Firebase Storage
        const deleteImagePromises = imageResults.map((row) => {
          const imagePath = row.image_path;
          const fileRef = ref(storage, imagePath);
          return deleteObject(fileRef).catch((error) => {
            console.error(`Error deleting file at ${imagePath}:`, error);
            // Ignore the error and continue
          });
        });

        await Promise.all(deleteImagePromises);

        // Delete from users table (các bảng liên quan sẽ tự động xóa nhờ ON DELETE CASCADE)
        await connection
          .promise()
          .query("DELETE FROM users WHERE username = ?", [username]);

        connection.commit((err) => {
          if (err) {
            return connection.rollback(() => {
              console.error("Transaction commit error:", err);
              res.status(500).send("Server error");
            });
          }
          connection.release();
          res.json({
            message: "User and all related data deleted successfully",
          });
        });
      } catch (error) {
        connection.rollback(() => {
          console.error("Error during transaction:", error);
          res.status(500).send("Server error");
        });
      }
    });
  });
});

// api /api/deleteUserVoucher
app.delete("/api/deleteUserVoucher", (req, res) => {
  const { username, voucher_id } = req.body;
  const query =
    "DELETE FROM user_vouchers WHERE username = ? AND voucher_id = ?";
  pool.query(query, [username, voucher_id], (err, results) => {
    if (err) throw err;
    res.json({ message: "User voucher deleted successfully" });
  });
});

// API xoá voucher và ảnh
app.delete("/api/deleteVoucher/:id", async (req, res) => {
  const id = req.params.id;
  const query = "SELECT ticket_image_url FROM vouchers WHERE id = ?";

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Database connection error:", err);
      return res.status(500).json({ error: "Database connection error" });
    }

    connection.beginTransaction(async (err) => {
      if (err) {
        console.error("Error starting transaction:", err);
        connection.release();
        return res.status(500).send("Server error");
      }

      try {
        // Fetch image URL from vouchers table
        const [results] = await connection.promise().query(query, [id]);

        if (results.length === 0) {
          connection.release();
          return res.status(404).json({ message: "Voucher not found" });
        }

        const ticketImageUrl = results[0].ticket_image_url;

        // Delete image from Firebase Storage
        const imagePath = ticketImageUrl;
        const fileRef = ref(storage, imagePath);

        try {
          await deleteObject(fileRef);
          console.log(`Image deleted from Firebase Storage: ${imagePath}`);
        } catch (error) {
          if (error.code === "storage/object-not-found") {
            console.warn(`Image not found in Firebase Storage: ${imagePath}`);
          } else {
            connection.release();
            return res.status(500).json({ error: error.message });
          }
        }

        // Delete related images from images table
        await connection
          .promise()
          .query("DELETE FROM images WHERE image_path = ?", [ticketImageUrl]);

        // Delete voucher from vouchers table
        await connection
          .promise()
          .query("DELETE FROM vouchers WHERE id = ?", [id]);

        connection.commit((err) => {
          if (err) {
            return connection.rollback(() => {
              console.error("Error committing transaction:", err);
              res.status(500).send("Server error");
            });
          }

          connection.release();
          res.json({
            message: "Voucher and associated images deleted successfully",
          });
        });
      } catch (error) {
        connection.rollback(() => {
          console.error("Error during transaction:", error);
          res.status(500).send("Server error");
        });
      }
    });
  });
});

// API discover room
// API discover room - Updated với sorting
app.get("/discovery/rooms", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const searchQuery = req.query.query || "";

  const query = `
    SELECT 
      room.room_id, 
      room.room_title, 
      room.thumbnail, 
      room.description, 
      users.username, 
      users.fullname, 
      COALESCE(UserProfile.avatarImage, 'https://www.svgrepo.com/show/341256/user-avatar-filled.svg') AS avatarImage,
      COUNT(room_users.username) AS memberCount,
      COALESCE(users.follower_count, 0) AS hostFollowerCount,
      (COUNT(room_users.username) + COALESCE(users.follower_count, 0)) AS popularityScore
    FROM room
    JOIN users ON room.admin_username = users.username
    LEFT JOIN UserProfile ON users.username = UserProfile.username
    LEFT JOIN room_users ON room.room_id = room_users.room_id
    WHERE (room.room_title LIKE ? 
       OR users.username LIKE ? 
       OR users.fullname LIKE ? 
       OR room.room_id LIKE ?) 
       AND room.room_type = 'public'
    GROUP BY room.room_id, room.room_title, users.username, users.fullname, UserProfile.avatarImage, users.follower_count
    ORDER BY popularityScore DESC, room.room_id ASC
    LIMIT ? OFFSET ?;
  `;

  pool.query(
    query,
    [
      `%${searchQuery}%`,
      `%${searchQuery}%`,
      `%${searchQuery}%`,
      `%${searchQuery}%`,
      limit,
      offset,
    ],
    (err, results) => {
      if (err) {
        console.error("Error fetching discovery rooms:", err);
        return res.status(500).json({
          success: false,
          error: "Failed to fetch rooms",
        });
      }

      res.json({
        success: true,
        rooms: results,
        pagination: {
          page: page,
          limit: limit,
          hasMore: results.length === limit,
        },
      });
    }
  );
});

app.get("/check_job/:room_id/:username", (req, res) => {
  const { room_id, username } = req.params;
  pool.query(
    "SELECT COUNT(*) AS hasJob FROM job WHERE room_id = ? AND job_owner = ?",
    [room_id, username],
    (error, results) => {
      if (error) {
        console.error("Error checking job:", error);
        return res.status(500).json({ message: "Server error" });
      }
      res.json({ hasJob: results[0].hasJob > 0 });
    }
  );
});

// Delete the old job description
app.delete("/delete_job/:room_id", verifyToken, (req, res) => {
  const { room_id } = req.params;
  const username = req.body.username;

  // Check if the authenticated user matches the username from the body
  if (req.user.username !== username) {
    return res
      .status(403)
      .send("You are not authorized to perform this action");
  }

  pool.query(
    "DELETE FROM job WHERE room_id = ?",
    [room_id],
    (error, results) => {
      if (error) {
        console.error("Error deleting job:", error);
        return res.status(500).json({ message: "Server error" });
      }
      if (results.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "No job found with the specified room_id." });
      }
      console.log(`Job deleted for room_id: ${room_id}`); // Debug log
      res.json({ message: "Job deleted successfully" });
    }
  );
});

// Delete old images
app.delete("/delete_images/:room_id/:username", verifyToken, (req, res) => {
  const { room_id, username } = req.params;

  if (req.user.username !== username) {
    return res
      .status(403)
      .send("You are not authorized to perform this action");
  }

  pool.query(
    "SELECT image_path FROM images WHERE room_id = ? AND uploader_username = ?",
    [room_id, username],
    (error, results) => {
      if (error) {
        console.error("Error fetching images:", error);
        return res.status(500).json({ message: "Server error" });
      }
      if (results.length === 0) {
        console.log("No images found for this user in the specified room.");
        return res
          .status(404)
          .json({
            message: "No images found for this user in the specified room.",
          });
      }

      // Assuming deleteObject and ref are Firebase functions
      const deletePromises = results.map((image) => {
        const fileRef = ref(storage, image.image_path);
        return deleteObject(fileRef)
          .then(() => {
            console.log(`Deleted image from storage: ${image.image_path}`);
          })
          .catch((error) => {
            console.warn(
              `Error deleting image from storage: ${image.image_path}`,
              error
            );
          });
      });

      Promise.all(deletePromises).then(() => {
        pool.query(
          "DELETE FROM images WHERE room_id = ? AND uploader_username = ?",
          [room_id, username],
          (error, deleteResult) => {
            if (error) {
              console.error("Error deleting images:", error);
              return res.status(500).json({ message: "Server error" });
            }
            res.json({ message: "Images deleted successfully" });
          }
        );
      });
    }
  );
});

// Xóa voucher và ảnh liên quan cũ trong bảng vouchers
app.delete("/api/delete/vouchers/:roomId/:hostId", verifyToken, (req, res) => {
  const roomId = req.params.roomId;
  const hostId = req.params.hostId;

  // Kiểm tra quyền truy cập
  if (req.user.username !== hostId) {
    return res
      .status(403)
      .send("You are not authorized to perform this action");
  }

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Database connection error:", err);
      return res.status(500).json({ error: "Database connection error" });
    }

    connection.beginTransaction(async (err) => {
      if (err) {
        console.error("Error starting transaction:", err);
        connection.release();
        return res.status(500).send("Server error");
      }

      try {
        // Lấy danh sách URL ảnh từ vouchers
        const [imageResults] = await connection
          .promise()
          .query(
            "SELECT ticket_image_url FROM vouchers WHERE room_id = ? AND ticket_image_url IS NOT NULL",
            [roomId]
          );

        // Nếu không có ảnh thì không cần xoá ảnh từ Firebase
        if (imageResults.length > 0) {
          const imagePaths = imageResults.map((row) => row.ticket_image_url);

          // Xóa file từ Firebase Storage nếu tồn tại URL ảnh
          const deleteImagePromises = imagePaths.map((imagePath) => {
            const fileRef = ref(storage, imagePath);
            return deleteObject(fileRef).catch((error) => {
              console.error(`Error deleting file at ${imagePath}:`, error);
              // Bỏ qua lỗi xóa file và tiếp tục
            });
          });

          await Promise.all(deleteImagePromises);

          // Xóa ảnh trong bảng `images` chỉ nếu `image_path` nằm trong `ticket_image_url`
          await connection
            .promise()
            .query(
              "DELETE FROM images WHERE room_id = ? AND image_path IN (?)",
              [roomId, imagePaths]
            );
        }

        // Xóa các dòng dữ liệu `vouchers` liên quan
        await connection
          .promise()
          .query("DELETE FROM vouchers WHERE room_id = ?", [roomId]);

        connection.commit((err) => {
          if (err) {
            return connection.rollback(() => {
              console.error("Error committing transaction:", err);
              res.status(500).send("Server error");
            });
          }
          connection.release();
          res.send("Vouchers and associated images deleted successfully");
        });
      } catch (error) {
        connection.rollback(() => {
          console.error("Error during transaction:", error);
          res.status(500).send("Server error");
        });
      }
    });
  });
});

// Cron job để xoá các voucher hết hạn
cron.schedule("0 0 * * *", async () => {
  // Lịch trình: hàng ngày lúc 00:00
  console.log("Checking for expired vouchers to delete...");

  const query =
    "SELECT id, ticket_image_url FROM vouchers WHERE expiration_date < CURDATE()";

  pool.query(query, async (err, results) => {
    if (err) {
      console.error("Error checking expired vouchers:", err);
      return;
    }

    for (const row of results) {
      const voucherId = row.id;
      const ticketImageUrl = row.ticket_image_url; // Lấy link ảnh

      // Xoá ảnh khỏi Firebase Storage
      if (ticketImageUrl) {
        const fileRef = ref(storage, ticketImageUrl);
        try {
          await deleteObject(fileRef);
          console.log(`Image deleted from Firebase Storage: ${ticketImageUrl}`);
        } catch (error) {
          if (error.code === "storage/object-not-found") {
            console.warn(
              `Image not found in Firebase Storage: ${ticketImageUrl}`
            );
          } else {
            console.error("Error deleting image:", error);
          }
        }
      }

      // Xoá các dòng dữ liệu `images` liên quan
      const deleteImagesQuery = "DELETE FROM images WHERE image_path = ?";
      await new Promise((resolve, reject) => {
        pool.query(deleteImagesQuery, [ticketImageUrl], (err, results) => {
          if (err) {
            console.error("Error deleting images:", err);
            reject(err);
          } else {
            console.log(
              `Images deleted successfully for voucher: ${voucherId}`
            );
            resolve();
          }
        });
      });

      // Xoá voucher
      const deleteQuery = "DELETE FROM vouchers WHERE id = ?";
      pool.query(deleteQuery, [voucherId], (err, results) => {
        if (err) {
          console.error("Error deleting voucher:", err);
        } else {
          console.log(`Voucher deleted successfully: ${voucherId}`);
        }
      });
    }
  });
});

//api report
app.post("/report", (req, res) => {
  const { roomId, username, reason, additionalInfo } = req.body;

  // Validate input
  if (!roomId || !username || !reason || reason.trim() === "") {
    return res
      .status(400)
      .json({ success: false, message: "alert.report.reportFailed" });
  }

  // SQL query to check if the report already exists
  const checkQuery = `
      SELECT * FROM reports WHERE room_id = ? AND username = ?
  `;

  const checkValues = [roomId, username, reason];

  pool.query(checkQuery, checkValues, (err, results) => {
    if (err) {
      console.error("Error checking report:", err);
      return res
        .status(500)
        .json({ success: false, message: "alert.report.reportFailed" });
    }

    if (results.length > 0) {
      // Report already exists
      return res
        .status(409)
        .json({ success: false, message: "alert.report.reportExists" });
    }

    // If report doesn't exist, insert new report
    const insertQuery = `
          INSERT INTO reports (room_id, username, reason, additional_info)
          VALUES (?, ?, ?, ?)
      `;

    const insertValues = [roomId, username, reason, additionalInfo];

    pool.query(insertQuery, insertValues, (err, results) => {
      if (err) {
        console.error("Error inserting report:", err);
        return res
          .status(500)
          .json({ success: false, message: "alert.report.reportFailed" });
      }

      res
        .status(201)
        .json({ success: true, message: "alert.report.reportSuccess" });
    });
  });
});

//api report admin
app.get("/admin/reports", verifyToken, (req, res) => {
  if (req.user.username !== "admin") {
    return res
      .status(403)
      .send("You are not authorized to perform this action");
  }

  const query = `
    SELECT 
      r.*, 
      CASE 
        WHEN r.username = rm.admin_username THEN 'host' 
        ELSE 'user' 
      END AS role
    FROM reports r
    JOIN room rm ON r.room_id = rm.room_id
  `;

  pool.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching reports:", err);
      return res.status(500).json({ error: "Failed to fetch reports." });
    }
    res.json({ reports: results });
  });
});
//api delete report
app.delete("/admin/reports/:id", verifyToken, (req, res) => {
  const reportId = req.params.id;

  if (req.user.username !== "admin") {
    return res
      .status(403)
      .send("You are not authorized to perform this action");
  }

  const query = "DELETE FROM reports WHERE id = ?";
  pool.query(query, [reportId], (err, results) => {
    if (err) {
      console.error("Error deleting report:", err);
      return res.status(500).json({ error: "Failed to delete the report." });
    }
    res.json({ message: "Report deleted successfully." });
  });
});

// Create a new quiz room
app.post("/api/rooms/create", verifyToken, async (req, res) => {
  try {
    const { room_details, questions } = req.body;

    // Validate required fields
    if (!room_details.room_title) {
      return res.status(400).json({ error: "Room title is required" });
    }

    if (!questions || questions.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one question is required" });
    }

    // Get username from token
    const username = req.user.username;

    // Generate room ID if not provided
    const roomId =
      room_details.room_id || Math.random().toString(36).substring(2, 7);

    // Start a transaction
    const connection = await pool.promise().getConnection();
    try {
      await connection.beginTransaction();

      // Create the room
      const roomQuery = `
        INSERT INTO room (room_id, admin_username, room_title, room_type, description, how2play, thumbnail)
        VALUES (?, ?, ?, 'public', ?, ?, ?)
      `;
      await connection.query(roomQuery, [
        roomId,
        username,
        room_details.room_title,
        room_details.description || null,
        room_details.how2play || null,
        room_details.thumbnail || null,
      ]);

      // Insert questions
      for (const question of questions) {
        const questionQuery = `
          INSERT INTO Questions (room_id, question_number, question_text, question_type, hint, correct_text_answer, explanation)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const [questionResult] = await connection.query(questionQuery, [
          roomId,
          question.question_number,
          question.question_text,
          question.question_type,
          question.hint || null,
          question.correct_text_answer || null,
          question.explanation || null,
        ]);

        const questionId = questionResult.insertId;

        // Insert options for multiple-choice questions
        if (
          question.question_type === "multiple-choice" &&
          question.options &&
          question.options.length > 0
        ) {
          for (const option of question.options) {
            const optionQuery = `
              INSERT INTO Question_Options (question_id, option_text, is_correct)
              VALUES (?, ?, ?)
            `;
            await connection.query(optionQuery, [
              questionId,
              option.option_text,
              option.is_correct ? 1 : 0,
            ]);
          }
        }
      }

      // Commit transaction
      await connection.commit();

      // Return success
      res.status(201).json({
        success: true,
        message: "Room created successfully",
        roomId: roomId,
      });
    } catch (err) {
      // Rollback on error
      await connection.rollback();
      console.error("Transaction failed:", err);
      res
        .status(500)
        .json({ error: "Failed to create room", details: err.message });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("Error creating room:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Endpoint to get all questions for a specific room
app.get("/api/rooms/:roomId/questions", async (req, res) => {
  try {
    const { roomId } = req.params;

    // Query to get all questions for this room
    const questionsQuery = `
      SELECT 
        q.question_id as id,
        q.question_number as number,
        q.question_text as text,
        q.question_type as type,
        q.hint
      FROM 
        Questions q
      WHERE 
        q.room_id = ?
      ORDER BY 
        q.question_number ASC
    `;

    const [questions] = await pool.promise().query(questionsQuery, [roomId]);

    // If no questions found
    if (questions.length === 0) {
      return res.status(404).json({
        error: "No questions found for this room",
        roomId,
      });
    }

    // Return questions
    res.json(questions);
  } catch (err) {
    console.error("Error fetching questions:", err);
    res.status(500).json({
      error: "Failed to fetch questions",
      details: err.message,
    });
  }
});

// Endpoint to get a specific question by room_id and question_number
app.get("/room/:roomId/question/:questionNumber", async (req, res) => {
  try {
    const { roomId, questionNumber } = req.params;

    // Validate that questionNumber is a valid number
    const questionNum = parseInt(questionNumber, 10);
    if (isNaN(questionNum)) {
      return res.status(400).json({ error: "Invalid question number" });
    }

    // Query to get the specific question
    const questionQuery = `
      SELECT 
        q.question_id AS id,
        q.question_number AS number,
        q.question_text AS text,
        q.question_type AS type,
        q.hint,
        q.correct_text_answer
      FROM 
        Questions q
      WHERE 
        q.room_id = ? AND q.question_number = ?
    `;

    const [questions] = await pool
      .promise()
      .query(questionQuery, [roomId, questionNum]);

    // If no question found
    if (questions.length === 0) {
      return res.status(404).json({
        error: "Question not found",
        roomId,
        questionNumber,
      });
    }

    const question = questions[0];

    // If the question is multiple-choice, fetch the options
    if (question.type === "multiple-choice") {
      const optionsQuery = `
        SELECT 
          option_id AS id,
          option_text AS text,
          is_correct
        FROM 
          Question_Options
        WHERE 
          question_id = ?
        ORDER BY 
          option_id ASC
      `;

      const [options] = await pool.promise().query(optionsQuery, [question.id]);

      // Add options to the question object
      question.options = options.map((opt) => ({
        id: opt.id,
        text: opt.text,
        // Note: We're not sending is_correct to the frontend for security
      }));
    }

    // Don't send correct_text_answer to frontend for security
    delete question.correct_text_answer;

    // Return formatted question
    res.json(question);
  } catch (err) {
    console.error("Error fetching question:", err);
    res.status(500).json({
      error: "Failed to fetch question",
      details: err.message,
    });
  }
});

app.post("/api/room/:roomId/submit-answer", async (req, res) => {
  try {
    const { roomId } = req.params;
    const { questionId, answer } = req.body;
    const userId = req.user?.id || req.body.userId;

    const questionNumber = parseInt(questionId.replace("Q", ""));

    if (isNaN(questionNumber)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid question ID format" });
    }

    // Tìm câu hỏi trong database
    const [questions] = await pool.promise().query(
      `SELECT 
        q.question_id, 
        q.question_type, 
        q.correct_text_answer,
        q.explanation,
        q.room_id
      FROM Questions q
      WHERE q.room_id = ? AND q.question_number = ?`,
      [roomId, questionNumber]
    );

    if (questions.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Question not found" });
    }

    const question = questions[0];
    let isCorrect = false;
    let correctAnswer = null;

    // Xác nhận đáp án dựa trên loại câu hỏi
    if (question.question_type === "text") {
      const correctAnswers = question.correct_text_answer
        .split("|")
        .map((ans) => ans.trim());
      correctAnswer = correctAnswers[0]; // Lấy đáp án đầu tiên làm chuẩn

      // So sánh với enhanced normalization
      const normalizedUser = normalizeText(answer);
      isCorrect = correctAnswers.some((correctAns) => {
        const normalizedCorrect = normalizeText(correctAns);
        return normalizedUser === normalizedCorrect;
      });

      console.log(`Multiple answer text comparison:
        User: "${answer}" → "${normalizedUser}"
        Possible answers: ${correctAnswers
          .map((ans) => `"${ans}" → "${normalizeText(ans)}"`)
          .join(", ")}
        Match: ${isCorrect}`);
    } else if (question.question_type === "multiple-choice") {
      const [options] = await pool.promise().query(
        `SELECT option_id, option_text, is_correct
         FROM Question_Options
         WHERE question_id = ?`,
        [question.question_id]
      );

      const correctOption = options.find((opt) => opt.is_correct === 1);
      if (correctOption) {
        correctAnswer = correctOption.option_text;

        // Apply same normalization for multiple-choice
        const normalizedUser = normalizeText(answer);
        const normalizedCorrect = normalizeText(correctOption.option_text);
        isCorrect = normalizedUser === normalizedCorrect;

        console.log(`Multiple-choice comparison:
          User: "${answer}" → "${normalizedUser}"
          Correct: "${correctAnswer}" → "${normalizedCorrect}"
          Match: ${isCorrect}`);
      }
    }

    // Lưu submission vào database
    await pool.promise().query(
      `INSERT INTO User_Submissions 
        (user_id, room_id, question_id, submitted_answer_text, is_correct, submitted_at) 
      VALUES (?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        submitted_answer_text = VALUES(submitted_answer_text),
        is_correct = VALUES(is_correct),
        submitted_at = NOW()`,
      [userId, roomId, question.question_id, answer, isCorrect ? 1 : 0]
    );

    return res.json({
      success: true,
      isCorrect,
      message: isCorrect ? "Correct answer!" : "Incorrect answer.",
      explanation: question.explanation,
      correctAnswer: isCorrect ? null : correctAnswer,
    });
  } catch (err) {
    console.error("Error processing answer submission:", err);
    return res.status(500).json({
      success: false,
      error: "Server error processing your answer",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// Enhanced normalize function (NO KUROSHIRO)
const normalizeText = (text) => {
  if (!text) return "";

  return (
    text
      .trim()
      // Remove punctuation và special characters
      .replace(/[.,!?。、！？．・\s]+/g, "")
      // Convert to lowercase
      .toLowerCase()
      // Unicode normalization for special characters
      .normalize("NFKC")
      // Convert full-width to half-width characters
      .replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
      })
      // Convert half-width katakana to full-width
      .replace(/[ｱ-ﾝ]/g, function (s) {
        return String.fromCharCode(s.charCodeAt(0) + 0x60);
      })
  );
};

// API endpoint xử lý submit file URL (đã được upload từ frontend)
app.post("/api/room/:roomId/submit-file-answer", async (req, res) => {
  try {
    const { roomId } = req.params;
    const { questionId, fileUrl, username } = req.body;
    // Get username from either auth token or request body
    const submittingUser = req.user?.username || username;

    if (!fileUrl) {
      return res
        .status(400)
        .json({ success: false, error: "File URL is required" });
    }

    if (!submittingUser) {
      return res
        .status(400)
        .json({ success: false, error: "Username is required" });
    }

    // Extract question number từ questionId format "Q1"
    const questionNumber = parseInt(questionId.replace("Q", ""));

    if (isNaN(questionNumber)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid question ID format" });
    }

    // Tìm câu hỏi trong database
    const [questions] = await pool
      .promise()
      .query(
        `SELECT question_id, question_type FROM Questions WHERE room_id = ? AND question_number = ?`,
        [roomId, questionNumber]
      );

    if (questions.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Question not found" });
    }

    const question = questions[0];

    if (question.question_type !== "upload") {
      return res
        .status(400)
        .json({
          success: false,
          error: "This question does not accept file uploads",
        });
    }

    // Lưu submission vào database với URL của file
    await pool.promise().query(
      `INSERT INTO User_Submissions 
        (user_id, room_id, question_id, submitted_file_url, is_correct, submitted_at) 
      VALUES (?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        submitted_file_url = VALUES(submitted_file_url),
        is_correct = 1,
        submitted_at = NOW()`,
      [submittingUser, roomId, question.question_id, fileUrl, 1] // Using username instead of userId
    );

    return res.json({
      success: true,
      isCorrect: true, // File uploads are typically considered correct
      message: "Your file has been submitted successfully!",
      fileUrl: fileUrl,
    });
  } catch (err) {
    console.error("Error saving file submission:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to save your file submission",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// GET user's submission for a specific question
app.get(
  "/room/:roomId/user/:userId/question/:questionNumber/submission",
  async (req, res) => {
    try {
      const { roomId, userId, questionNumber } = req.params;

      if (!roomId || !userId || isNaN(parseInt(questionNumber))) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid parameters" });
      }

      const [questions] = await pool.promise().query(
        `SELECT question_id, question_type FROM Questions 
       WHERE room_id = ? AND question_number = ?`,
        [roomId, parseInt(questionNumber)]
      );

      if (questions.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "Question not found" });
      }

      const question = questions[0];

      const [submissions] = await pool.promise().query(
        `SELECT submitted_answer_text, submitted_file_url, is_correct, submitted_at 
       FROM User_Submissions 
       WHERE room_id = ? AND user_id = ? AND question_id = ?`,
        [roomId, userId, question.question_id]
      );

      if (submissions.length === 0) {
        return res.json({
          success: true,
          submitted: false,
          message: "No submission found for this question",
        });
      }

      const submission = submissions[0];

      return res.json({
        success: true,
        submitted: true,
        isCorrect: submission.is_correct === 1,
        submittedAt: submission.submitted_at,
        type: question.question_type,
        ...(question.question_type === "upload"
          ? { fileUrl: submission.submitted_file_url }
          : { answer: submission.submitted_answer_text }),
      });
    } catch (err) {
      console.error("Error fetching submission:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch submission",
        details:
          process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  }
);

// Endpoint to get user's quiz progress (answered questions count) in a room
app.get("/api/room/:roomId/user/:username/progress", async (req, res) => {
  try {
    const { roomId, username } = req.params;

    // Validate input
    if (!roomId || !username) {
      return res.status(400).json({
        success: false,
        error: "Room ID and username are required",
      });
    }

    // First get the total number of questions in the room
    const [totalResult] = await pool
      .promise()
      .query("SELECT COUNT(*) as total FROM Questions WHERE room_id = ?", [
        roomId,
      ]);

    const totalQuestions = totalResult[0].total;

    // Then get the count of unique questions the user has answered
    const [answeredResult] = await pool.promise().query(
      `SELECT COUNT(DISTINCT question_id) as answered 
       FROM User_Submissions 
       WHERE room_id = ? AND user_id = ?`,
      [roomId, username]
    );

    const answeredQuestions = answeredResult[0].answered;

    // Return the progress data
    return res.json({
      success: true,
      progress: {
        answered: answeredQuestions,
        total: totalQuestions,
        completion:
          totalQuestions > 0
            ? Math.round((answeredQuestions / totalQuestions) * 100)
            : 0,
      },
    });
  } catch (err) {
    console.error("Error fetching user progress:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch progress",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

app.get("/user/:userId/hosted-rooms", async (req, res) => {
  const { userId } = req.params;

  // Kiểm tra xem userId có phải là một số hợp lệ không
  if (!userId || isNaN(parseInt(userId))) {
    return res
      .status(400)
      .json({ success: false, error: "Valid User ID is required" });
  }

  const numericUserId = parseInt(userId, 10) - 1093046400;

  try {
    // Tối ưu hóa bằng cách JOIN tất cả trong một query
    const [hostedRoomResults] = await pool.promise().query(
      `
      SELECT 
        r.room_id, 
        r.room_title, 
        r.thumbnail, 
        r.description,
        r.how2play,
        r.admin_username,
        'hostedroom' as role,
        COALESCE(up.avatarImage, 'https://www.svgrepo.com/show/341256/user-avatar-filled.svg') AS avatarImage
      FROM 
        users u
      JOIN 
        room r ON u.username = r.admin_username
      LEFT JOIN 
        UserProfile up ON u.username = up.username
      WHERE 
        u.id = ?
      ORDER BY 
        r.id DESC
    `,
      [numericUserId]
    );

    // Kiểm tra nếu không tìm thấy user hoặc rooms
    if (hostedRoomResults.length === 0) {
      // Kiểm tra xem user có tồn tại không
      const [userCheck] = await pool
        .promise()
        .query("SELECT username FROM users WHERE id = ?", [numericUserId]);

      if (userCheck.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      }

      // User tồn tại nhưng không có rooms
      return res.json([]);
    }

    res.json(hostedRoomResults);
  } catch (error) {
    console.error(`Error fetching hosted rooms for user ID ${userId}:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch hosted rooms",
      details: error.message,
    });
  }
});

// 1. API kiểm tra trạng thái follow - cũng cần cập nhật
app.post("/follow/status", async (req, res) => {
  try {
    const { follower, following } = req.body;

    if (!follower || !following) {
      return res.status(400).json({
        success: false,
        error: "Follower and following usernames are required",
      });
    }

    // Quy đổi encoded ID sang username thật
    let followerUsername, followingUsername;

    // Nếu follower là encoded ID (số), quy đổi về username
    if (!isNaN(follower)) {
      const followerId = parseInt(follower, 10) - 1093046400;
      const [followerResult] = await pool
        .promise()
        .query("SELECT username FROM users WHERE id = ?", [followerId]);

      if (followerResult.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Follower user not found",
        });
      }
      followerUsername = followerResult[0].username;
    } else {
      followerUsername = follower;
    }

    // Nếu following là encoded ID (số), quy đổi về username
    if (!isNaN(following)) {
      const followingId = parseInt(following, 10) - 1093046400;
      const [followingResult] = await pool
        .promise()
        .query("SELECT username FROM users WHERE id = ?", [followingId]);

      if (followingResult.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Following user not found",
        });
      }
      followingUsername = followingResult[0].username;
    } else {
      followingUsername = following;
    }

    // Kiểm tra xem follower có đang theo dõi following không
    const [result] = await pool
      .promise()
      .query(
        "SELECT * FROM User_Follows WHERE follower_username = ? AND following_username = ?",
        [followerUsername, followingUsername]
      );

    return res.json({
      success: true,
      isFollowing: result.length > 0,
    });
  } catch (err) {
    console.error("Error checking follow status:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to check follow status",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// 2. API để follow một user - UPDATED
app.post("/follow", async (req, res) => {
  try {
    const { follower, following } = req.body;

    if (!follower || !following) {
      return res.status(400).json({
        success: false,
        error: "Follower and following usernames are required",
      });
    }

    // Quy đổi encoded ID sang username thật
    let followerUsername, followingUsername;

    // Nếu follower là encoded ID (số), quy đổi về username
    if (!isNaN(follower)) {
      const followerId = parseInt(follower, 10) - 1093046400;
      const [followerResult] = await pool
        .promise()
        .query("SELECT username FROM users WHERE id = ?", [followerId]);

      if (followerResult.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Follower user not found",
        });
      }
      followerUsername = followerResult[0].username;
    } else {
      followerUsername = follower;
    }

    // Nếu following là encoded ID (số), quy đổi về username
    if (!isNaN(following)) {
      const followingId = parseInt(following, 10) - 1093046400;
      const [followingResult] = await pool
        .promise()
        .query("SELECT username FROM users WHERE id = ?", [followingId]);

      if (followingResult.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Following user not found",
        });
      }
      followingUsername = followingResult[0].username;
    } else {
      followingUsername = following;
    }

    // Không thể follow chính mình
    if (followerUsername === followingUsername) {
      return res.status(400).json({
        success: false,
        error: "Cannot follow yourself",
      });
    }

    try {
      // CHỈ INSERT vào User_Follows - trigger sẽ tự động cập nhật counts
      await pool
        .promise()
        .query(
          "INSERT INTO User_Follows (follower_username, following_username) VALUES (?, ?)",
          [followerUsername, followingUsername]
        );

      // FETCH updated counts sau khi trigger đã chạy
      const [userResult] = await pool
        .promise()
        .query(
          "SELECT follower_count, following_count FROM users WHERE username = ?",
          [followingUsername]
        );

      const [followerResult] = await pool
        .promise()
        .query("SELECT following_count FROM users WHERE username = ?", [
          followerUsername,
        ]);

      return res.json({
        success: true,
        message: `${followerUsername} is now following ${followingUsername}`,
        updatedCounts: {
          following: {
            followerCount: userResult[0]?.follower_count || 0,
            followingCount: userResult[0]?.following_count || 0,
          },
          follower: {
            followingCount: followerResult[0]?.following_count || 0,
          },
        },
      });
    } catch (err) {
      // Nếu lỗi là duplicate entry, có thể do đã follow rồi
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          success: false,
          error: "Already following this user",
        });
      }
      throw err;
    }
  } catch (err) {
    console.error("Error following user:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to follow user",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// 3. API để unfollow một user - UPDATED
app.post("/unfollow", async (req, res) => {
  try {
    const { follower, following } = req.body;

    if (!follower || !following) {
      return res.status(400).json({
        success: false,
        error: "Follower and following usernames are required",
      });
    }

    // Quy đổi encoded ID sang username thật
    let followerUsername, followingUsername;

    // Nếu follower là encoded ID (số), quy đổi về username
    if (!isNaN(follower)) {
      const followerId = parseInt(follower, 10) - 1093046400;
      const [followerResult] = await pool
        .promise()
        .query("SELECT username FROM users WHERE id = ?", [followerId]);

      if (followerResult.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Follower user not found",
        });
      }
      followerUsername = followerResult[0].username;
    } else {
      followerUsername = follower;
    }

    // Nếu following là encoded ID (số), quy đổi về username
    if (!isNaN(following)) {
      const followingId = parseInt(following, 10) - 1093046400;
      const [followingResult] = await pool
        .promise()
        .query("SELECT username FROM users WHERE id = ?", [followingId]);

      if (followingResult.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Following user not found",
        });
      }
      followingUsername = followingResult[0].username;
    } else {
      followingUsername = following;
    }

    try {
      // CHỈ DELETE từ User_Follows - trigger sẽ tự động cập nhật counts
      const [result] = await pool
        .promise()
        .query(
          "DELETE FROM User_Follows WHERE follower_username = ? AND following_username = ?",
          [followerUsername, followingUsername]
        );

      // Nếu không có bản ghi nào bị xóa (không tìm thấy)
      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: "Follow relationship not found",
        });
      }

      // FETCH updated counts sau khi trigger đã chạy
      const [userResult] = await pool
        .promise()
        .query(
          "SELECT follower_count, following_count FROM users WHERE username = ?",
          [followingUsername]
        );

      const [followerResult] = await pool
        .promise()
        .query("SELECT following_count FROM users WHERE username = ?", [
          followerUsername,
        ]);

      return res.json({
        success: true,
        message: `${followerUsername} unfollowed ${followingUsername}`,
        updatedCounts: {
          following: {
            followerCount: userResult[0]?.follower_count || 0,
            followingCount: userResult[0]?.following_count || 0,
          },
          follower: {
            followingCount: followerResult[0]?.following_count || 0,
          },
        },
      });
    } catch (err) {
      throw err;
    }
  } catch (err) {
    console.error("Error unfollowing user:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to unfollow user",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// 4. API lấy danh sách followers của một user
app.get("/user/:username/followers", async (req, res) => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Lấy danh sách người theo dõi
    const [followers] = await pool.promise().query(
      `SELECT f.follower_username, f.created_at,
              u.avatar_url, u.fullname
       FROM User_Follows f
       LEFT JOIN users u ON f.follower_username = u.username
       WHERE f.following_username = ?
       ORDER BY f.created_at DESC
       LIMIT ? OFFSET ?`,
      [username, limit, offset]
    );

    // Đếm tổng số followers
    const [countResult] = await pool
      .promise()
      .query(
        "SELECT COUNT(*) as total FROM User_Follows WHERE following_username = ?",
        [username]
      );

    const totalFollowers = countResult[0].total;

    return res.json({
      success: true,
      followers,
      pagination: {
        page,
        limit,
        total: totalFollowers,
        pages: Math.ceil(totalFollowers / limit),
      },
    });
  } catch (err) {
    console.error("Error getting followers:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to get followers",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// 5. API lấy danh sách người mà user đang follow
app.get("/user/:username/following", async (req, res) => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Lấy danh sách người đang theo dõi
    const [following] = await pool.promise().query(
      `SELECT f.following_username, f.created_at,
              u.avatar_url, u.fullname
       FROM User_Follows f
       LEFT JOIN users u ON f.following_username = u.username
       WHERE f.follower_username = ?
       ORDER BY f.created_at DESC
       LIMIT ? OFFSET ?`,
      [username, limit, offset]
    );

    // Đếm tổng số following
    const [countResult] = await pool
      .promise()
      .query(
        "SELECT COUNT(*) as total FROM User_Follows WHERE follower_username = ?",
        [username]
      );

    const totalFollowing = countResult[0].total;

    return res.json({
      success: true,
      following,
      pagination: {
        page,
        limit,
        total: totalFollowing,
        pages: Math.ceil(totalFollowing / limit),
      },
    });
  } catch (err) {
    console.error("Error getting following list:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to get following list",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// API endpoint để kiểm tra xem user có trả lời đúng tất cả câu hỏi không
app.get(
  "/api/room/:roomId/user/:username/correct-answers",
  async (req, res) => {
    try {
      const { roomId, username } = req.params;

      // Đếm tổng số câu hỏi trong room
      const [totalQuestions] = await pool
        .promise()
        .query("SELECT COUNT(*) as total FROM Questions WHERE room_id = ?", [
          roomId,
        ]);

      // Đếm số câu trả lời đúng của user
      const [correctAnswers] = await pool.promise().query(
        `SELECT COUNT(*) as correct 
       FROM User_Submissions us
       JOIN Questions q ON us.question_id = q.question_id
       WHERE us.user_id = ? AND q.room_id = ? AND us.is_correct = 1`,
        [username, roomId]
      );

      const total = totalQuestions[0].total;
      const correct = correctAnswers[0].correct;

      res.json({
        success: true,
        allCorrect: total > 0 && correct === total,
        correct: correct,
        total: total,
      });
    } catch (err) {
      console.error("Error checking correct answers:", err);
      res.status(500).json({
        success: false,
        error: "Failed to check correct answers",
      });
    }
  }
);

app.get("/api/room/:roomId/all-users-results", async (req, res) => {
  try {
    const { roomId } = req.params;

    // Đếm tổng số câu hỏi trong room
    const [totalQuestions] = await pool
      .promise()
      .query("SELECT COUNT(*) as total FROM Questions WHERE room_id = ?", [
        roomId,
      ]);

    const totalQuestionsCount = totalQuestions[0].total;

    if (totalQuestionsCount === 0) {
      return res.json({
        success: true,
        message: "No questions found in this room",
        totalQuestions: 0,
        users: []
      });
    }

    // Lấy kết quả của tất cả user đã submit trong room
    const [userResults] = await pool.promise().query(
      `SELECT 
        us.user_id as username,
        u.fullname,
        COALESCE(up.avatarImage, 'https://www.svgrepo.com/show/341256/user-avatar-filled.svg') AS avatarImage,
        COUNT(DISTINCT us.question_id) as answered_questions,
        COUNT(CASE WHEN us.is_correct = 1 THEN 1 END) as correct_answers,
        ROUND((COUNT(CASE WHEN us.is_correct = 1 THEN 1 END) / ?) * 100, 2) as score_percentage,
        MAX(us.submitted_at) as last_submission
      FROM User_Submissions us
      JOIN Questions q ON us.question_id = q.question_id
      JOIN users u ON us.user_id = u.username
      LEFT JOIN UserProfile up ON u.username = up.username
      WHERE q.room_id = ?
      GROUP BY us.user_id, u.fullname, up.avatarImage
      ORDER BY score_percentage DESC, correct_answers DESC, last_submission ASC`,
      [totalQuestionsCount, roomId]
    );

    // Thêm thông tin về việc hoàn thành tất cả câu hỏi
    const processedResults = userResults.map(user => ({
      ...user,
      allCorrect: user.correct_answers === totalQuestionsCount,
      allAnswered: user.answered_questions === totalQuestionsCount,
      completion_status: user.answered_questions === totalQuestionsCount ? 
        (user.correct_answers === totalQuestionsCount ? 'perfect' : 'completed') : 
        'incomplete'
    }));

    // Thống kê tổng quan
    const stats = {
      totalUsers: processedResults.length,
      perfectScores: processedResults.filter(u => u.allCorrect).length,
      completedUsers: processedResults.filter(u => u.allAnswered).length,
      averageScore: processedResults.length > 0 ? 
        (processedResults.reduce((sum, u) => sum + u.score_percentage, 0) / processedResults.length).toFixed(2) : 0
    };

    res.json({
      success: true,
      totalQuestions: totalQuestionsCount,
      stats: stats,
      users: processedResults
    });

  } catch (err) {
    console.error("Error checking all users results:", err);
    res.status(500).json({
      success: false,
      error: "Failed to check all users results",
    });
  }
});

app.get("/api/room/:roomId/user-submissions-upload", async (req, res) => {
  try {
    const { roomId } = req.params;

    const query = `
      SELECT us.user_id, us.submitted_file_url, u.fullname
      FROM User_Submissions us
      JOIN users u ON us.user_id = u.username
      WHERE us.room_id = ? 
      AND us.submitted_file_url IS NOT NULL
      ORDER BY us.submitted_at DESC
    `;

    pool.query(query, [roomId], (err, results) => {
      if (err) {
        console.error("Error fetching user submissions:", err);
        return res
          .status(500)
          .json({ error: "Failed to fetch user submissions" });
      }

      res.json(results);
    });
  } catch (error) {
    console.error("Error in user submissions endpoint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/room/:roomId/location", verifyToken, (req, res) => {
  const { roomId } = req.params;
  const { lat, lng, address, admin_username, city, country } = req.body;

  // Validate input
  if (!lat || !lng || !address || !admin_username) {
    return res.status(400).json({
      error: "Thiếu thông tin: lat, lng, address, admin_username",
    });
  }

  // Check if user is authorized
  if (req.user.username !== admin_username) {
    return res.status(403).json({
      message: "You are not authorized to perform this action",
    });
  }

  // Validate coordinates
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({
      error: "Tọa độ không hợp lệ",
    });
  }

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting database connection:", err);
      return res.status(500).send("Database connection error");
    }

    try {
      // Check if room exists and user is admin
      const checkRoomQuery =
        "SELECT id, admin_username FROM room WHERE room_id = ?";

      connection.query(checkRoomQuery, [roomId], (err, roomResult) => {
        if (err) {
          console.error("Error checking room:", err);
          return res.status(500).json({ error: "Database error" });
        }

        if (roomResult.length === 0) {
          return res.status(404).json({ error: "Không tìm thấy phòng" });
        }

        const room = roomResult[0];

        // Check if user is admin of this room
        if (room.admin_username !== admin_username) {
          return res.status(403).json({
            error: "Chỉ admin của phòng mới có thể đặt vị trí",
          });
        }

        const finalCity = city || "";
        const finalCountry = country || "";

        // ✅ VỚI MYSQL CŨ: Dùng POINT(X, Y) trong đó X=longitude, Y=latitude
        // Nhưng theo WKT standard thì POINT(longitude latitude) là đúng
        // Thử cách này: POINT(longitude latitude) - đây là chuẩn WKT
        const pointWKT = `POINT(${lng} ${lat})`;

        console.log("WKT format:", pointWKT);
        console.log("lng (longitude):", lng, "lat (latitude):", lat);

        const updateQuery = `
          UPDATE room
          SET 
            location = ST_GeomFromText(?, 4326),
            city = ?,
            country = ?
          WHERE room_id = ?
        `;

        const params = [pointWKT, finalCity, finalCountry, roomId];

        console.log("Query params:", params);

        connection.query(updateQuery, params, (err, result) => {
          if (err) {
            console.error("Error updating room location:", err);
            console.error("WKT used:", pointWKT);

            // ✅ NẾU VẪN LỖI, THỬ ĐẢO NGƯỢC TỌA ĐỘ (có thể MySQL cần lat lng thay vì lng lat)
            const reversedWKT = `POINT(${lat} ${lng})`;
            console.log("Trying reversed coordinates:", reversedWKT);

            const retryQuery = `
              UPDATE room
              SET 
                location = ST_GeomFromText(?, 4326),
                city = ?,
                country = ?
              WHERE room_id = ?
            `;

            connection.query(
              retryQuery,
              [reversedWKT, finalCity, finalCountry, roomId],
              (err2, result2) => {
                if (err2) {
                  console.error("Both attempts failed:", err2);
                  return res
                    .status(500)
                    .json({ error: "Database error when saving location" });
                }

                if (result2.affectedRows === 0) {
                  return res
                    .status(404)
                    .json({ error: "Room not found or not updated" });
                }

                console.log("Success with reversed coordinates!");
                res.status(200).json({
                  message: "Đã lưu vị trí thành công (reversed coordinates)",
                  data: {
                    roomId,
                    lat: parseFloat(lat),
                    lng: parseFloat(lng),
                    address,
                    city: finalCity,
                    country: finalCountry,
                    coordinates: {
                      type: "Point",
                      coordinates: [parseFloat(lng), parseFloat(lat)],
                    },
                  },
                });
              }
            );
            return;
          }

          if (result.affectedRows === 0) {
            return res
              .status(404)
              .json({ error: "Room not found or not updated" });
          }

          console.log("Success with normal coordinates!");
          // Return success response
          res.status(200).json({
            message: "Đã lưu vị trí thành công",
            data: {
              roomId,
              lat: parseFloat(lat),
              lng: parseFloat(lng),
              address,
              city: finalCity,
              country: finalCountry,
              coordinates: {
                type: "Point",
                coordinates: [parseFloat(lng), parseFloat(lat)],
              },
            },
          });
        });
      });
    } catch (err) {
      console.error("Unexpected error:", err);
      res.status(500).json({ error: "Unexpected error" });
    } finally {
      connection.release();
    }
  });
});

// API tìm phòng gần đây với city/country filtering
app.get("/api/room/search/nearby", (req, res) => {
  const {
    lat,
    lng,
    limit = 20,
    last_distance = 0,
    last_id = 0,
    max_distance = 50000,
    city,
    country,
  } = req.query;

  // Validate coordinates
  if (!lat || !lng || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({
      error: "Tọa độ không hợp lệ",
    });
  }

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting database connection:", err);
      return res.status(500).send("Database connection error");
    }

    try {
      // ✅ SỬA: DÙNG CÙNG FORMAT VỚI SAVE API - POINT(lat lng)
      const pointWKT = `POINT(${lat} ${lng})`;

      console.log("Search using WKT:", pointWKT); // Debug log

      let query = `
        SELECT 
          r.id,
          r.room_id,
          r.room_title,
          r.room_type,
          r.admin_username,
          r.description,
          r.thumbnail,
          ST_X(r.location) as lng,
          ST_Y(r.location) as lat,
          r.city,
          r.country,
          u.fullname as admin_fullname,
          up.avatarImage as admin_avatar,
          ST_Distance_Sphere(r.location, ST_GeomFromText(?, 4326)) AS distance_m
        FROM room r
        LEFT JOIN users u ON r.admin_username = u.username
        LEFT JOIN UserProfile up ON r.admin_username = up.username
        WHERE r.location IS NOT NULL
      `;

      let params = [pointWKT];

      // FILTER BY CITY/COUNTRY FIRST
      if (city) {
        query += ` AND city = ?`;
        params.push(city);
      }

      if (country) {
        query += ` AND country = ?`;
        params.push(country);
      }

      // SAU ĐÓ MỚI FILTER BY DISTANCE
      query += ` AND ST_Distance_Sphere(location, ST_GeomFromText(?, 4326)) <= ?`;
      params.push(pointWKT, max_distance);

      // Cursor pagination logic
      if (last_distance > 0 || last_id > 0) {
        query += ` 
          AND (
            ST_Distance_Sphere(location, ST_GeomFromText(?, 4326)) > ?
            OR (
              ST_Distance_Sphere(location, ST_GeomFromText(?, 4326)) = ?
              AND id > ?
            )
          )
        `;
        params.push(pointWKT, last_distance, pointWKT, last_distance, last_id);
      }

      query += ` ORDER BY distance_m ASC, id ASC LIMIT ?`;
      params.push(parseInt(limit));

      console.log("Search query params:", params); // Debug log

      connection.query(query, params, (err, results) => {
        if (err) {
          console.error("Error searching nearby rooms:", err);
          console.error("Search WKT used:", pointWKT);
          return res.status(500).json({ error: "Database error" });
        }

        console.log(`Found ${results.length} rooms`); // Debug log

        const response = {
          message: `Tìm thấy ${results.length} phòng trong ${
            city || "khu vực"
          }, ${country || "tất cả quốc gia"}`,
          data: results,
          filters: {
            city: city || null,
            country: country || null,
            max_distance_m: max_distance,
          },
          pagination: {
            has_more: results.length === parseInt(limit),
            next_cursor: null,
          },
        };

        if (results.length > 0) {
          const lastItem = results[results.length - 1];
          response.pagination.next_cursor = {
            last_distance: lastItem.distance_m,
            last_id: lastItem.id,
          };
        }

        res.status(200).json(response);
      });
    } catch (err) {
      console.error("Unexpected error:", err);
      res.status(500).json({ error: "Unexpected error" });
    } finally {
      connection.release();
    }
  });
});

// Health check API
app.get("/health", async (req, res) => {
  try {
    // Kiểm tra kết nối database
    pool.query("SELECT 1", (err, result) => {
      if (err) {
        return res.status(500).send("Database connection failed");
      }
      res.status(200).send("OK");
    });
  } catch (err) {
    res.status(500).send("Application is unhealthy");
  }
});

// ✅ Endpoint chat với API mới
app.post('/api/chat', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ 
        error: 'Vui lòng nhập câu hỏi' 
      });
    }

    const prompt = buildPrompt(question);
    
    // ✅ Sử dụng API mới với syntax đúng
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp', // Hoặc gemini-1.5-flash
      contents: prompt,
    });

    res.json({ 
      answer: response.text,
      timestamp: new Date().toISOString() 
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ 
      error: 'Xin lỗi, TekuBot đang gặp sự cố. Vui lòng thử lại sau!' 
    });
  }
});

// ✅ API tạo câu hỏi tự động bằng AI
// ✅ API tạo câu hỏi tự động bằng AI
app.post('/api/ai/generate-questions', async (req, res) => {
  try {
    const { topic, numQuestions = 5, difficulty = 'medium', questionTypes = ['text', 'multiple-choice'] } = req.body;
    
    if (!topic) {
      return res.status(400).json({ 
        error: 'Vui lòng nhập chủ đề để tạo câu hỏi' 
      });
    }

    // Validate số lượng câu hỏi - Tăng từ 10 lên 25
    const validNumQuestions = Math.min(Math.max(parseInt(numQuestions), 1), 25);
    
    // ✅ Timeout tối ưu hơn: min 30s, với 10 câu = 15s thêm, 25 câu = 37.5s thêm
    const timeoutMs = Math.max(30000, Math.round(validNumQuestions * 1500)); // 1.5s mỗi câu thay vì 15s
    req.setTimeout(timeoutMs);
    
    console.log(`Generating ${validNumQuestions} questions with ${timeoutMs}ms timeout`);
    
    // Tạo prompt cho AI
    const prompt = buildQuestionGenerationPrompt(topic, validNumQuestions, difficulty, questionTypes);
    
    // Gọi AI để tạo câu hỏi
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    });

    // Parse JSON response từ AI
    let generatedQuestions;
    try {
      // Lấy text từ response và parse JSON
      const responseText = response.text || response.response?.text || '';
      
      // Tìm JSON trong response text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generatedQuestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Không tìm thấy JSON trong response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return res.status(500).json({ 
        error: 'Lỗi xử lý phản hồi từ AI. Vui lòng thử lại!' 
      });
    }

    // Validate và format câu hỏi
    const formattedQuestions = formatGeneratedQuestions(generatedQuestions.questions || []);

    res.json({ 
      success: true,
      questions: formattedQuestions,
      topic: topic,
      difficulty: difficulty,
      estimatedTime: `${Math.round(timeoutMs / 1000)}s`,
      actualQuestions: formattedQuestions.length,
      requestedQuestions: validNumQuestions,
      timestamp: new Date().toISOString() 
    });

  } catch (error) {
    console.error('AI Question Generation error:', error);
    res.status(500).json({ 
      error: 'Xin lỗi, có lỗi xảy ra khi tạo câu hỏi. Vui lòng thử lại sau!' 
    });
  }
});

// Hàm tạo prompt cho AI
function buildQuestionGenerationPrompt(topic, numQuestions, difficulty, questionTypes) {
  const difficultyDesc = {
    easy: 'dễ (cơ bản)',
    medium: 'trung bình',
    hard: 'khó (nâng cao)'
  };

  const typeDesc = {
    text: 'Câu hỏi văn bản (người dùng nhập đáp án)',
    'multiple-choice': 'Câu hỏi trắc nghiệm (4 lựa chọn)',
    upload: 'Câu hỏi upload ảnh (không cần đáp án cụ thể)'
  };

  return `Bạn là một chuyên gia giáo dục. Tạo ${numQuestions} câu hỏi về chủ đề "${topic}" với độ khó ${difficultyDesc[difficulty] || 'trung bình'}.

**Yêu cầu:**
1. Tạo câu hỏi đa dạng với các loại: ${questionTypes.map(type => typeDesc[type]).join(', ')}
2. Phân bố đều các loại câu hỏi
3. Câu hỏi phải phù hợp với độ khó ${difficulty}
4. Đối với multiple-choice: tạo 4 lựa chọn, chỉ 1 đúng
5. Đối với text: cung cấp nhiều đáp án đúng có thể (cách nhau bằng |)
6. Đối với upload: tạo câu hỏi yêu cầu upload ảnh/file

**Format JSON trả về:**
{
  "questions": [
    {
      "question_text": "Nội dung câu hỏi",
      "question_type": "text|multiple-choice|upload",
      "hint": "Gợi ý (tùy chọn)",
      "explanation": "Giải thích đáp án",
      "correct_text_answer": "đáp án 1|đáp án 2|đáp án 3" (chỉ cho type text),
      "options": [
        {"option_text": "Lựa chọn A", "is_correct": false},
        {"option_text": "Lựa chọn B", "is_correct": true},
        {"option_text": "Lựa chọn C", "is_correct": false},
        {"option_text": "Lựa chọn D", "is_correct": false}
      ] (chỉ cho type multiple-choice)
    }
  ]
}

Chỉ trả về JSON, không thêm text khác.`;
}

// Hàm format và validate câu hỏi được tạo
function formatGeneratedQuestions(questions) {
  return questions.map((q, index) => {
    const formattedQuestion = {
      tempId: Date.now() + index,
      question_text: q.question_text || '',
      question_type: q.question_type || 'text',
      hint: q.hint || '',
      explanation: q.explanation || '',
    };

    // Xử lý theo loại câu hỏi
    if (q.question_type === 'text') {
      formattedQuestion.correct_text_answer = q.correct_text_answer || '';
    } else if (q.question_type === 'multiple-choice') {
      formattedQuestion.options = q.options || [
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false }
      ];
    }
    // upload type không cần thêm gì

    return formattedQuestion;
  }).filter(q => q.question_text.trim() !== ''); // Loại bỏ câu hỏi rỗng
}

app.listen(PORT, () => {
  console.log("Server is running on port 9999");
});
