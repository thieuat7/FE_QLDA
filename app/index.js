// app/index.js
const express = require('express');
const routes = require('./router'); // Sửa đường dẫn
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware để đọc JSON body
app.use(express.json());

// Sử dụng các routes
app.use('/', routes);

// Khởi động server
const server = app.listen(PORT, () => {  // Bỏ '0.0.0.0' để tránh bind issues
    console.log(`Server running on port ${PORT}`);
});

// Export server để file test có thể import
module.exports = server;