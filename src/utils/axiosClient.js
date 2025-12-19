// src/api/axiosClient.js
import axios from 'axios';

// Tạo một instance của axios với cấu hình cơ bản
const axiosClient = axios.create({
    // Logic quan trọng:
    // - Nếu có biến môi trường (trên Render) -> dùng link Render
    // - Nếu không (ở dưới máy local) -> fallback về localhost hoặc dùng proxy cũ
    baseURL: import.meta.env.VITE_API_URL || 'https://be-qlda.onrender.com/api',
    
    headers: {
        'Content-Type': 'application/json',
    },
});

// (Tùy chọn) Thêm interceptors để tự động gắn Token nếu cần
axiosClient.interceptors.request.use(async (config) => {
    // Ví dụ: Lấy token từ localStorage gửi kèm
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosClient;