const mysql = require('mysql2/promise');
const fs = require('fs');

async function run() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'YOUR-PASSWORD'
    });

    console.log('Connected to MySQL.');
    const sql = fs.readFileSync('server/setup.sql', 'utf8');
    
    // Split by semicolon, but be careful with multiline or string literals
    // For simpler setup, we'll just run it. mysql2 connection doesn't support multiple statements by default
    // We need to enable multipleStatements: true
    const setupConnection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'YOUR-PASSWORD',
        multipleStatements: true
    });

    try {
        await setupConnection.query(sql);
        console.log('Schema applied successfully.');
    } catch (err) {
        console.error('Error applying schema:', err);
    } finally {
        await setupConnection.end();
        await connection.end();
    }
}

run();
