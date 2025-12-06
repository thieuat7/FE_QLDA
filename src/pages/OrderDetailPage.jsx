import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import orderService from '../services/orderService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './OrderDetailPage.css';

const OrderDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrderDetail = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await orderService.getOrderById(id);

            console.log('Order detail response:', response);
            console.log('Order data:', response.data);
            console.log('Order fields:', Object.keys(response.data?.order || response.data || {}));

            if (response.success) {
                // Backend có thể trả về response.data.order hoặc response.data
                const orderData = response.data.order || response.data;
                console.log('Final order data:', orderData);
                setOrder(orderData);
            } else {
                setError(response.message || 'Không thể tải thông tin đơn hàng');
            }
        } catch (err) {
            console.error('Error fetching order:', err);
            console.error('Error response:', err.response);
            console.error('Error data:', err.response?.data);

            let errorMessage = 'Lỗi kết nối server';

            if (err.response?.status === 404) {
                errorMessage = 'Không tìm thấy đơn hàng';
            } else if (err.response?.status === 403) {
                errorMessage = 'Bạn không có quyền xem đơn hàng này';
            } else if (err.response?.status === 500) {
                const backendError = err.response?.data?.error;
                if (backendError && backendError.includes('alias')) {
                    errorMessage = 'Lỗi cấu hình backend (Sequelize alias). Vui lòng liên hệ quản trị viên.';
                } else {
                    errorMessage = err.response?.data?.message || 'Lỗi server nội bộ';
                }
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetail();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const getStatusText = (status) => {
        const statusMap = {
            'pending': 'Chờ xác nhận',
            'processing': 'Đang xử lý',
            'confirmed': 'Đã xác nhận',
            'shipping': 'Đang giao hàng',
            'delivered': 'Đã giao hàng',
            'completed': 'Hoàn thành',
            'cancelled': 'Đã hủy'
        };
        return statusMap[status?.toLowerCase()] || status;
    };

    const getPaymentStatusText = (paymentStatus) => {
        const statusMap = {
            'pending': 'Chưa thanh toán',
            'paid': 'Đã thanh toán',
            'failed': 'Thanh toán thất bại',
            'refunded': 'Đã hoàn tiền'
        };
        return statusMap[paymentStatus?.toLowerCase()] || paymentStatus;
    };

    const getPaymentMethodText = (typePayment) => {
        // Convert to string for consistent comparison
        const typeStr = String(typePayment).toLowerCase();

        const methodMap = {
            '1': 'Thanh toán khi nhận hàng (COD)',
            '2': 'VNPAY',
            '3': 'MoMo',
            '4': 'Chuyển khoản ngân hàng',
            'cod': 'Thanh toán khi nhận hàng (COD)',
            'vnpay': 'VNPAY',
            'momo': 'MoMo',
            'bank': 'Chuyển khoản ngân hàng',
            'bank_transfer': 'Chuyển khoản ngân hàng'
        };
        return methodMap[typeStr] || 'Không xác định';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleCategoryFilter = () => { };
    const handleSearch = () => { };

    if (loading) {
        return (
            <>
                <Header
                    categories={[]}
                    onCategoryFilter={handleCategoryFilter}
                    onSearch={handleSearch}
                />
                <div className="order-detail-loading">
                    <div className="spinner"></div>
                    <p>Đang tải thông tin đơn hàng...</p>
                </div>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header
                    categories={[]}
                    onCategoryFilter={handleCategoryFilter}
                    onSearch={handleSearch}
                />
                <div className="order-detail-error">
                    <div className="error-icon">⚠️</div>
                    <h2>Không thể tải thông tin đơn hàng</h2>
                    <p>{error}</p>
                    <div className="error-actions">
                        <button onClick={() => navigate('/orders')} className="btn-back">
                            Quay lại danh sách đơn hàng
                        </button>
                        <button onClick={fetchOrderDetail} className="btn-retry">
                            Thử lại
                        </button>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (!order) {
        return (
            <>
                <Header
                    categories={[]}
                    onCategoryFilter={handleCategoryFilter}
                    onSearch={handleSearch}
                />
                <div className="order-detail-error">
                    <div className="error-icon">📦</div>
                    <h2>Không tìm thấy đơn hàng</h2>
                    <button onClick={() => navigate('/orders')} className="btn-back">
                        Quay lại danh sách đơn hàng
                    </button>
                </div>
                <Footer />
            </>
        );
    }

    const orderDetails = order.OrderDetails || order.details || order.items || [];

    return (
        <>
            <Header
                categories={[]}
                onCategoryFilter={handleCategoryFilter}
                onSearch={handleSearch}
            />
            <div className="order-detail-page">
                <div className="container">
                    {/* Header */}
                    <div className="order-detail-header">
                        <button onClick={() => navigate('/orders')} className="btn-back">
                            ← Quay lại
                        </button>
                        <h1>Chi tiết đơn hàng</h1>
                    </div>

                    {/* Order Info Card */}
                    <div className="order-info-card">
                        <div className="order-info-header">
                            <div>
                                <h2>Đơn hàng #{order.code || order.orderNumber || order.id}</h2>
                                <p className="order-date">Đặt ngày: {formatDate(order.createdAt)}</p>
                            </div>
                            <div className="order-badges">
                                <span className={`status-badge status-${order.status?.toLowerCase()}`}>
                                    {getStatusText(order.status)}
                                </span>
                                <span className={`payment-badge payment-${order.paymentStatus?.toLowerCase()}`}>
                                    {getPaymentStatusText(order.paymentStatus)}
                                </span>
                            </div>
                        </div>

                        {/* Customer Information */}
                        <div className="info-section">
                            <h3>📋 Thông tin khách hàng</h3>
                            <div className="info-grid">
                                <div className="info-item">
                                    <label>Họ tên:</label>
                                    <span>{order.customerName || 'Không có thông tin'}</span>
                                </div>
                                <div className="info-item">
                                    <label>Số điện thoại:</label>
                                    <span>{order.phone || 'Không có thông tin'}</span>
                                </div>
                                <div className="info-item full-width">
                                    <label>Email:</label>
                                    <span>{order.email || 'Không có thông tin'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="info-section">
                            <h3>🚚 Địa chỉ giao hàng</h3>
                            <div className="info-grid">
                                <div className="info-item full-width">
                                    <label>Địa chỉ:</label>
                                    <span>{order.address || 'Không có thông tin'}</span>
                                </div>
                                <div className="info-item">
                                    <label>Phường/Xã:</label>
                                    <span>{order.ward || 'Không có thông tin'}</span>
                                </div>
                                <div className="info-item">
                                    <label>Quận/Huyện:</label>
                                    <span>{order.district || 'Không có thông tin'}</span>
                                </div>
                                <div className="info-item">
                                    <label>Tỉnh/Thành phố:</label>
                                    <span>{order.city || 'Không có thông tin'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className="info-section">
                            <h3>💳 Thông tin thanh toán</h3>
                            <div className="info-grid">
                                <div className="info-item">
                                    <label>Phương thức:</label>
                                    <span>{getPaymentMethodText(order.typePayment)}</span>
                                </div>
                                <div className="info-item">
                                    <label>Trạng thái:</label>
                                    <span className={`payment-status-text status-${order.paymentStatus?.toLowerCase()}`}>
                                        {getPaymentStatusText(order.paymentStatus)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Note */}
                        {order.note && (
                            <div className="info-section">
                                <h3>📝 Ghi chú</h3>
                                <p className="order-note">{order.note}</p>
                            </div>
                        )}
                    </div>

                    {/* Order Items */}
                    <div className="order-items-card">
                        <h3>🛍️ Sản phẩm đã đặt ({orderDetails.length || 0})</h3>
                        <div className="order-items-list">
                            {orderDetails.map((item) => (
                                <div key={item.id} className="order-item">
                                    <div className="item-image">
                                        <img
                                            src={item.product?.image ? `http://localhost:3000${item.product.image}` : '/placeholder-product.png'}
                                            alt={item.product?.title || 'Sản phẩm'}
                                            onError={(e) => {
                                                e.target.src = '/placeholder-product.png';
                                            }}
                                        />
                                    </div>
                                    <div className="item-info">
                                        <h4>{item.product?.title || 'Sản phẩm'}</h4>
                                        {item.product?.productCode && (
                                            <p className="product-code">Mã SP: {item.product.productCode}</p>
                                        )}
                                        <p className="item-quantity">Số lượng: {item.quantity}</p>
                                    </div>
                                    <div className="item-price">
                                        <p className="price-per-item">{formatCurrency(item.price)}</p>
                                        <p className="total-price">{formatCurrency(item.price * item.quantity)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="order-summary-card">
                        <h3>💰 Tổng kết đơn hàng</h3>
                        {order.shippingFee && parseFloat(order.shippingFee) > 0 ? (
                            <>
                                <div className="summary-row">
                                    <span>Tạm tính:</span>
                                    <span>{formatCurrency(parseFloat(order.totalAmount || 0) - parseFloat(order.shippingFee))}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Phí vận chuyển:</span>
                                    <span>{formatCurrency(order.shippingFee)}</span>
                                </div>
                            </>
                        ) : null}
                        {order.discountValue && parseFloat(order.discountValue) > 0 && (
                            <div className="summary-row">
                                <span>Giảm giá:</span>
                                <span className="discount-amount">-{formatCurrency(order.discountValue)}</span>
                            </div>
                        )}
                        <div className="summary-row total">
                            <span>Tổng cộng:</span>
                            <span className="total-amount">{formatCurrency(order.totalAmount || 0)}</span>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default OrderDetailPage;
