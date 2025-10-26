const express = require('express');
const router = express.Router();
const db = require('./db');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

function generateToken() {
  return crypto.randomBytes(10).toString('hex');
}

router.post('/', async (req, res) => {
  const { name, address, phone, email, message, hp } = req.body;
  if (hp) return res.status(400).json({ error: 'Spam detected' });

  const threadToken = generateToken();

  await db.execute(
    `INSERT INTO messages (thread_token, customer_name, customer_email, subject, body, status, created_at)
     VALUES (?, ?, ?, ?, ?, 'new', NOW())`,
    [threadToken, name, email, `Contact from ${name}`, `Address: ${address}\nPhone: ${phone}\n\n${message}`]
  );

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD }
  });

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: process.env.GMAIL_USER,
    subject: `New message from ${name}`,
    text: `From: ${name}\nEmail: ${email}\nPhone: ${phone}\nAddress: ${address}\n\n${message}`,
    replyTo: email
  });

  res.json({ ok: true, thread_token: threadToken });
});

module.exports = router;
