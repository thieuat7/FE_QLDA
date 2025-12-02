// Service để gọi API
import axios from 'axios';

const API_URL = '/api'; // Proxy qua Vite

class ApiService {
    // Lấy danh sách người dùng
    async getUsers() {
        const response = await axios.get(`${API_URL}/users`);
        return response.data;
    }

    // Thêm người dùng mới
    async addUser(userData) {
        const response = await axios.post(`${API_URL}/user`, userData);
        return response.data;
    }

    // Kiểm tra health
    async checkHealth() {
        const response = await axios.get(`${API_URL}/health`);
        return response.data;
    }
}

export default new ApiService();
