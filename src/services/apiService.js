// Service để gọi API
import axios from 'axios';

// -----------------------------------------------------------------------------
// SỬA ĐỔI QUAN TRỌNG TẠI ĐÂY:
// 1. Nếu trên Render: Nó sẽ lấy link từ biến môi trường VITE_API_URL
// 2. Nếu dưới Local: Nó sẽ lấy http://localhost:3000/api (hoặc link bạn muốn)
// -----------------------------------------------------------------------------
const API_URL = import.meta.env.VITE_API_URL || 'https://be-qlda.onrender.com/api';

console.log('Current API URL:', API_URL); // Log ra để kiểm tra đang chạy môi trường nào

// Tạo axios instance với config mặc định
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
    // Lưu ý: Không cần withCredentials: true trừ khi bạn dùng Cookie
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
        // Kiểm tra nếu lỗi là 401 (Unauthorized) - Token hết hạn hoặc không hợp lệ
        if (error.response?.status === 401) {
            console.warn('Phát hiện lỗi 401 (Unauthorized). Đang gửi sự kiện auth-expired...');

            window.dispatchEvent(new CustomEvent('auth-expired', {
                detail: {
                    status: 401,
                    message: error.response?.data?.message || 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
                }
            }));
            
            // Xóa token cũ đi để tránh loop lỗi
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }

        // Vẫn trả về Promise.reject để component đang gọi API biết đường tắt Loading
        return Promise.reject(error);
    }
);

class ApiService {
    // Lấy sản phẩm hot
    async getHotProducts() {
        const response = await axiosInstance.get('/products/hot');
        return response.data;
    }

    // Lấy sản phẩm sale
    async getSaleProducts() {
        const response = await axiosInstance.get('/products/sale');
        return response.data;
    }
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
    async getUsers(page = 1, limit = 10) {
        const response = await axiosInstance.get(`/users?page=${page}&limit=${limit}`);
        return response.data;
    }

    // Lấy thông tin profile của chính mình
    async getUserProfile() {
        const response = await axiosInstance.get('/users/me');
        return response.data;
    }

    // Cập nhật profile của chính mình
    async updateUserProfile(userData) {
        const response = await axiosInstance.put('/users/me', userData);
        return response.data;
    }

    // Cập nhật user (admin) - bao gồm role
    async updateUser(userId, userData) {
        const response = await axiosInstance.put(`/users/${userId}`, userData);
        return response.data;
    }

    // Xóa user (admin)
    async deleteUser(userId) {
        const response = await axiosInstance.delete(`/users/${userId}`);
        return response.data;
    }

    // Thêm người dùng mới (admin)
    async addUser(userData) {
        const response = await axiosInstance.post('/users', userData);
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

    // ============ PAYMENT HISTORY APIs ============

    // Lấy lịch sử thanh toán (admin)
    async getAdminPaymentHistory(params = {}) {
        const {
            page = 1,
            limit = 20,
            status = '',
            paymentStatus = '',
            searchTerm = '',
            sortBy = '',
            sortOrder = ''
        } = params;
        const response = await axiosInstance.get('/payment-history/admin', {
            params: {
                page,
                limit,
                status,
                paymentStatus,
                search: searchTerm,
                sortBy,
                sortOrder
            }
        });
        return response.data;
    }

    // Lấy lịch sử thanh toán (người dùng hiện tại)
    async getUserPaymentHistory(params = {}) {
        const { page = 1, limit = 10, status = '', paymentStatus = '', searchTerm = '' } = params;
        const response = await axiosInstance.get('/payment-history/user', {
            params: {
                page,
                limit,
                status,
                paymentStatus,
                search: searchTerm
            }
        });
        return response.data;
    }

    // Xác nhận thanh toán cho đơn (admin)
    async confirmOrderPayment(orderId) {
        const response = await axiosInstance.put(`/admin/orders/${orderId}/payment-status`, {
            paymentStatus: 'paid'
        });
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