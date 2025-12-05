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

    // Lấy thông tin user hiện tại
    async getCurrentUser() {
        const response = await axiosInstance.get('/auth/me');
        return response.data;
    }

    // Cập nhật thông tin user
    async updateProfile(userData) {
        const response = await axiosInstance.put('/auth/update-profile', userData);
        return response.data;
    }

    // Đổi mật khẩu
    async changePassword(passwordData) {
        const response = await axiosInstance.post('/auth/change-password', passwordData);
        return response.data;
    }

    // Upload avatar
    async uploadAvatar(formData) {
        const response = await axiosInstance.post('/auth/upload-avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }

    // Lấy danh sách người dùng (admin)
    async getUsers() {
        const response = await axiosInstance.get('/users');
        return response.data;
    }

    // Thêm người dùng mới (admin)
    async addUser(userData) {
        const response = await axiosInstance.post('/user', userData);
        return response.data;
    }

    // ============ CATEGORY APIs ============

    // Lấy danh sách danh mục
    async getCategories() {
        const response = await axiosInstance.get('/categories');
        return response.data;
    }

    // ============ PRODUCT APIs ============

    // Lấy danh sách sản phẩm với filter, sort, pagination
    async getProducts(params = {}) {
        const { page = 1, limit = 12, category_id, sort } = params;
        const queryParams = new URLSearchParams();

        queryParams.append('page', page);
        queryParams.append('limit', limit);
        if (category_id) queryParams.append('category_id', category_id);
        if (sort) queryParams.append('sort', sort);

        const response = await axiosInstance.get(`/products?${queryParams.toString()}`);
        return response.data;
    }

    // Tìm kiếm sản phẩm
    async searchProducts(keyword) {
        const response = await axiosInstance.get(`/products/search?q=${encodeURIComponent(keyword)}`);
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
export { axiosInstance as apiClient };