CREATE DATABASE IF NOT EXISTS learnflow_ai;
USE learnflow_ai;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'teacher') NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor VARCHAR(255),
    thumbnail VARCHAR(255),
    category VARCHAR(255),
    difficulty ENUM('beginner', 'intermediate', 'advanced'),
    total_lessons INT DEFAULT 0
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
    id VARCHAR(255) PRIMARY KEY,
    course_id VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url VARCHAR(255),
    duration VARCHAR(50),
    lesson_order INT,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255),
    course_id VARCHAR(255),
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress FLOAT DEFAULT 0,
    completed_lessons INT DEFAULT 0,
    hours_learned FLOAT DEFAULT 0,
    UNIQUE KEY (user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Seed Courses
INSERT INTO courses (id, title, description, instructor, category, difficulty, total_lessons) VALUES
('1', 'Introduction to Machine Learning', 'Learn the fundamentals of machine learning, including supervised and unsupervised learning, neural networks, and practical applications.', 'Dr. Sarah Chen', 'AI & ML', 'intermediate', 12),
('2', 'Data Structures & Algorithms', 'Master essential data structures and algorithms for technical interviews and real-world problem solving.', 'Prof. James Wilson', 'Computer Science', 'advanced', 20),
('3', 'Web Development Bootcamp', 'Full-stack web development from HTML/CSS to React and Node.js. Build real projects.', 'Emily Rodriguez', 'Web Dev', 'beginner', 15),
('4', 'Statistics for Data Science', 'Statistical foundations every data scientist needs: probability, distributions, hypothesis testing.', 'Dr. Michael Park', 'Data Science', 'intermediate', 10);

-- Seed Lessons for Course 1
INSERT INTO lessons (id, course_id, title, description, video_url, duration, lesson_order) VALUES
('l1', '1', 'What is Machine Learning?', 'An overview of ML concepts and applications in the real world.', 'https://www.youtube.com/embed/ukzFI9rgwfU', '15:30', 1),
('l2', '1', 'Supervised vs Unsupervised Learning', 'Understanding the key differences between learning paradigms.', 'https://www.youtube.com/embed/W01tIRP_Rqs', '22:15', 2);

-- User Lessons (Tracking which lessons each student has completed)
CREATE TABLE IF NOT EXISTS user_lessons (
    user_id VARCHAR(255),
    lesson_id VARCHAR(255),
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, lesson_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);
