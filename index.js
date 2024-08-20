const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
app.use(cors());

app.use(express.json()); // To handle JSON data

app.get("/", (req, res) => {
  res.send("Hello");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const mysql = require("mysql2");
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "calculator",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to Database:", err);
    return;
  } else {
    console.log("Database connected");
  }
});

// app.post('/register', (req, res) => {
//     const { email, password } = req.body;
//     const query = 'INSERT INTO users (email, password) VALUES (?, ?)';
//     db.query(query, [email, password], (err, result) => {
//         if (err) {
//             console.error('Error registering user:', err);
//             res.status(500).send('Error registering user');
//             return;
//         }
//         res.status(201).send('User registered successfully');
//     });
// });

app.post("/signup", (req, res) => {
  const { username, email, password, jobName } = req.body;

  if (!username || !email || !password || !jobName) {
    return res.status(400).send("All fields are required");
  }

  const userInsertQuery =
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

  db.query(userInsertQuery, [username, email, password], (err, userResult) => {
    if (err) {
      console.error("Error inserting user:", err); // Log the error
      res.status(500).send("Error creating user");
      return;
    }

    const userId = userResult.insertId;

    const jobQuery = "SELECT job_id FROM jobs WHERE job_name = ?";

    db.query(jobQuery, [jobName], (err, jobResult) => {
      if (err) {
        console.error("Error finding job:", err); // Log the error
        res.status(500).send("Error finding job");
        return;
      }

      if (jobResult.length === 0) {
        res.status(400).send("Invalid job name");
        return;
      }

      const jobId = jobResult[0].job_id;

      const userJobInsertQuery =
        "INSERT INTO userjobs (user_id, job_id) VALUES (?, ?)";

      db.query(userJobInsertQuery, [userId, jobId], (err) => {
        if (err) {
          console.error("Error assigning job to user:", err); // Log the error
          res.status(500).send("Error assigning job to user");
          return;
        }

        res.status(201).json({ message: "User created successfully" });
      });
    });
  });
});

// app.post('/login', (req, res) => {
//     const { email, password } = req.body;
//     const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
//     db.query(query, [email, password], (err, result) => {
//         if (err) {
//             res.status(500).send('Error logging in');
//             return; // Stop further execution
//         }
//         if (result.length === 0) {
//             res.status(400).send('Invalid email or password');
//             return; // Stop further execution
//         }
//         res.status(200).send('Login successful');
//     });
// });

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Query to select user by email and password
  const userQuery = "SELECT * FROM users WHERE email = ? AND password = ?";

  db.query(userQuery, [email, password], (err, userResult) => {
    if (err) {
      res.status(500).send("Error logging in");
      return; // Stop further execution
    }

    if (userResult.length === 0) {
      res.status(400).send("Invalid email or password");
      return; // Stop further execution
    }

    const userId = userResult[0].user_id;

    // Query to get the user's job name
    const jobQuery = `
            SELECT j.job_name 
            FROM jobs j
            INNER JOIN userjobs uj ON j.job_id = uj.job_id
            WHERE uj.user_id = ?`;

    db.query(jobQuery, [userId], (err, jobResult) => {
      if (err) {
        res.status(500).send("Error retrieving job information");
        return; // Stop further execution
      }

      if (jobResult.length === 0) {
        res.status(400).send("No job found for this user");
        return; // Stop further execution
      }

      const jobName = jobResult[0].job_name;

      // Respond with the job name
      res.status(200).json({ message: "Login successful", jobName: jobName });
    });
  });
});
