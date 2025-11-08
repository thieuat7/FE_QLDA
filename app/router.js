// app/routes.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const dbPath = path.join(__dirname, 'db.json');

// 1. GET /health
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// 2. GET /users
router.get('/users', (req, res) => {
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    res.status(200).json(data.users);
});

// 3. POST /user
router.post('/user', (req, res) => {
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    const newUser = {
        id: data.users.length + 1,
        name: req.body.name
    };
    data.users.push(newUser);
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    res.status(201).json(newUser);
});

module.exports = router;