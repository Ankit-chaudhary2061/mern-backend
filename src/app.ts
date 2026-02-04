// src/app.ts
import express from 'express';
import './database/connection'; // MongoDB connection

const app = express();

// Middleware example (optional)
app.use(express.json());

// Example route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

export default app;
