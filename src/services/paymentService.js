// Payment Service - Xử lý thanh toán
import { apiClient } from './apiService';

const paymentService = {
    // VNPAY - Tạo URL thanh toán
    createVNPayUrl: async (orderId, amount, orderInfo = '', bankCode = '') => {
        try {
            const response = await apiClient.post('/payment/vnpay/create-url', {
                orderId,
                amount,
                orderInfo,
                bankCode
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // MOMO - Tạo URL thanh toán
    createMomoUrl: async (orderId, amount, orderInfo = '') => {
        try {
            const response = await apiClient.post('/payment/momo/create-url', {
                orderId,
                amount,
                orderInfo
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Bank Transfer - Lấy thông tin chuyển khoản
    getBankInfo: async (orderId) => {
        try {
            const response = await apiClient.get('/payment/bank-info', {
                params: { orderId }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Lấy lịch sử thanh toán
    getPaymentHistory: async (page = 1, limit = 10, paymentStatus = '') => {
        try {
            const response = await apiClient.get('/payment/history', {
                params: { page, limit, paymentStatus }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default paymentService;
