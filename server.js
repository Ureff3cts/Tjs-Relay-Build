const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

// middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// serve static website (index.html + assets)
app.use(express.static(path.join(__dirname)));

// API route
const contactRouter = require('./api/contact');
app.use('/api/contact', contactRouter);

// catch-all 404 for API
app.use('/api/*', (req, res) => res.status(404).json({ error: 'Not found' }));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
