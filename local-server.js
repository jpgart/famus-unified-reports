const express = require('express');
const path = require('path');
const app = express();
const PORT = 3001;

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle all routes and return the index.html file for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Serving files from:', path.join(__dirname, 'dist'));
});
