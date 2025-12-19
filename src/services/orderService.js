import { apiClient } from './apiService'; // Đảm bảo tên file trùng với file bạn vừa tạo (ApiService.js)

const orderService = {
    // ==========================================
    // USER METHODS (Dành cho khách hàng)
    // ==========================================

    // Tạo đơn hàng (Checkout)
    createOrder: async (orderData) => {
        try {
            const response = await apiClient.post('/orders/checkout', orderData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Lấy thông tin chi tiết đơn hàng theo ID
    getOrderById: async (orderId) => {
        try {
            const response = await apiClient.get(`/orders/${orderId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Lấy danh sách đơn hàng của tôi (Lịch sử mua hàng)
    getMyOrders: async (page = 1, limit = 10, status = '', paymentStatus = '') => {
        try {
            const params = { page, limit };
            if (status) params.status = status;
            if (paymentStatus) params.paymentStatus = paymentStatus;

            const response = await apiClient.get('/orders/my-orders', { params });
            return response.data;
        } catch (error) {
            console.error('API Error:', error);
            throw error.response?.data || error;
        }
    },

    // ==========================================
    // ADMIN METHODS (Dành cho trang quản trị)
    // ==========================================

    // Lấy tất cả đơn hàng (Quản lý đơn hàng)
    getAllOrders: async (params = {}) => {
        try {
            // Params có thể gồm: page, limit, status, search, startDate, endDate
            const response = await apiClient.get('/admin/orders', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Lấy thống kê đơn hàng (Dashboard) - Khớp với backend route /stats
    getOrderStats: async (period = 'month', startDate = null, endDate = null) => {
        try {
            const params = { period };
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const response = await apiClient.get('/admin/orders/stats', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Cập nhật trạng thái đơn hàng (VD: Pending -> Shipping)
    updateOrderStatus: async (orderId, status) => {
        try {
            const response = await apiClient.put(`/admin/orders/${orderId}/status`, { status });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Cập nhật trạng thái thanh toán (VD: Chưa thanh toán -> Đã thanh toán)
    updatePaymentStatus: async (orderId, isPaid) => {
        try {
            const response = await apiClient.put(`/admin/orders/${orderId}/payment-status`, { isPaid });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Xóa đơn hàng (Nếu cần)
    deleteOrder: async (orderId) => {
        try {
            const response = await apiClient.delete(`/admin/orders/${orderId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default orderService;