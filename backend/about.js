// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data for the college information
const collegeInfo = {
  collegeName: "ABC College of Engineering",
  associationName: "ABC Alumni Association",
  location: "City, State, Zip",
  history: "ABC College was established in 1990 and has been providing quality education in engineering.",
  contactEmail: "contact@abccollege.edu",
  contactPhone: "+1 (123) 456-7890",
};

// Route to get college information
app.get('/api/about', (req, res) => {
  res.json(collegeInfo);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});