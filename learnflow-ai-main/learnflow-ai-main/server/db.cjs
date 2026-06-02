const mysql = require('mysql2');
const path = require('path');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'YOUR-PASSWORD', // Update if needed
    database: 'learnflow_ai',
    multipleStatements: true
});

db.connect((err) => {
    if (err) {
        console.error('MySQL Connection Error:', err.message);
        return;
    }
    console.log('Connected to MySQL Database: learnflow_ai');
});

module.exports = db;
