CREATE TABLE `users` (
  `id` int PRIMARY KEY AUTO_INCREMENT COMMENT 'Primary key',
  `username` varchar(255) UNIQUE NOT NULL COMMENT 'Unique username',
  `password` varchar(255) NOT NULL,
  `fullname` varchar(255) NOT NULL,
  `follower_count` int DEFAULT 0,
  `following_count` int DEFAULT 0
);

CREATE TABLE `UserProfile` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `username` varchar(255) UNIQUE NOT NULL,
  `avatarImage` varchar(1000),
  `backgroundImage` varchar(1000),
  `job` varchar(255),
  `description` text,
  `address` varchar(1000),
  `instagram` varchar(255),
  `twitter` varchar(255),
  `linkedin` varchar(255),
  `facebook` varchar(255),
  `homepage` varchar(1000)
);

CREATE TABLE `User_Follows` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `follower_username` varchar(255) NOT NULL,
  `following_username` varchar(255) NOT NULL,
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `room` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `room_id` varchar(6) UNIQUE NOT NULL,
  `admin_username` varchar(255) NOT NULL,
  `room_title` varchar(255),
  `room_type` ENUM ('public', 'private') NOT NULL,
  `description` text,
  `how2play` text,
  `thumbnail` varchar(500),
  `location` point,
  `city` varchar(255),
  `country` varchar(255),
  `id_test` varchar(255)
);

CREATE TABLE `room_users` (
  `room_id` varchar(6) NOT NULL,
  `username` varchar(255) NOT NULL,
  PRIMARY KEY (`room_id`, `username`)
);

CREATE TABLE `Questions` (
  `question_id` int PRIMARY KEY AUTO_INCREMENT,
  `room_id` varchar(50) NOT NULL,
  `question_number` int NOT NULL,
  `question_text` text NOT NULL,
  `question_type` ENUM ('text', 'multiple-choice', 'upload') NOT NULL,
  `hint` text,
  `correct_text_answer` text,
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp DEFAULT (CURRENT_TIMESTAMP),
  `explanation` text,
  `is_survey` tinyint(1) DEFAULT 0
);

CREATE TABLE `Question_Options` (
  `option_id` int PRIMARY KEY AUTO_INCREMENT,
  `question_id` int NOT NULL,
  `option_text` varchar(500) NOT NULL,
  `is_correct` tinyint(1) DEFAULT 0
);

CREATE TABLE `User_Submissions` (
  `submission_id` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` varchar(100) NOT NULL,
  `room_id` varchar(50) NOT NULL,
  `question_id` int NOT NULL,
  `submitted_answer_text` text,
  `submitted_option_id` int,
  `submitted_file_url` varchar(512),
  `is_correct` tinyint(1),
  `submitted_at` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `vouchers` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `room_id` varchar(6) NOT NULL,
  `host_room` varchar(255) NOT NULL,
  `reward_type` ENUM ('ticket', 'discount') NOT NULL,
  `ticket_name` varchar(255),
  `ticket_description` varchar(255),
  `ticket_image_url` varchar(1000),
  `discount_name` varchar(255),
  `discount_value` varchar(255),
  `discount_description` text,
  `expiration_date` date
);

CREATE TABLE `Question_Vouchers` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `question_id` int NOT NULL,
  `voucher_id` int NOT NULL,
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `user_vouchers` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `voucher_id` int NOT NULL
);

CREATE TABLE `rewarded_users` (
  `room_id` varchar(6) NOT NULL,
  `username` varchar(255) NOT NULL,
  PRIMARY KEY (`room_id`, `username`)
);

CREATE TABLE `submitedusers` (
  `room_id` varchar(6) NOT NULL,
  `username` varchar(255) NOT NULL,
  PRIMARY KEY (`room_id`, `username`)
);

CREATE TABLE `images` (
  `image_id` int PRIMARY KEY AUTO_INCREMENT,
  `room_id` varchar(6) NOT NULL,
  `uploader_username` varchar(500) NOT NULL,
  `image_path` varchar(500) NOT NULL,
  `uploaded_at` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `test_exam_rooms` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `uuid` varchar(36) UNIQUE NOT NULL,
  `username` varchar(255) NOT NULL,
  `title` varchar(255),
  `created_at` datetime DEFAULT (now()),
  `updated_at` datetime DEFAULT (now())
);

CREATE TABLE `exam_results` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `test_exam_uuid` varchar(36) NOT NULL,
  `student_username` varchar(255) NOT NULL,
  `total_questions` int NOT NULL,
  `correct_answers` int NOT NULL,
  `score_percentage` float NOT NULL,
  `ip_address` varchar(45),
  `cheating_detected` tinyint(1) NOT NULL,
  `cheating_reason` text,
  `exam_cancelled` tinyint(1) NOT NULL,
  `security_violation_detected` tinyint(1) NOT NULL,
  `activity_log` json,
  `suspicious_activity` json,
  `completed_at` datetime DEFAULT (now())
);

CREATE TABLE `job` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `room_id` varchar(6) NOT NULL,
  `job_description` text,
  `job_owner` varchar(255) NOT NULL
);

CREATE TABLE `reports` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `room_id` varchar(6) NOT NULL,
  `username` varchar(255) NOT NULL,
  `reason` varchar(255) NOT NULL,
  `additional_info` varchar(255),
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP),
  `reporter` varchar(255)
);

CREATE TABLE `admin_account` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `username` varchar(255) UNIQUE NOT NULL,
  `password` varchar(255) NOT NULL,
  `fullname` varchar(255) NOT NULL
);

CREATE TABLE `banned_users` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `username` varchar(255) NOT NULL
);

CREATE TABLE `otp` (
  `username` varchar(255) PRIMARY KEY,
  `otp` varchar(4) NOT NULL,
  `otp_expiry` bigint NOT NULL
);

CREATE INDEX `idx_username` ON `users` (`username`);

CREATE UNIQUE INDEX `unique_follow` ON `User_Follows` (`follower_username`, `following_username`);

CREATE INDEX `idx_follower` ON `User_Follows` (`follower_username`);

CREATE INDEX `idx_following` ON `User_Follows` (`following_username`);

CREATE INDEX `idx_room_id` ON `room_users` (`room_id`);

CREATE INDEX `idx_username` ON `room_users` (`username`);

CREATE UNIQUE INDEX `uk_room_question_number` ON `Questions` (`room_id`, `question_number`);

CREATE UNIQUE INDEX `uk_user_room_question` ON `User_Submissions` (`user_id`, `room_id`, `question_id`);

CREATE INDEX `idx_submission_user_room` ON `User_Submissions` (`user_id`, `room_id`);

CREATE INDEX `idx_submission_question` ON `User_Submissions` (`question_id`);

CREATE UNIQUE INDEX `uk_question_voucher` ON `Question_Vouchers` (`question_id`, `voucher_id`);

CREATE INDEX `idx_question_vouchers_question` ON `Question_Vouchers` (`question_id`);

CREATE INDEX `idx_question_vouchers_voucher` ON `Question_Vouchers` (`voucher_id`);

CREATE UNIQUE INDEX `user_vouchers_index_13` ON `user_vouchers` (`username`, `voucher_id`);

CREATE INDEX `idx_room_id` ON `images` (`room_id`);

CREATE INDEX `idx_uploader_username` ON `images` (`uploader_username`);

CREATE INDEX `ix_test_exam_rooms_uuid` ON `test_exam_rooms` (`uuid`);

CREATE INDEX `ix_test_exam_rooms_id` ON `test_exam_rooms` (`id`);

CREATE INDEX `ix_exam_results_id` ON `exam_results` (`id`);

CREATE UNIQUE INDEX `unique_report` ON `reports` (`room_id`, `username`, `reason`);

ALTER TABLE `UserProfile` ADD FOREIGN KEY (`username`) REFERENCES `users` (`username`);

ALTER TABLE `room` ADD FOREIGN KEY (`admin_username`) REFERENCES `users` (`username`);

ALTER TABLE `room_users` ADD FOREIGN KEY (`room_id`) REFERENCES `room` (`room_id`);

ALTER TABLE `room_users` ADD FOREIGN KEY (`username`) REFERENCES `users` (`username`);

ALTER TABLE `Questions` ADD FOREIGN KEY (`room_id`) REFERENCES `room` (`room_id`);

ALTER TABLE `Question_Options` ADD FOREIGN KEY (`question_id`) REFERENCES `Questions` (`question_id`);

ALTER TABLE `User_Submissions` ADD FOREIGN KEY (`room_id`) REFERENCES `room` (`room_id`);

ALTER TABLE `User_Submissions` ADD FOREIGN KEY (`question_id`) REFERENCES `Questions` (`question_id`);

ALTER TABLE `vouchers` ADD FOREIGN KEY (`room_id`) REFERENCES `room` (`room_id`);

ALTER TABLE `vouchers` ADD FOREIGN KEY (`host_room`) REFERENCES `users` (`username`);

ALTER TABLE `Question_Vouchers` ADD FOREIGN KEY (`question_id`) REFERENCES `Questions` (`question_id`);

ALTER TABLE `Question_Vouchers` ADD FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`);

ALTER TABLE `user_vouchers` ADD FOREIGN KEY (`username`) REFERENCES `users` (`username`);

ALTER TABLE `user_vouchers` ADD FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`);

ALTER TABLE `rewarded_users` ADD FOREIGN KEY (`room_id`) REFERENCES `room` (`room_id`);

ALTER TABLE `rewarded_users` ADD FOREIGN KEY (`username`) REFERENCES `users` (`username`);

ALTER TABLE `submitedusers` ADD FOREIGN KEY (`room_id`) REFERENCES `room` (`room_id`);

ALTER TABLE `submitedusers` ADD FOREIGN KEY (`username`) REFERENCES `users` (`username`);

ALTER TABLE `images` ADD FOREIGN KEY (`room_id`) REFERENCES `room` (`room_id`);

ALTER TABLE `images` ADD FOREIGN KEY (`uploader_username`) REFERENCES `users` (`username`);

ALTER TABLE `exam_results` ADD FOREIGN KEY (`test_exam_uuid`) REFERENCES `test_exam_rooms` (`uuid`);

ALTER TABLE `job` ADD FOREIGN KEY (`room_id`) REFERENCES `room` (`room_id`);

ALTER TABLE `job` ADD FOREIGN KEY (`job_owner`) REFERENCES `users` (`username`);

ALTER TABLE `reports` ADD FOREIGN KEY (`room_id`) REFERENCES `room` (`room_id`);

ALTER TABLE `reports` ADD FOREIGN KEY (`username`) REFERENCES `users` (`username`);

ALTER TABLE `reports` ADD FOREIGN KEY (`reporter`) REFERENCES `users` (`username`);

ALTER TABLE `otp` ADD FOREIGN KEY (`username`) REFERENCES `users` (`username`);
