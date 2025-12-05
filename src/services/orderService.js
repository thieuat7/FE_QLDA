// Order Service - Xử lý đơn hàng
import { apiClient } from './apiService';

const orderService = {
    // Tạo đơn hàng
    createOrder: async (orderData) => {
        try {
            const response = await apiClient.post('/orders/checkout', orderData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Lấy thông tin đơn hàng theo ID
    getOrderById: async (orderId) => {
        try {
            const response = await apiClient.get(`/orders/${orderId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Lấy danh sách đơn hàng của user
    getMyOrders: async (page = 1, limit = 10) => {
        try {
            const response = await apiClient.get('/orders', {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default orderService;
