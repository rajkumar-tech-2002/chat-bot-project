-- 1. Create DataBase
CREATE DATABASE IF NOT EXISTS chatbot;
USE chatbot;

-- 2. Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(255),
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

-- 3. Create Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  question TEXT,
  answer TEXT,
  category VARCHAR(255),
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

-- 4. Create Documents Table
CREATE TABLE IF NOT EXISTS documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  file_path VARCHAR(255),
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

-- 5. Create Voice Logs Table (Zhara Voice Assistant)
CREATE TABLE IF NOT EXISTS voice_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  visitor_id INT NULL,
  question_text TEXT,
  answer_text TEXT,
  audio_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
