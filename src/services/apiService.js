// Service để gọi API
import axios from 'axios';

const API_URL = '/api'; // Proxy qua Vite

// Tạo axios instance với config mặc định
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor để thêm token vào mỗi request
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor để xử lý response errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token hết hạn hoặc không hợp lệ
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

class ApiService {
    // ============ AUTH APIs ============

    // Đăng ký tài khoản
    async register(userData) {
        // Backend cần: username, email, password, confirmPassword, fullName, phone
        const { username, email, password, confirmPassword, fullName, phone } = userData;
        const response = await axiosInstance.post('/auth/register', {
            username,
            email,
            password,
            confirmPassword,
            fullName,
            phone
        });
        return response.data;
    }

    // Đăng nhập
    async login(credentials) {
        const response = await axiosInstance.post('/auth/login', credentials);
        if (response.data.success && response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    }

    // ============ USER APIs ============

    // Lấy danh sách người dùng
    async getUsers() {
        const response = await axiosInstance.get('/users');
        return response.data;
    }

    // Thêm người dùng mới
    async addUser(userData) {
        const response = await axiosInstance.post('/user', userData);
        return response.data;
    }

    // ============ PRODUCT APIs ============

    // Lấy danh sách sản phẩm
    async getProducts(params) {
        const response = await axiosInstance.get('/products', { params });
        return response.data;
    }

    // Tìm kiếm sản phẩm
    async searchProducts(keyword) {
        const response = await axiosInstance.get('/products/search', {
            params: { keyword }
        });
        return response.data;
    }

    // Lấy chi tiết sản phẩm
    async getProductById(id) {
        const response = await axiosInstance.get(`/products/${id}`);
        return response.data;
    }

    // ============ HEALTH CHECK ============

    // Kiểm tra health
    async checkHealth() {
        const response = await axiosInstance.get('/health');
        return response.data;
    }
}

export default new ApiService();