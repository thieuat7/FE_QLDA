// VNPay Return Page - Trang callback sau khi thanh toán VNPAY
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './VNPayReturnPage.css';

const VNPayReturnPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('processing'); // processing, success, failed
    const [message, setMessage] = useState('');
    const [orderInfo, setOrderInfo] = useState(null);
    const [categories] = useState([]);

    useEffect(() => {
        // Lấy tất cả params từ URL
        const vnpResponseCode = searchParams.get('vnp_ResponseCode');
        const vnpTxnRef = searchParams.get('vnp_TxnRef');
        const vnpAmount = searchParams.get('vnp_Amount');
        const vnpBankCode = searchParams.get('vnp_BankCode');
        const vnpTransactionNo = searchParams.get('vnp_TransactionNo');
        const vnpPayDate = searchParams.get('vnp_PayDate');

        // Xử lý kết quả thanh toán
        if (vnpResponseCode === '00') {
            // Thành công
            setStatus('success');
            setMessage('Thanh toán thành công!');
            setOrderInfo({
                orderId: vnpTxnRef,
                amount: vnpAmount ? parseInt(vnpAmount) / 100 : 0, // VNPAY trả về amount * 100
                bankCode: vnpBankCode,
                transactionNo: vnpTransactionNo,
                payDate: vnpPayDate
            });

            // TODO: Gọi API để cập nhật trạng thái đơn hàng
            // updateOrderPaymentStatus(vnpTxnRef, 'paid');

            // Auto redirect sau 5 giây
            setTimeout(() => {
                navigate('/orders'); // TODO: Navigate to orders history page
            }, 5000);
        } else {
            // Thất bại
            setStatus('failed');

            // Map response code to message
            const errorMessages = {
                '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
                '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
                '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
                '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
                '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
                '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.',
                '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
                '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
                '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
                '75': 'Ngân hàng thanh toán đang bảo trì.',
                '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch',
                'default': 'Giao dịch thất bại. Vui lòng thử lại sau.'
            };

            setMessage(errorMessages[vnpResponseCode] || errorMessages['default']);
            setOrderInfo({
                orderId: vnpTxnRef,
                amount: vnpAmount ? parseInt(vnpAmount) / 100 : 0,
                bankCode: vnpBankCode
            });

            // Auto redirect sau 10 giây
            setTimeout(() => {
                navigate('/cart');
            }, 10000);
        }
    }, [searchParams, navigate]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        // Format: YYYYMMDDHHmmss -> DD/MM/YYYY HH:mm:ss
        const year = dateString.substring(0, 4);
        const month = dateString.substring(4, 6);
        const day = dateString.substring(6, 8);
        const hour = dateString.substring(8, 10);
        const minute = dateString.substring(10, 12);
        const second = dateString.substring(12, 14);
        return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
    };

    const handleCategoryFilter = () => { };
    const handleSearch = () => { };

    return (
        <>
            <Header
                categories={categories}
                onCategoryFilter={handleCategoryFilter}
                onSearch={handleSearch}
            />
            <div className="vnpay-return-page">
                <div className="container">
                    <div className="return-card">
                        {status === 'processing' && (
                            <div className="status-content processing">
                                <div className="spinner"></div>
                                <h2>Đang xử lý kết quả thanh toán...</h2>
                                <p>Vui lòng chờ trong giây lát</p>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="status-content success">
                                <div className="status-icon success-icon">✓</div>
                                <h2 className="status-title success-title">{message}</h2>
                                <p className="status-message">
                                    Cảm ơn bạn đã tin tưởng mua hàng tại I6O Store
                                </p>

                                {orderInfo && (
                                    <div className="order-details">
                                        <h3>Thông tin giao dịch</h3>
                                        <div className="detail-row">
                                            <span className="detail-label">Mã đơn hàng:</span>
                                            <span className="detail-value">#{orderInfo.orderId}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Số tiền:</span>
                                            <span className="detail-value amount">
                                                {formatPrice(orderInfo.amount)}
                                            </span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Ngân hàng:</span>
                                            <span className="detail-value">{orderInfo.bankCode}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Mã giao dịch VNPAY:</span>
                                            <span className="detail-value">{orderInfo.transactionNo}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Thời gian:</span>
                                            <span className="detail-value">
                                                {formatDateTime(orderInfo.payDate)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="action-buttons">
                                    <button
                                        className="btn-primary"
                                        onClick={() => navigate('/orders')}
                                    >
                                        Xem đơn hàng
                                    </button>
                                    <button
                                        className="btn-secondary"
                                        onClick={() => navigate('/')}
                                    >
                                        Tiếp tục mua sắm
                                    </button>
                                </div>

                                <p className="redirect-notice">
                                    Tự động chuyển đến trang đơn hàng sau 5 giây...
                                </p>
                            </div>
                        )}

                        {status === 'failed' && (
                            <div className="status-content failed">
                                <div className="status-icon failed-icon">✕</div>
                                <h2 className="status-title failed-title">Thanh toán thất bại</h2>
                                <p className="status-message error-message">{message}</p>

                                {orderInfo && (
                                    <div className="order-details">
                                        <h3>Thông tin giao dịch</h3>
                                        <div className="detail-row">
                                            <span className="detail-label">Mã đơn hàng:</span>
                                            <span className="detail-value">#{orderInfo.orderId}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Số tiền:</span>
                                            <span className="detail-value amount">
                                                {formatPrice(orderInfo.amount)}
                                            </span>
                                        </div>
                                        {orderInfo.bankCode && (
                                            <div className="detail-row">
                                                <span className="detail-label">Ngân hàng:</span>
                                                <span className="detail-value">{orderInfo.bankCode}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="action-buttons">
                                    <button
                                        className="btn-primary"
                                        onClick={() => navigate('/cart')}
                                    >
                                        Quay lại giỏ hàng
                                    </button>
                                    <button
                                        className="btn-secondary"
                                        onClick={() => navigate('/')}
                                    >
                                        Về trang chủ
                                    </button>
                                </div>

                                <p className="redirect-notice">
                                    Tự động quay lại giỏ hàng sau 10 giây...
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default VNPayReturnPage;
