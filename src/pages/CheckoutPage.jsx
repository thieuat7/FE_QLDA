// Checkout Page - Trang thanh toán
import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { getImageUrl, handleImageError } from '../utils/imageHelper';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';
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

    const [selectedBank, setSelectedBank] = useState(''); // Ngân hàng cho VNPAY
    const [errors, setErrors] = useState({});
    const [discountAmount, setDiscountAmount] = useState(0);
    const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [discountError, setDiscountError] = useState('');
    const [availableDiscounts, setAvailableDiscounts] = useState([]);

    // Load available discounts
    useEffect(() => {
        loadAvailableDiscounts();
    }, []);

    const loadAvailableDiscounts = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/discounts/public');
            const result = await response.json();

            if (result.success) {
                const now = new Date();
                const validDiscounts = result.data.discounts.filter(discount => {
                    const startDate = new Date(discount.startDate);
                    const endDate = new Date(discount.endDate);
                    const isTimeValid = startDate <= now && now <= endDate;
                    const hasUsageLeft = !discount.usageLimit || discount.usedCount < discount.usageLimit;
                    return discount.isActive && isTimeValid && hasUsageLeft;
                });
                setAvailableDiscounts(validDiscounts);
            }
        } catch (err) {
            console.error('Load discounts error:', err);
        }
    };

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

    const handleSelectDiscount = (code) => {
        setFormData(prev => ({ ...prev, discountCode: code }));
        setDiscountError('');
    };

    const handleApplyDiscount = async () => {
        if (!formData.discountCode.trim()) {
            setDiscountError('Vui lòng nhập mã giảm giá');
            return;
        }

        setIsApplyingDiscount(true);
        setDiscountError('');

        try {
            const orderTotal = getTotalPrice();

            const response = await fetch('http://localhost:3000/api/discounts/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code: formData.discountCode,
                    orderAmount: orderTotal
                })
            });

            const result = await response.json();

            if (!result.success) {
                setDiscountError(result.message || 'Mã giảm giá không hợp lệ');
                return;
            }

            const discount = result.data.discount;
            const calculatedDiscount = parseFloat(discount.discountAmount);

            setDiscountAmount(calculatedDiscount);
            setAppliedDiscount(discount);
            alert(`Áp dụng mã giảm giá thành công! Giảm ${formatPrice(calculatedDiscount)}`);
        } catch (error) {
            console.error('Apply discount error:', error);
            setDiscountError('Có lỗi xảy ra khi áp dụng mã giảm giá');
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
            // Check giỏ hàng trước
            if (cartItems.length === 0) {
                alert('Giỏ hàng trống! Vui lòng thêm sản phẩm.');
                return;
            }

            // Map payment method to typePayment number
            const getTypePayment = (method) => {
                const types = {
                    'COD': 1,
                    'VNPAY': 2,
                    'MOMO': 3,
                    'BANK_TRANSFER': 4
                };
                return types[method] || 1;
            };

            // Map cart items sang format backend mong đợi
            const orderItems = cartItems.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                price: parseFloat(item.price),
                size: item.size || '',
                color: item.color || ''
            }));

            const orderData = {
                customerName: formData.customerName,
                phone: formData.phone,
                address: formData.address,
                email: formData.email,
                note: '',
                items: orderItems,
                totalAmount: getTotalPrice() - discountAmount,
                typePayment: getTypePayment(formData.paymentMethod),
                // Nếu thanh toán qua cổng (VNPAY/MOMO), gửi flag để backend chỉ reserve/pend
                // Backend nên không trừ tồn kho ngay khi nhận flag này.
                reserveOnly: formData.paymentMethod === 'VNPAY' || formData.paymentMethod === 'MOMO'
            };

            console.log('=== DEBUG CHECKOUT ===');
            console.log('Cart items count:', cartItems.length);
            console.log('Order data:', JSON.stringify(orderData, null, 2));

            // Bước 1: Tạo đơn hàng qua orderService
            const orderResponse = await orderService.createOrder(orderData);

            console.log('=== ORDER RESPONSE ===');
            console.log('Response:', JSON.stringify(orderResponse, null, 2));

            if (!orderResponse.success) {
                console.error('Order creation failed:', orderResponse);
                throw new Error(orderResponse.message || 'Tạo đơn hàng thất bại');
            }

            const orderId = orderResponse.data.order.id;
            console.log('Order ID:', orderId);

            // Bước 2: Xử lý thanh toán theo phương thức
            if (formData.paymentMethod === 'VNPAY') {
                // Gọi API tạo URL thanh toán VNPAY Sandbox
                const paymentResponse = await paymentService.createVNPayUrl(
                    orderId.toString(),
                    orderData.totalAmount,
                    `Thanh toan don hang ${orderId}`,
                    selectedBank // Ngân hàng đã chọn (VNPAYQR, NCB, BIDV, ...)
                );

                if (!paymentResponse.success) {
                    throw new Error(paymentResponse.message || 'Tạo URL VNPAY thất bại');
                }

                console.log('Payment URL:', paymentResponse.data.paymentUrl);

                // Redirect đến VNPAY Sandbox — không xóa giỏ hàng tại client.
                // Backend nên giữ trạng thái đơn 'pending' và chỉ trừ tồn kho khi nhận webhook xác nhận.
                window.location.href = paymentResponse.data.paymentUrl;
                return;
            }

            if (formData.paymentMethod === 'MOMO') {
                // Gọi API tạo URL thanh toán MoMo
                const paymentResponse = await paymentService.createMomoUrl(
                    orderId.toString(),
                    orderData.totalAmount,
                    `Thanh toan don hang ${orderId}`
                );

                if (!paymentResponse.success) {
                    throw new Error(paymentResponse.message || 'Tạo URL MoMo thất bại');
                }

                console.log('MoMo Payment URL:', paymentResponse.data.paymentUrl);

                // Redirect đến MoMo — không xóa giỏ hàng tại client.
                window.location.href = paymentResponse.data.paymentUrl;
                return;
            }

            if (formData.paymentMethod === 'BANK_TRANSFER') {
                // Chuyển đến trang hướng dẫn chuyển khoản
                navigate(`/bank-transfer?orderId=${orderId}&amount=${orderData.totalAmount}&orderCode=${orderId}`);
                return;
            }

            // Phương thức COD - Thanh toán khi nhận hàng
            alert('Đặt hàng thành công! Mã đơn hàng: #' + orderId);
            clearCart();
            navigate('/order-success', {
                state: {
                    orderId: orderId,
                    paymentMethod: 'COD'
                }
            });
        } catch (error) {
            console.error('=== CHECKOUT ERROR ===');
            console.error('Error object:', error);
            console.error('Error message:', error.message);
            console.error('Error response:', error.response);
            console.error('Error data:', error.response?.data);

            // Hiển thị lỗi chi tiết
            const errorMessage = error.response?.data?.message
                || error.message
                || 'Đặt hàng thất bại. Vui lòng thử lại!';

            alert(`Lỗi: ${errorMessage}`);
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
                                                    <p>Cổng thanh toán VNPAY (ATM, Visa, MasterCard)</p>
                                                </div>
                                            </div>
                                        </label>

                                        {/* Chọn ngân hàng cho VNPAY */}
                                        {formData.paymentMethod === 'VNPAY' && (
                                            <div className="bank-selection">
                                                <label htmlFor="bank-select">Chọn ngân hàng (không bắt buộc)</label>
                                                <select
                                                    id="bank-select"
                                                    value={selectedBank}
                                                    onChange={(e) => setSelectedBank(e.target.value)}
                                                >
                                                    <option value="">Tất cả ngân hàng</option>
                                                    <option value="VNPAYQR">VNPAY QR</option>
                                                    <option value="VNBANK">Ngân hàng nội địa</option>
                                                    <option value="INTCARD">Thẻ quốc tế</option>
                                                    <option value="NCB">NCB</option>
                                                    <option value="BIDV">BIDV</option>
                                                    <option value="VIETCOMBANK">Vietcombank</option>
                                                    <option value="VIETINBANK">VietinBank</option>
                                                    <option value="TECHCOMBANK">Techcombank</option>
                                                    <option value="MBBANK">MB Bank</option>
                                                    <option value="SACOMBANK">Sacombank</option>
                                                    <option value="AGRIBANK">Agribank</option>
                                                    <option value="ACB">ACB</option>
                                                    <option value="SCB">SCB</option>
                                                    <option value="VPB">VPBank</option>
                                                </select>
                                            </div>
                                        )}

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
                                    <h3>🎫 ƯU ĐÁI - ONLY ONLINE</h3>

                                    {/* Hiển thị các mã giảm giá có sẵn */}
                                    {availableDiscounts.length > 0 && (
                                        <div className="available-discounts">
                                            {availableDiscounts.map(discount => {
                                                const orderTotal = getTotalPrice();
                                                const isApplicable = !discount.minOrderAmount || orderTotal >= discount.minOrderAmount;
                                                const isSelected = formData.discountCode === discount.code;

                                                return (
                                                    <div
                                                        key={discount.id}
                                                        className={`discount-card ${!isApplicable ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
                                                        onClick={() => isApplicable && handleSelectDiscount(discount.code)}
                                                    >
                                                        <div className="discount-card-header">
                                                            <div className="discount-badge-icon">💸</div>
                                                            <div className="discount-card-code">{discount.code}</div>
                                                        </div>
                                                        <div className="discount-card-body">
                                                            <div className="discount-card-desc">
                                                                {discount.type === 'percent'
                                                                    ? `Giảm ${discount.value}% đơn từ ${formatPrice(discount.minOrderAmount || 0)}`
                                                                    : `Giảm ${formatPrice(discount.value)} đơn từ ${formatPrice(discount.minOrderAmount || 0)}`
                                                                }
                                                            </div>
                                                            <div className="discount-card-expire">
                                                                HSD: {new Date(discount.endDate).toLocaleDateString('vi-VN')}
                                                            </div>
                                                        </div>
                                                        {!isApplicable && (
                                                            <div className="discount-card-overlay">
                                                                Không đủ điều kiện
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <div className="discount-input-group">
                                        <input
                                            type="text"
                                            name="discountCode"
                                            value={formData.discountCode}
                                            onChange={(e) => {
                                                handleInputChange(e);
                                                setDiscountError('');
                                            }}
                                            placeholder="Nhập mã giảm giá"
                                            className="discount-input"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleApplyDiscount}
                                            disabled={isApplyingDiscount}
                                            className="btn-apply-discount"
                                        >
                                            {isApplyingDiscount ? '...' : 'Áp dụng Voucher'}
                                        </button>
                                    </div>
                                    {discountError && (
                                        <p className="discount-error">{discountError}</p>
                                    )}
                                    {appliedDiscount && discountAmount > 0 && (
                                        <div className="discount-applied">
                                            <span className="success-icon">✓</span>
                                            <span>
                                                Mã <strong>{appliedDiscount.code}</strong> đã được áp dứng
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="summary-totals">
                                    <div className="total-row">
                                        <span>Tạm tính:</span>
                                        <span>{formatPrice(subtotal)}</span>
                                    </div>
                                    {discountAmount > 0 && (
                                        <div className="total-row discount">
                                            <span>
                                                Giảm giá:
                                                {appliedDiscount && (
                                                    <span style={{ color: '#6c63ff', fontWeight: 600, marginLeft: 6 }}>
                                                        (Mã: <strong>{appliedDiscount.code}</strong>)
                                                    </span>
                                                )}
                                            </span>
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
