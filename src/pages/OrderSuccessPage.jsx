// Order Success Page - Trang đặt hàng thành công
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './OrderSuccessPage.css';

const OrderSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const [categories] = useState([]);

    const orderId = searchParams.get('orderId');
    const method = searchParams.get('method');

    useEffect(() => {
        // Clear cart
        clearCart();
    }, [clearCart]);

    const handleCategoryFilter = () => { };
    const handleSearch = () => { };

    const getPaymentMethodName = (method) => {
        const methods = {
            'vnpay': 'VNPAY',
            'momo': 'Ví MoMo',
            'bank': 'Chuyển khoản ngân hàng',
            'cod': 'Thanh toán khi nhận hàng'
        };
        return methods[method] || 'Chưa xác định';
    };

    return (
        <>
            <Header
                categories={categories}
                onCategoryFilter={handleCategoryFilter}
                onSearch={handleSearch}
            />
            <div className="order-success-page">
                <div className="container">
                    <div className="success-card">
                        <div className="success-icon">✓</div>
                        <h1>Đặt hàng thành công!</h1>
                        <p className="order-id">Mã đơn hàng: <strong>#{orderId}</strong></p>

                        <div className="success-message">
                            <p>Cảm ơn bạn đã tin tưởng mua hàng tại I6O Store!</p>
                            <p>Chúng tôi đã gửi email xác nhận đến địa chỉ của bạn.</p>
                            {method && (
                                <p className="payment-info">
                                    Phương thức thanh toán: <strong>{getPaymentMethodName(method)}</strong>
                                </p>
                            )}
                        </div>

                        <div className="order-steps">
                            <div className="step active">
                                <div className="step-icon">1</div>
                                <p>Đơn hàng đã được tạo</p>
                            </div>
                            <div className="step-line"></div>
                            <div className="step">
                                <div className="step-icon">2</div>
                                <p>Đang xử lý</p>
                            </div>
                            <div className="step-line"></div>
                            <div className="step">
                                <div className="step-icon">3</div>
                                <p>Đang giao hàng</p>
                            </div>
                            <div className="step-line"></div>
                            <div className="step">
                                <div className="step-icon">4</div>
                                <p>Hoàn thành</p>
                            </div>
                        </div>

                        <div className="actions">
                            <button
                                className="btn-primary"
                                onClick={() => navigate('/orders')}
                            >
                                Xem đơn hàng của tôi
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={() => navigate('/')}
                            >
                                Tiếp tục mua sắm
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default OrderSuccessPage;
