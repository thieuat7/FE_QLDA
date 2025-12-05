// Checkout Page - Trang thanh toán
import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { getImageUrl, handleImageError } from '../utils/imageHelper';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './CheckoutPage.css';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { cartItems, getTotalPrice, clearCart } = useCart();
    const [categories] = useState([]);

    // Form state
    const [formData, setFormData] = useState({
        customerName: '',
        phone: '',
        address: '',
        email: '',
        paymentMethod: 'COD',
        discountCode: ''
    });

    const [errors, setErrors] = useState({});
    const [discountAmount, setDiscountAmount] = useState(0);
    const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error khi user nhập
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.customerName.trim()) {
            newErrors.customerName = 'Vui lòng nhập họ tên';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Vui lòng nhập số điện thoại';
        } else if (!/^[0-9]{10,11}$/.test(formData.phone)) {
            newErrors.phone = 'Số điện thoại không hợp lệ (10-11 số)';
        }

        if (!formData.address.trim()) {
            newErrors.address = 'Vui lòng nhập địa chỉ giao hàng';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Vui lòng nhập email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleApplyDiscount = async () => {
        if (!formData.discountCode.trim()) {
            alert('Vui lòng nhập mã giảm giá');
            return;
        }

        setIsApplyingDiscount(true);
        try {
            // TODO: Call API để áp dụng mã giảm giá
            // const response = await fetch('/api/orders/apply-discount', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         discountCode: formData.discountCode,
            //         productIds: cartItems.map(item => item.id)
            //     })
            // });
            // const data = await response.json();
            // setDiscountAmount(data.discountAmount);

            // Demo: giảm giá 10%
            const discount = getTotalPrice() * 0.1;
            setDiscountAmount(discount);
            alert('Áp dụng mã giảm giá thành công!');
        } catch (error) {
            console.error('Apply discount error:', error);
            alert('Mã giảm giá không hợp lệ');
        } finally {
            setIsApplyingDiscount(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (cartItems.length === 0) {
            alert('Giỏ hàng trống!');
            navigate('/cart');
            return;
        }

        setIsSubmitting(true);
        try {
            // TODO: Call API để tạo đơn hàng
            const orderData = {
                customerName: formData.customerName,
                phone: formData.phone,
                address: formData.address,
                email: formData.email,
                paymentMethod: formData.paymentMethod,
                discountCode: formData.discountCode,
                items: cartItems,
                subtotal: getTotalPrice(),
                discount: discountAmount,
                total: getTotalPrice() - discountAmount
            };

            console.log('Order data:', orderData);

            // const response = await fetch('/api/orders/checkout', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${token}`
            //     },
            //     body: JSON.stringify(orderData)
            // });

            // const data = await response.json();

            // Demo: Thành công
            alert('Đặt hàng thành công! Mã đơn hàng: #ORD' + Date.now());
            clearCart();
            navigate('/');
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Đặt hàng thất bại. Vui lòng thử lại!');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCategoryFilter = () => { };
    const handleSearch = () => { };

    const subtotal = getTotalPrice();
    const total = subtotal - discountAmount;

    if (cartItems.length === 0) {
        return (
            <>
                <Header
                    categories={categories}
                    onCategoryFilter={handleCategoryFilter}
                    onSearch={handleSearch}
                />
                <div className="checkout-page">
                    <div className="container">
                        <div className="empty-checkout">
                            <span className="empty-icon">🛒</span>
                            <h2>Giỏ hàng trống</h2>
                            <p>Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán</p>
                            <button className="btn-continue" onClick={() => navigate('/')}>
                                Tiếp tục mua sắm
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header
                categories={categories}
                onCategoryFilter={handleCategoryFilter}
                onSearch={handleSearch}
            />
            <div className="checkout-page">
                <div className="container">
                    <h1 className="page-title">Thanh toán</h1>

                    <div className="checkout-layout">
                        {/* Form thông tin */}
                        <div className="checkout-form-section">
                            <form onSubmit={handleSubmit} className="checkout-form">
                                <div className="form-section">
                                    <h2 className="section-title">Thông tin giao hàng</h2>

                                    <div className="form-group">
                                        <label htmlFor="customerName">
                                            Họ và tên <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="customerName"
                                            name="customerName"
                                            value={formData.customerName}
                                            onChange={handleInputChange}
                                            className={errors.customerName ? 'error' : ''}
                                            placeholder="Nguyễn Văn A"
                                        />
                                        {errors.customerName && (
                                            <span className="error-message">{errors.customerName}</span>
                                        )}
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="phone">
                                                Số điện thoại <span className="required">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className={errors.phone ? 'error' : ''}
                                                placeholder="0912345678"
                                            />
                                            {errors.phone && (
                                                <span className="error-message">{errors.phone}</span>
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="email">
                                                Email <span className="required">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className={errors.email ? 'error' : ''}
                                                placeholder="example@email.com"
                                            />
                                            {errors.email && (
                                                <span className="error-message">{errors.email}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="address">
                                            Địa chỉ giao hàng <span className="required">*</span>
                                        </label>
                                        <textarea
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            className={errors.address ? 'error' : ''}
                                            placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                                            rows="3"
                                        />
                                        {errors.address && (
                                            <span className="error-message">{errors.address}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="form-section">
                                    <h2 className="section-title">Phương thức thanh toán</h2>

                                    <div className="payment-methods">
                                        <label className="payment-option">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="COD"
                                                checked={formData.paymentMethod === 'COD'}
                                                onChange={handleInputChange}
                                            />
                                            <div className="payment-info">
                                                <span className="payment-icon">💵</span>
                                                <div>
                                                    <strong>COD</strong>
                                                    <p>Thanh toán khi nhận hàng</p>
                                                </div>
                                            </div>
                                        </label>

                                        <label className="payment-option">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="VNPAY"
                                                checked={formData.paymentMethod === 'VNPAY'}
                                                onChange={handleInputChange}
                                            />
                                            <div className="payment-info">
                                                <span className="payment-icon">💳</span>
                                                <div>
                                                    <strong>VNPAY</strong>
                                                    <p>Cổng thanh toán VNPAY</p>
                                                </div>
                                            </div>
                                        </label>

                                        <label className="payment-option">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="MOMO"
                                                checked={formData.paymentMethod === 'MOMO'}
                                                onChange={handleInputChange}
                                            />
                                            <div className="payment-info">
                                                <span className="payment-icon">📱</span>
                                                <div>
                                                    <strong>Momo</strong>
                                                    <p>Ví điện tử Momo</p>
                                                </div>
                                            </div>
                                        </label>

                                        <label className="payment-option">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="BANK_TRANSFER"
                                                checked={formData.paymentMethod === 'BANK_TRANSFER'}
                                                onChange={handleInputChange}
                                            />
                                            <div className="payment-info">
                                                <span className="payment-icon">🏦</span>
                                                <div>
                                                    <strong>Bank Transfer</strong>
                                                    <p>Chuyển khoản ngân hàng</p>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn-submit-order"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
                                </button>
                            </form>
                        </div>

                        {/* Tóm tắt đơn hàng */}
                        <div className="order-summary-section">
                            <div className="order-summary">
                                <h2 className="section-title">Đơn hàng của bạn</h2>

                                <div className="summary-items">
                                    {cartItems.map((item) => (
                                        <div key={item.cartId} className="summary-item">
                                            <img
                                                src={getImageUrl(item.image)}
                                                alt={item.title}
                                                onError={handleImageError}
                                                className="summary-item-image"
                                            />
                                            <div className="summary-item-info">
                                                <h4>{item.title}</h4>
                                                <p className="item-meta">
                                                    {item.size} / {item.color} × {item.quantity}
                                                </p>
                                                <p className="item-price">
                                                    {formatPrice(item.price * item.quantity)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="discount-section">
                                    <h3>Mã giảm giá</h3>
                                    <div className="discount-input-group">
                                        <input
                                            type="text"
                                            name="discountCode"
                                            value={formData.discountCode}
                                            onChange={handleInputChange}
                                            placeholder="Nhập mã giảm giá"
                                            className="discount-input"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleApplyDiscount}
                                            disabled={isApplyingDiscount}
                                            className="btn-apply-discount"
                                        >
                                            {isApplyingDiscount ? '...' : 'Áp dụng'}
                                        </button>
                                    </div>
                                </div>

                                <div className="summary-totals">
                                    <div className="total-row">
                                        <span>Tạm tính:</span>
                                        <span>{formatPrice(subtotal)}</span>
                                    </div>
                                    {discountAmount > 0 && (
                                        <div className="total-row discount">
                                            <span>Giảm giá:</span>
                                            <span>-{formatPrice(discountAmount)}</span>
                                        </div>
                                    )}
                                    <div className="total-row shipping">
                                        <span>Phí vận chuyển:</span>
                                        <span className="free">Miễn phí</span>
                                    </div>
                                    <div className="divider"></div>
                                    <div className="total-row final">
                                        <span>Tổng cộng:</span>
                                        <span className="total-amount">{formatPrice(total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default CheckoutPage;
