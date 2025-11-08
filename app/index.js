// app/index.js
const express = require('express');
const routes = require('./routes');
const app = express();
const PORT = process.env.PORT || 5000; // Dùng port 5000 như yêu cầu

// Middleware để đọc JSON body
app.use(express.json());

// Sử dụng các routes
app.use('/', routes);

// Khởi động server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

// Export server để file test có thể import
module.exports = server;