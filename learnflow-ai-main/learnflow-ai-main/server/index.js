const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors({
    origin: ['http://localhost:8080', 'http://localhost:8082'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());

const PORT = 5000;
const JWT_SECRET = 'learnflow_secret_key_123';

// Database connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'vignesh2005', // Updated password
    database: 'learnflow_ai',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Verify connection
pool.query('SELECT 1').then(() => {
    console.log('Connected to MySQL Database.');
}).catch(err => {
    console.error('Database connection failed:', err);
});

// --- Auth Routes ---

// Register
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = Date.now().toString();
        await pool.query(
            'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
            [userId, name, email, hashedPassword, role || 'student']
        );
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ error: 'User not found' });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Course Routes ---

// Get all courses (Catalog)
app.get('/api/courses', async (req, res) => {
    try {
        const [courses] = await pool.query('SELECT * FROM courses');
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get student enrollments and stats
app.get('/api/student/dashboard/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const [enrollments] = await pool.query(
          'SELECT e.*, c.title, c.description, c.instructor, c.category, c.difficulty, c.total_lessons ' +
          'FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE e.user_id = ?',
          [userId]
        );
        
        // Calculate stats
        const coursesEnrolled = enrollments.length;
        const avgProgress = enrollments.length > 0 
            ? enrollments.reduce((acc, curr) => acc + curr.progress, 0) / enrollments.length 
            : 0;
        const totalHours = enrollments.reduce((acc, curr) => acc + curr.hours_learned, 0);
        
        res.json({
            enrollments,
            stats: {
                coursesEnrolled,
                avgProgress: Math.round(avgProgress),
                hoursLearned: totalHours.toFixed(1),
                certificates: 0 // Placeholder
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Enroll in a course
app.post('/api/student/enroll', async (req, res) => {
    const { userId, courseId } = req.body;
    try {
        await pool.query(
            'INSERT IGNORE INTO enrollments (user_id, course_id) VALUES (?, ?)',
            [userId, courseId]
        );
        res.json({ message: 'Enrolled successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get detailed course status (lessons + completion)
app.get('/api/course/:courseId/status/:userId', async (req, res) => {
    const { courseId, userId } = req.params;
    try {
        const [course] = await pool.query('SELECT * FROM courses WHERE id = ?', [courseId]);
        if (course.length === 0) return res.status(404).json({ error: 'Course not found' });

        const [lessons] = await pool.query('SELECT * FROM lessons WHERE course_id = ? ORDER BY lesson_order', [courseId]);
        const [completed] = await pool.query('SELECT lesson_id, watch_percentage FROM user_lessons WHERE user_id = ?', [userId]);
        
        const completedMap = {};
        completed.forEach(c => {
            completedMap[c.lesson_id] = c.watch_percentage;
        });

        const processedLessons = lessons.map(l => ({
            ...l,
            watch_percentage: completedMap[l.id] || 0,
            completed: (completedMap[l.id] || 0) >= 90 // treat 90%+ as complete for checks
        }));

        res.json({
            course: course[0],
            lessons: processedLessons
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single lesson by ID
app.get('/api/lesson/:lessonId', async (req, res) => {
    const { lessonId } = req.params;
    try {
        const [lessons] = await pool.query('SELECT * FROM lessons WHERE id = ?', [lessonId]);
        if (lessons.length === 0) return res.status(404).json({ error: 'Lesson not found' });
        
        // Map snake_case to camelCase where necessary for frontend
        const lesson = {
            id: lessons[0].id,
            courseId: lessons[0].course_id,
            title: lessons[0].title,
            description: lessons[0].description,
            videoUrl: lessons[0].video_url,
            duration: lessons[0].duration,
            lessonOrder: lessons[0].lesson_order
        };
        res.json(lesson);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark lesson as complete (or update progress)
app.post('/api/student/complete-lesson', async (req, res) => {
    const { userId, lessonId, courseId, watchPercentage = 100 } = req.body;
    try {
        // Insert or update watch_percentage
        await pool.query(
            `INSERT INTO user_lessons (user_id, lesson_id, watch_percentage) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE 
             watch_percentage = IF(VALUES(watch_percentage) > watch_percentage, VALUES(watch_percentage), watch_percentage), 
             completed_at = CURRENT_TIMESTAMP`, 
             [userId, lessonId, watchPercentage]
        );
        
        // Update enrollment progress
        const [totalLessons] = await pool.query('SELECT COUNT(*) as count FROM lessons WHERE course_id = ?', [courseId]);
        const [progressQuery] = await pool.query(
            `SELECT SUM(ul.watch_percentage) as total_percent, COUNT(ul.lesson_id) as completed_count 
             FROM user_lessons ul JOIN lessons l ON ul.lesson_id = l.id 
             WHERE ul.user_id = ? AND l.course_id = ?`,
            [userId, courseId]
        );
        
        const totalPossible = totalLessons[0].count * 100;
        const currentSum = progressQuery[0].total_percent || 0;
        const progress = Math.round((currentSum / totalPossible) * 100);
        
        await pool.query(
            'UPDATE enrollments SET progress = ?, completed_lessons = ? WHERE user_id = ? AND course_id = ?',
            [progress, progressQuery[0].completed_count, userId, courseId]
        );

        res.json({ message: 'Progress updated', progress });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// OLLAMA AI INTEGRATION ROUTES (Model: phi3)
// ==========================================
const OLLAMA_URL = 'http://localhost:11434/api/generate';
const OLLAMA_CHAT_URL = 'http://localhost:11434/api/chat';
const MODEL = 'phi3';

// Generate contextual AI suggestions based on student's load
app.post('/api/ai/suggest', async (req, res) => {
    const { loadScore, interactions, courseContext } = req.body;
    try {
        let prompt = '';
        if (loadScore > 0.70) {
            prompt = `You are a deeply helpful AI Tutor. The student is extremely confused and struggling (Cognitive Load: ${Math.round(loadScore*100)}%) with the video lesson topic: "${courseContext}". 
            MANDATORY: Give a comprehensive but beautifully simple 3-sentence ELI5 (Explain Like I'm 5) analogy of this topic right now to help them. Then, add 2 bullet points suggesting incredibly specific alternative ways to think about.`;
        } else {
            prompt = `You are a strict but helpful AI tutor. A student is watching a video lesson: "${courseContext}". Their cognitive load score is ${Math.round(loadScore * 100)}%. They have paused ${interactions.pauses} times. Give a brief, ONE SENTENCE encouraging suggestion.`;
        }
        
        const response = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: MODEL, prompt, stream: false })
        });
        const data = await response.json();
        res.json({ suggestion: data.response });
    } catch (err) {
        // Fallback if Ollama is off
        res.json({ suggestion: "Llama AI is offline. Focus on the basics, take a break if needed." });
    }
});

// Autonomous JSON Adaptation Engine
app.post('/api/ai/adaptation-engine', async (req, res) => {
    const { loadScore, interactions, courseContext } = req.body;
    try {
        const prompt = `You are the LearnFlow AI Adaptation Engine overseeing a student learning "${courseContext}".
Current cognitive load: ${Math.round(loadScore * 100)}% (0-40=Low/Bored, 41-74=Medium/Optimal, 75-100=High/Confused).
Interaction pauses: ${interactions.pauses}, Rewinds: ${interactions.rewinds}.

Calculate 5 specific UI actions based on the load.
Return ONLY valid JSON exactly matching this structure, with no markdown formatting:
{
  "pacing_action": "pause_video" | "speed_up" | "normal",
  "difficulty_action": "simplify" | "challenge" | "normal",
  "modality_action": "show_diagram" | "text_bullets" | "normal",
  "hint_action": "show_hint" | "hide_hint",
  "break_action": "suggest_break" | "none"
}`;

        const response = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: MODEL, prompt, stream: false, format: 'json' }) // force JSON
        });
        const data = await response.json();
        const jsonOutput = JSON.parse(data.response);
        res.json(jsonOutput);
    } catch (err) {
        console.error('Adaptation Engine Error:', err);
        // Fallback to normal behavior
        res.json({
            pacing_action: "normal",
            difficulty_action: "normal",
            modality_action: "normal",
            hint_action: "hide_hint",
            break_action: "none"
        });
    }
});

// Generate a rapid quiz if struggling
app.post('/api/ai/quiz', async (req, res) => {
    const { courseContext } = req.body;
    try {
        const prompt = `You are an AI instructor. The student is struggling with the lesson: "${courseContext}". First, provide a highly simplified 'ELI5' explanation of this topic in exactly 2 sentences. Then, generate ONE simple multiple-choice question. Format EXACTLY like this:
Explanation: [2 sentences simplified explanation]
Question: [question text]
A) [option 1]
B) [option 2]
C) [option 3]
Correct: [A/B/C]`;
        
        const response = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: MODEL, prompt, stream: false })
        });
        const data = await response.json();
        res.json({ quizText: data.response });
    } catch (err) {
        res.status(500).json({ error: "Failed to generate quiz" });
    }
});

// Generate comprehensive full-course JSON quiz
app.post('/api/ai/course-test', async (req, res) => {
    const { courseTitle, courseDescription } = req.body;
    try {
        // Use a cleaner prompt without format:json so the model is more flexible
        const prompt = `You are an exam creator. Generate exactly 5 multiple choice questions for the course "${courseTitle}" (Description: "${courseDescription}").

You MUST respond with a valid JSON array only. No markdown, no explanation, just the raw JSON array.

Format:
[{"question":"...","options":["option1","option2","option3","option4"],"correctIndex":0},{"question":"...","options":["option1","option2","option3","option4"],"correctIndex":2}]

Generate 5 questions now:`;
        
        const response = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: MODEL, prompt, stream: false })
        });
        const data = await response.json();
        const rawText = data.response || '';
        console.log('[course-test] raw AI response:', rawText.substring(0, 300));
        
        // Robust extraction: find first [ ... ] block in response
        let questions = null;
        try {
            // Try direct parse first
            const parsed = JSON.parse(rawText.trim());
            // Handle object wrappers like {"questions": [...]} or {"test": [...]}
            if (Array.isArray(parsed)) {
                questions = parsed;
            } else if (parsed && typeof parsed === 'object') {
                // Find the first array-valued key
                const arrKey = Object.keys(parsed).find(k => Array.isArray(parsed[k]));
                if (arrKey) questions = parsed[arrKey];
            }
        } catch(e1) {
            // Try to extract a JSON array via regex
            const match = rawText.match(/(\[\s*\{[\s\S]*?\}\s*\])/m);
            if (match) {
                try { questions = JSON.parse(match[1]); } catch(e2) { /* ignore */ }
            }
        }

        // Validate all questions have required fields
        if (questions && Array.isArray(questions) && questions.length > 0) {
            const valid = questions.filter(q => q.question && Array.isArray(q.options) && q.options.length >= 2 && typeof q.correctIndex === 'number');
            if (valid.length > 0) {
                return res.json({ testContent: valid });
            }
        }

        // Fallback with hardcoded questions only as last resort
        console.log('[course-test] AI parse failed, using fallback');
        res.json({ testContent: [
            { question: `What is the primary focus of "${courseTitle}"?`, options: ["The core concepts taught in this course", "Entertainment", "Unrelated topics", "None of the above"], correctIndex: 0 },
            { question: `Which best describes the approach used in "${courseTitle}"?`, options: ["Structured learning with clear objectives", "Random information", "Pure memorization", "Trial and error only"], correctIndex: 0 },
            { question: `Completing "${courseTitle}" will help you to?`, options: ["Gain practical skills in this subject", "Learn cooking", "Improve physical fitness", "None"], correctIndex: 0 },
            { question: `What should a student do when stuck on a concept in this course?`, options: ["Review that lesson section again", "Give up immediately", "Skip all questions", "Ignore the topic"], correctIndex: 0 },
            { question: `How is this course best completed?`, options: ["Watch all lessons and take the final test", "Skip all video content", "Only read summaries", "Submit without watching"], correctIndex: 0 }
        ]});
    } catch (err) {
        console.error('[course-test] error:', err);
        res.status(500).json({ error: "Failed to generate course test" });
    }
});

// Chatbot functionality
app.post('/api/ai/chat', async (req, res) => {
    const { messages, courseContext } = req.body;
    try {
        const systemMessage = { role: 'system', content: `You are LearnFlow AI, a specialized tutor for the lesson: "${courseContext}". MANDATORY strict rule: Limit ALL responses to a maximum of 2 sentences and absolutely incredibly brief. If you write a long paragraph you fail.` };
        
        const response = await fetch(OLLAMA_CHAT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: MODEL, messages: [systemMessage, ...messages], stream: false })
        });
        const data = await response.json();
        res.json({ reply: data.message.content });
    } catch (err) {
        res.status(500).json({ error: "Chatbot is currently offline." });
    }
});

// ==========================================
// COMMENTS SECTION ROUTES
// ==========================================

// Get comments for a lesson
app.get('/api/lesson/:lessonId/comments', async (req, res) => {
    const { lessonId } = req.params;
    try {
        const [comments] = await pool.query(
            `SELECT c.id, c.content, c.created_at, u.name as username 
             FROM comments c 
             JOIN users u ON c.user_id = u.id 
             WHERE c.lesson_id = ? 
             ORDER BY c.created_at DESC`, 
            [lessonId]
        );
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Post a new comment
app.post('/api/lesson/:lessonId/comments', async (req, res) => {
    const { lessonId } = req.params;
    const { userId, content } = req.body;
    try {
        await pool.query('INSERT INTO comments (lesson_id, user_id, content) VALUES (?, ?, ?)', [lessonId, userId, content]);
        res.json({ message: 'Comment posted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
