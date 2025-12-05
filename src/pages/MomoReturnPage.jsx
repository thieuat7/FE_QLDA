import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './VNPayReturnPage.css';

const MomoReturnPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const [status, setStatus] = useState('processing');
    const [message, setMessage] = useState('Đang xử lý thanh toán...');
    const [orderInfo, setOrderInfo] = useState({});

    useEffect(() => {
        // Lấy params từ URL callback của Momo
        const resultCode = searchParams.get('resultCode');
        const orderId = searchParams.get('orderId');
        const amount = searchParams.get('amount');
        const orderInfo = searchParams.get('orderInfo');
        const transId = searchParams.get('transId');
        const payType = searchParams.get('payType');
        const responseTime = searchParams.get('responseTime');

        // Kiểm tra kết quả thanh toán
        if (resultCode === '0') {
            setStatus('success');
            setMessage('Thanh toán MoMo thành công!');
            clearCart();
        } else {
            setStatus('failed');
            setMessage(getErrorMessage(resultCode));
        }

        // Lưu thông tin đơn hàng
        setOrderInfo({
            orderId,
            amount: amount ? parseInt(amount) : 0,
            orderInfo,
            transId,
            payType: getPayType(payType),
            responseTime: formatDateTime(responseTime)
        });
    }, [searchParams, clearCart]);

    const getErrorMessage = (code) => {
        const messages = {
            '9000': 'Giao dịch được khởi tạo, chờ thanh toán',
            '8000': 'Giao dịch đang được xử lý',
            '7000': 'Giao dịch đang chờ xử lý',
            '1000': 'Giao dịch đã được khởi tạo, chờ người dùng xác nhận',
            '11': 'Truy cập bị từ chối',
            '12': 'Phiên bản API không được hỗ trợ cho yêu cầu này',
            '13': 'Xác thực người dùng thất bại',
            '20': 'Số tiền không hợp lệ',
            '21': 'Số tiền giao dịch không hợp lệ',
            '40': 'RequestId bị trùng',
            '41': 'OrderId bị trùng',
            '42': 'OrderId không hợp lệ hoặc không được tìm thấy',
            '43': 'Yêu cầu bị từ chối vì xung đột trong quá trình xử lý giao dịch',
            '1001': 'Giao dịch thanh toán thất bại do tài khoản người dùng không đủ tiền',
            '1002': 'Giao dịch bị từ chối do nhà phát hành tài khoản thanh toán',
            '1003': 'Giao dịch bị hủy',
            '1004': 'Giao dịch thất bại do số tiền thanh toán vượt quá hạn mức',
            '1005': 'Giao dịch thất bại do url hoặc QR code đã hết hạn',
            '1006': 'Giao dịch thất bại do người dùng đã từ chối xác nhận thanh toán',
            '1007': 'Giao dịch bị từ chối vì tài khoản người dùng đang ở trạng thái tạm khóa',
            '2001': 'Giao dịch thất bại do sai thông tin liên kết',
            '2007': 'Giao dịch thất bại do tài khoản chưa được kích hoạt',
            '3001': 'Liên kết thanh toán không tồn tại hoặc đã hết hạn',
            '3002': 'Mã giao dịch (RequestId) không tồn tại',
            '3003': 'Mã đơn hàng (OrderId) không tồn tại',
            '4001': 'Lỗi không xác định',
            '4100': 'Giao dịch thất bại do người dùng không hoàn tất thanh toán'
        };
        return messages[code] || `Thanh toán thất bại (Mã lỗi: ${code})`;
    };

    const getPayType = (type) => {
        const types = {
            'webApp': 'MoMo App',
            'qr': 'Quét mã QR',
            'napas': 'Thẻ ATM nội địa',
            'credit': 'Thẻ quốc tế'
        };
        return types[type] || type || 'Ví MoMo';
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const formatDateTime = (dateTimeStr) => {
        if (!dateTimeStr) return '';
        // Format từ timestamp (milliseconds)
        const date = new Date(parseInt(dateTimeStr));
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <>
            <Header />
            <div className="payment-result-container">
                {status === 'processing' && (
                    <div className="payment-result">
                        <div className="spinner"></div>
                        <h2>Đang xử lý thanh toán...</h2>
                    </div>
                )}

                {status === 'success' && (
                    <div className="payment-result success">
                        <div className="success-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2>Thanh toán thành công!</h2>
                        <p className="message">{message}</p>

                        <div className="order-details">
                            <h3>Thông tin giao dịch</h3>
                            <div className="detail-row">
                                <span className="detail-label">Mã đơn hàng:</span>
                                <span className="detail-value">#{orderInfo.orderId}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Mã giao dịch MoMo:</span>
                                <span className="detail-value">{orderInfo.transId}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Số tiền:</span>
                                <span className="detail-value amount">{formatPrice(orderInfo.amount)}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Phương thức:</span>
                                <span className="detail-value">{orderInfo.payType}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Thời gian:</span>
                                <span className="detail-value">{orderInfo.responseTime}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Nội dung:</span>
                                <span className="detail-value">{orderInfo.orderInfo}</span>
                            </div>
                        </div>

                        <div className="actions">
                            <button className="btn-primary" onClick={() => navigate('/orders')}>
                                Xem đơn hàng của tôi
                            </button>
                            <button className="btn-secondary" onClick={() => navigate('/')}>
                                Tiếp tục mua sắm
                            </button>
                        </div>
                    </div>
                )}

                {status === 'failed' && (
                    <div className="payment-result failed">
                        <div className="failed-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2>Thanh toán thất bại</h2>
                        <p className="message">{message}</p>

                        <div className="order-details">
                            <h3>Thông tin giao dịch</h3>
                            <div className="detail-row">
                                <span className="detail-label">Mã đơn hàng:</span>
                                <span className="detail-value">#{orderInfo.orderId}</span>
                            </div>
                            {orderInfo.transId && (
                                <div className="detail-row">
                                    <span className="detail-label">Mã giao dịch:</span>
                                    <span className="detail-value">{orderInfo.transId}</span>
                                </div>
                            )}
                            <div className="detail-row">
                                <span className="detail-label">Số tiền:</span>
                                <span className="detail-value amount">{formatPrice(orderInfo.amount)}</span>
                            </div>
                        </div>

                        <div className="support-info">
                            <p>Nếu bạn cần hỗ trợ, vui lòng liên hệ:</p>
                            <p><strong>Hotline: 0287.100.8788</strong></p>
                        </div>

                        <div className="actions">
                            <button className="btn-primary" onClick={() => navigate('/cart')}>
                                Quay lại giỏ hàng
                            </button>
                            <button className="btn-secondary" onClick={() => navigate('/')}>
                                Về trang chủ
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default MomoReturnPage;
