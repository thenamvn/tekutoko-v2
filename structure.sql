
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  fullname VARCHAR(255) NOT NULL
);

select * from users;
CREATE TABLE admin_account (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  fullname VARCHAR(255) NOT NULL
);
CREATE INDEX idx_username ON users(username);

select * from admin_account;
CREATE TABLE room (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id VARCHAR(6) unique,
  admin_username VARCHAR(255) NOT NULL,
  room_title VARCHAR(255),
  room_type ENUM('public', 'private') NOT NULL,
	description TEXT,
	how2play TEXT,
	thumbnail VARCHAR(255) NOT NULL,
  FOREIGN KEY (admin_username) REFERENCES users(username) ON DELETE CASCADE
);

select * from room;

CREATE TABLE room_users (
  room_id VARCHAR(6) NOT NULL,
  username VARCHAR(255) NOT NULL,
  PRIMARY KEY (room_id, username),
  FOREIGN KEY (room_id) REFERENCES room(room_id) ON DELETE CASCADE,
  FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

select * from room_users;
CREATE TABLE otp (
  username VARCHAR(255) NOT NULL,
  otp VARCHAR(4) NOT NULL,
  otp_expiry BIGINT NOT NULL,
  PRIMARY KEY (username),
  FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

select * from otp;

CREATE TABLE submitedusers (
room_id VARCHAR(6) NOT NULL,
username VARCHAR(255) NOT NULL,
PRIMARY KEY (room_id, username),
FOREIGN KEY (room_id) REFERENCES room(room_id) ON DELETE CASCADE,
FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);
select * from submitedusers;

CREATE TABLE denyjob (
room_id VARCHAR(6) NOT NULL,
username VARCHAR(255) NOT NULL,
PRIMARY KEY (room_id, username),
FOREIGN KEY (room_id) REFERENCES room(room_id) ON DELETE CASCADE,
FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);
CREATE TABLE rewarded_users (
  room_id VARCHAR(6) NOT NULL,
  username VARCHAR(255) NOT NULL,
  PRIMARY KEY (room_id, username),
  FOREIGN KEY (room_id) REFERENCES room(room_id) ON DELETE CASCADE,
  FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

select * from denyjob;
select * from submitedusers;

CREATE INDEX idx_room_id ON room_users(room_id);
CREATE INDEX idx_username ON room_users(username);

CREATE TABLE images (
  image_id INT AUTO_INCREMENT PRIMARY KEY,
  room_id VARCHAR(6) NOT NULL,
  uploader_username VARCHAR(255) NOT NULL,
  image_path VARCHAR(2000) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES room(room_id) ON DELETE CASCADE,
  FOREIGN KEY (uploader_username) REFERENCES users(username) ON DELETE CASCADE
);
select * from images;

CREATE INDEX idx_room_id ON images(room_id);
CREATE INDEX idx_uploader_username ON images(uploader_username);
Create Table job (
	  room_id varchar(6) not null,
    job_description text,
    job_owner VARCHAR(255) NOT NULL,
    FOREIGN KEY (room_id) REFERENCES room(room_id) ON DELETE CASCADE,
    FOREIGN KEY (job_owner) REFERENCES users(username) ON DELETE CASCADE 
);
select * from job;
CREATE TABLE UserProfile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL unique,
    avatarImage VARCHAR(1000),
    backgroundImage VARCHAR(1000),
    job VARCHAR(255),
    description TEXT,
    address VARCHAR(1000),
    instagram VARCHAR(255),
    twitter VARCHAR(255),
    linkedin VARCHAR(255),
    facebook VARCHAR(255),
    homepage VARCHAR(1000),
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);
select * from UserProfile;

CREATE TABLE vouchers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id VARCHAR(6) NOT NULL,
    host_room VARCHAR(255) NOT NULL,
    reward_type ENUM('ticket', 'discount') NOT NULL,
    ticket_name VARCHAR(255),
    ticket_description TEXT,
    ticket_image_url VARCHAR(1000),
    discount_name VARCHAR(255),
    discount_value VARCHAR(255),
    discount_description TEXT,
    expiration_date DATE,
    FOREIGN KEY (host_room) REFERENCES users(username) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES room(room_id) ON DELETE CASCADE
);

CREATE TABLE user_vouchers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    voucher_id INT NOT NULL,
    UNIQUE (username, voucher_id),
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
    FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE CASCADE
);
create table banned_users (
	id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL
);

CREATE TABLE reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id VARCHAR(6) NOT NULL,
    username VARCHAR(255) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    additional_info VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES room(room_id) ON DELETE CASCADE,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Question_Options (
    option_id INT AUTO_INCREMENT PRIMARY KEY, -- ID tự tăng, định danh duy nhất cho mỗi lựa chọn - PRIMARY KEY
    question_id INT NOT NULL,                -- ID của câu hỏi mà lựa chọn này thuộc về - FOREIGN KEY
    option_text VARCHAR(500) NOT NULL,       -- Nội dung/văn bản của lựa chọn (ví dụ: '小説', '小接')
    is_correct BOOLEAN NOT NULL DEFAULT FALSE, -- Đánh dấu đây có phải là đáp án đúng hay không (TRUE/FALSE hoặc 1/0)

    -- Liên kết khóa ngoại tới bảng Questions
    FOREIGN KEY (question_id) REFERENCES Questions(question_id)
        ON DELETE CASCADE -- Nếu xóa câu hỏi thì xóa luôn các lựa chọn liên quan
        ON UPDATE CASCADE -- Nếu ID câu hỏi thay đổi thì cập nhật luôn ở đây
);

CREATE TABLE IF NOT EXISTS Questions (
    question_id INT AUTO_INCREMENT PRIMARY KEY, -- ID tự tăng, định danh duy nhất cho mỗi câu hỏi - PRIMARY KEY
    room_id VARCHAR(50) NOT NULL,              -- ID của phòng mà câu hỏi này thuộc về - FOREIGN KEY
    question_number INT NOT NULL,              -- Số thứ tự của câu hỏi trong phòng (1, 2, 3, ...)
    question_text TEXT NOT NULL,               -- Nội dung/văn bản của câu hỏi
    question_type ENUM('text', 'multiple-choice', 'upload') NOT NULL, -- Loại câu hỏi
    hint TEXT NULL,                            -- Gợi ý cho câu hỏi (tùy chọn)
    correct_text_answer TEXT NULL,             -- Câu trả lời đúng cho loại 'text' (NULL cho các loại khác)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Thời gian tạo câu hỏi
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Thời gian cập nhật lần cuối

    -- Đảm bảo số thứ tự câu hỏi là duy nhất trong mỗi phòng
    UNIQUE KEY uk_room_question_number (room_id, question_number),

    -- Liên kết khóa ngoại tới bảng Rooms
    FOREIGN KEY (room_id) REFERENCES room(room_id)
        ON DELETE CASCADE -- Nếu xóa phòng thì xóa luôn các câu hỏi liên quan
        ON UPDATE CASCADE -- Nếu ID phòng thay đổi thì cập nhật luôn ở đây
);

-- Optional: Index for faster lookups by room_id
-- CREATE INDEX idx_questions_room ON Questions(room_id);

CREATE TABLE IF NOT EXISTS User_Submissions (
    submission_id INT AUTO_INCREMENT PRIMARY KEY, -- ID duy nhất cho mỗi lượt nộp bài - PRIMARY KEY
    user_id VARCHAR(100) NOT NULL,             -- ID hoặc username của người dùng trả lời - FOREIGN KEY (tham chiếu đến bảng Users của bạn)
    room_id VARCHAR(50) NOT NULL,              -- ID của phòng quiz - FOREIGN KEY (tham chiếu đến Rooms)
    question_id INT NOT NULL,                   -- ID của câu hỏi đã trả lời - FOREIGN KEY (tham chiếu đến Questions)

    submitted_answer_text TEXT NULL,            -- Câu trả lời dạng text người dùng nhập (cho loại 'text' hoặc text của lựa chọn 'multiple-choice')
    submitted_option_id INT NULL,               -- (Tùy chọn) ID của lựa chọn người dùng đã chọn (cho loại 'multiple-choice', tham chiếu đến Question_Options.option_id)
    submitted_file_url VARCHAR(512) NULL,       -- URL của file người dùng đã upload (cho loại 'upload', sau khi đã upload thành công lên storage)

    is_correct BOOLEAN NULL,                    -- TRUE nếu câu trả lời đúng, FALSE nếu sai, NULL nếu chưa chấm hoặc không áp dụng (ví dụ: upload)
                                                -- Nên được tính toán và lưu khi nộp bài để truy vấn điểm số nhanh hơn.
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Thời điểm người dùng nộp câu trả lời

    -- Đảm bảo một người dùng chỉ có một lượt nộp bài cuối cùng cho một câu hỏi trong một phòng
    UNIQUE KEY uk_user_room_question (user_id, room_id, question_id),

    -- Khóa ngoại (Giả sử bạn có bảng Users với user_id là khóa chính)
    -- Thay 'Users' và 'user_id_column' bằng tên bảng và cột user ID thực tế của bạn
    -- FOREIGN KEY (user_id) REFERENCES Users(user_id_column) ON DELETE CASCADE ON UPDATE CASCADE,

    -- Sửa tên bảng tham chiếu từ 'room' thành 'Rooms'
    FOREIGN KEY (room_id) REFERENCES room(room_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    FOREIGN KEY (question_id) REFERENCES Questions(question_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE -- << Xóa dấu phẩy ở đây

    -- (Tùy chọn) Khóa ngoại cho submitted_option_id nếu bạn lưu nó
    -- FOREIGN KEY (submitted_option_id) REFERENCES Question_Options(option_id) ON DELETE SET NULL ON UPDATE CASCADE
); -- Dòng 32 bây giờ sẽ không còn lỗi

-- Index để tăng tốc truy vấn tìm các câu trả lời của một user trong một room
CREATE INDEX idx_submission_user_room ON User_Submissions(user_id, room_id);

-- Index để tăng tốc truy vấn tìm các user đã trả lời một câu hỏi cụ thể
CREATE INDEX idx_submission_question ON User_Submissions(question_id);

-- Index (không bắt buộc) cho user_id riêng lẻ nếu bạn thường xuyên truy vấn tất cả các submission của một user trên mọi room
-- CREATE INDEX idx_submission_user ON User_Submissions(user_id);


-- SQL để tạo bảng theo dõi người dùng
CREATE TABLE User_Follows (
  id INT AUTO_INCREMENT PRIMARY KEY,
  follower_username VARCHAR(255) NOT NULL,  -- Người theo dõi
  following_username VARCHAR(255) NOT NULL, -- Người được theo dõi
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Tạo composite unique key để đảm bảo không có dữ liệu lặp
  UNIQUE KEY unique_follow (follower_username, following_username),
  
  -- Có thể thêm foreign key nếu liên kết với bảng users
  -- FOREIGN KEY (follower_username) REFERENCES Users(username),
  -- FOREIGN KEY (following_username) REFERENCES Users(username),
  
  -- Index để tối ưu truy vấn
  INDEX idx_follower (follower_username),
  INDEX idx_following (following_username)
);

-- Thêm cột follower_count và following_count vào bảng Users (nếu chưa có)
ALTER TABLE users 
ADD COLUMN follower_count INT DEFAULT 0,
ADD COLUMN following_count INT DEFAULT 0;

select * from reports;
INSERT INTO users (username, password, fullname) VALUES
('fujimoto.n@vju.ac.vn', 'norinori@', 'nori');

INSERT INTO users (username, password, fullname) VALUES
('ntnhacker1@gmail.com', '1', 'NTN Hacker'),
('zoombies2182004@gmail.com', '1', 'Zoombie User');
INSERT INTO admin_account (username, password, fullname) VALUES
('admin', 'admin', 'NTN Hacker');
