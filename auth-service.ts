const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Secret key for JWT signing (should be stored securely)
const jwtSecret = 'your-secret-key';

// User data (simplified, should be stored in a database)
const users = [
  { id: 1, username: 'user1', password: 'password1' },
  { id: 2, username: 'user2', password: 'password2' },
];

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Endpoint to authenticate and generate JWT
app.post('/login', (req: any, res: any) => {
  const { username, password } = req.body;

  // Check if the provided credentials are valid (in a real app, validate against a database)
  const user = users.find((u) => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Generate a JWT token
  const token = jwt.sign({ userId: user.id, username: user.username }, jwtSecret, {
    expiresIn: '1h', // Token expires in 1 hour
  });

  res.json({ token });
});

// Start the authentication service
app.listen(port, () => {
  console.log(`Authentication service is running on port ${port}`);
});
