// Cart Page - Trang giỏ hàng
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { getImageUrl, handleImageError } from '../utils/imageHelper';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './CartPage.css';

const CartPage = () => {
    const navigate = useNavigate();
    const {
        cartItems,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice
    } = useCart();

    const [showConfirmClear, setShowConfirmClear] = useState(false);
    const [categories, setCategories] = useState([]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const handleQuantityChange = (cartId, currentQty, change) => {
        const newQty = currentQty + change;
        if (newQty >= 1) {
            updateQuantity(cartId, newQty);
        }
    };

    const handleRemoveItem = (cartId) => {
        if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
            removeFromCart(cartId);
        }
    };

    const handleClearCart = () => {
        clearCart();
        setShowConfirmClear(false);
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            alert('Giỏ hàng trống!');
            return;
        }
        navigate('/checkout');
    };

    const handleCategoryFilter = (categoryId) => {
        navigate(`/?category=${categoryId}`);
    };

    const handleSearch = (query) => {
        navigate(`/?search=${query}`);
    };

    if (cartItems.length === 0) {
        return (
            <div className="cart-page">
                <Header
                    categories={categories}
                    onCategoryFilter={handleCategoryFilter}
                    onSearch={handleSearch}
                />
                <div className="cart-empty">
                    <div className="empty-icon">🛒</div>
                    <h2>Giỏ hàng trống</h2>
                    <p>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
                    <button
                        className="btn-continue-shopping"
                        onClick={() => navigate('/')}
                    >
                        ← Tiếp tục mua sắm
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="cart-page">
            <Header
                categories={categories}
                onCategoryFilter={handleCategoryFilter}
                onSearch={handleSearch}
            />

            <div className="cart-container-wrapper">
                <div className="cart-header">
                    <h1>🛒 Giỏ hàng của bạn</h1>
                    <span className="cart-count">
                        {cartItems.length} sản phẩm
                    </span>
                </div>

                <div className="cart-container">
                    {/* Cart Items */}
                    <div className="cart-items">
                        {cartItems.map((item) => (
                            <div key={item.cartId} className="cart-item">
                                <img
                                    src={getImageUrl(item.image)}
                                    alt={item.title}
                                    className="item-image"
                                    onClick={() => navigate(`/product/${item.id}`)}
                                    onError={handleImageError}
                                />

                                <div className="item-info">
                                    <h3
                                        className="item-title"
                                        onClick={() => navigate(`/product/${item.id}`)}
                                    >
                                        {item.title}
                                    </h3>
                                    <p className="item-meta">
                                        Mã: {item.productCode || 'N/A'}
                                    </p>
                                    <div className="item-options">
                                        {item.size && <span>Size: {item.size}</span>}
                                        {item.color && <span>Màu: {item.color}</span>}
                                    </div>
                                </div>

                                <div className="item-price">
                                    <span className="price">{formatPrice(item.price)}</span>
                                </div>

                                <div className="item-quantity">
                                    <button
                                        className="qty-btn"
                                        onClick={() => handleQuantityChange(item.cartId, item.quantity, -1)}
                                        disabled={item.quantity <= 1}
                                    >
                                        -
                                    </button>
                                    <span className="qty-display">{item.quantity}</span>
                                    <button
                                        className="qty-btn"
                                        onClick={() => handleQuantityChange(item.cartId, item.quantity, 1)}
                                    >
                                        +
                                    </button>
                                </div>

                                <div className="item-total">
                                    <span className="total-price">
                                        {formatPrice(item.price * item.quantity)}
                                    </span>
                                </div>

                                <button
                                    className="btn-remove"
                                    onClick={() => handleRemoveItem(item.cartId)}
                                    title="Xóa sản phẩm"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}

                        <button
                            className="btn-clear-cart"
                            onClick={() => setShowConfirmClear(true)}
                        >
                            Xóa toàn bộ giỏ hàng
                        </button>
                    </div>

                    {/* Cart Summary */}
                    <div className="cart-summary">
                        <h2>Thông tin đơn hàng</h2>

                        <div className="summary-row">
                            <span>Tạm tính:</span>
                            <span>{formatPrice(getTotalPrice())}</span>
                        </div>

                        <div className="summary-row">
                            <span>Phí vận chuyển:</span>
                            <span className="free-ship">Miễn phí</span>
                        </div>

                        <div className="summary-divider"></div>

                        <div className="summary-row total">
                            <span>Tổng cộng:</span>
                            <span className="total-price">
                                {formatPrice(getTotalPrice())}
                            </span>
                        </div>

                        <button
                            className="btn-checkout"
                            onClick={handleCheckout}
                        >
                            Tiến hành thanh toán
                        </button>

                        <button
                            className="btn-continue"
                            onClick={() => navigate('/')}
                        >
                            ← Tiếp tục mua sắm
                        </button>

                        <div className="payment-methods">
                            <p>Phương thức thanh toán:</p>
                            <div className="methods">
                                <span>💳 COD</span>
                                <span>💳 Chuyển khoản</span>
                                <span>💳 Ví điện tử</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />

            {/* Confirm Clear Dialog */}
            {showConfirmClear && (
                <div className="modal-overlay" onClick={() => setShowConfirmClear(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Xác nhận</h3>
                        <p>Bạn có chắc muốn xóa toàn bộ giỏ hàng?</p>
                        <div className="modal-actions">
                            <button
                                className="btn-cancel"
                                onClick={() => setShowConfirmClear(false)}
                            >
                                Hủy
                            </button>
                            <button
                                className="btn-confirm"
                                onClick={handleClearCart}
                            >
                                Xóa toàn bộ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
