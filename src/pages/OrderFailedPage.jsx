// Order Failed Page - Trang đặt hàng thất bại
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useState } from 'react';
import './OrderSuccessPage.css';

const OrderFailedPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [categories] = useState([]);

    const orderId = searchParams.get('orderId');
    const errorCode = searchParams.get('code');
    const message = searchParams.get('message');

    const getErrorMessage = (code) => {
        const errors = {
            '07': 'Giao dịch bị nghi ngờ gian lận (liên quan tới lừa đảo, giao dịch bất thường)',
            '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking tại ngân hàng',
            '10': 'Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
            '11': 'Đã hết hạn chờ thanh toán. Vui lòng thực hiện lại giao dịch',
            '12': 'Thẻ/Tài khoản bị khóa',
            '13': 'Sai mật khẩu xác thực giao dịch (OTP). Vui lòng thực hiện lại',
            '24': 'Khách hàng hủy giao dịch',
            '51': 'Tài khoản không đủ số dư để thực hiện giao dịch',
            '65': 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày',
            '75': 'Ngân hàng thanh toán đang bảo trì',
            '79': 'Nhập sai mật khẩu thanh toán quá số lần quy định'
        };
        return errors[code] || message || 'Giao dịch thất bại. Vui lòng thử lại sau.';
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
            <div className="order-failed-page">
                <div className="container">
                    <div className="failed-card">
                        <div className="failed-icon">✕</div>
                        <h1>Thanh toán thất bại!</h1>
                        {orderId && <p className="order-id">Mã đơn hàng: <strong>#{orderId}</strong></p>}

                        <div className="failed-message">
                            <p className="error-text">{getErrorMessage(errorCode)}</p>
                            <p>Vui lòng thử lại hoặc chọn phương thức thanh toán khác.</p>
                            <p>Nếu cần hỗ trợ, vui lòng liên hệ: <strong>0287.100.8788</strong></p>
                        </div>

                        <div className="actions">
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
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default OrderFailedPage;
