-- 1. Create DataBase
CREATE DATABASE IF NOT EXISTS chatbot;
USE chatbot;

-- 2. Create Users (Admins) Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  user_id VARCHAR(255) UNIQUE,
  email VARCHAR(255),
  password VARCHAR(255),
  phone VARCHAR(255),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Create Visitors (End-Users) Table
CREATE TABLE IF NOT EXISTS visitors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  mobile VARCHAR(255) UNIQUE,
  email VARCHAR(255),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Create Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT, -- Refers to Admin who might have initiated or system user
  visitor_id INT, -- Refers to the end-user (Visitor)
  question TEXT,
  answer TEXT,
  category VARCHAR(255),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. Create Documents Table
CREATE TABLE IF NOT EXISTS documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  file_path VARCHAR(255),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 6. Create Voice Logs Table (Zhara Voice Assistant)
CREATE TABLE IF NOT EXISTS voice_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  visitor_id INT NULL,
  question_text TEXT,
  answer_text TEXT,
  audio_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Create Avatars Table (Dynamic Admin-Managed Avatars)
CREATE TABLE IF NOT EXISTS avatars (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  gender ENUM('male', 'female') NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  greeting_video_url VARCHAR(500) DEFAULT NULL,
  speaking_video_url VARCHAR(500) DEFAULT NULL,
  description VARCHAR(500) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

