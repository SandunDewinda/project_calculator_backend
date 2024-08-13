const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
app.use(cors());

app.use(express.json()); // To handle JSON data

app.get('/', (req, res) => {
  res.send('Hello');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const mysql = require('mysql2');
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'calculator'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to Database:', err);
        return;
    } else {
        console.log('Database connected');
    }
});

app.post('/register', (req, res) => {
    const { email, password } = req.body;
    const query = 'INSERT INTO users (email, password) VALUES (?, ?)';
    db.query(query, [email, password], (err, result) => {
        if (err) {
            console.error('Error registering user:', err);
            res.status(500).send('Error registering user');
            return;
        }
        res.status(201).send('User registered successfully');
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(query, [email, password], (err, result) => {
        if (err) {
            res.status(500).send('Error logging in');
            return; // Stop further execution
        }
        if (result.length === 0) {
            res.status(400).send('Invalid email or password');
            return; // Stop further execution
        }
        res.status(200).send('Login successful');
    });
});
