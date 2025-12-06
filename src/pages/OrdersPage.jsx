import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../services/orderService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './OrdersPage.css';

const OrdersPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState(''); // all, processing, shipping, delivered, cancelled
    const limit = 10;

    const loadOrders = async () => {
        setLoading(true);
        try {
            console.log('Loading orders with params:', { page: currentPage, limit, status: statusFilter });

            // Gọi API với status filter nếu có
            const response = await orderService.getMyOrders(
                currentPage,
                limit,
                statusFilter,
                '' // paymentStatus - để trống
            );

            console.log('Orders response:', response);

            if (response.success) {
                let ordersData = response.data.orders || [];
                const pagination = response.data.pagination || {};

                // Map details -> items (backend dùng alias 'details')
                ordersData = ordersData.map(order => ({
                    ...order,
                    items: order.details || order.items || []
                }));

                setOrders(ordersData);
                setTotalPages(pagination.totalPages || 1);
            } else {
                throw new Error(response.message || 'Không thể tải đơn hàng');
            }
        } catch (error) {
            console.error('Load orders error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Không thể tải danh sách đơn hàng';
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, [currentPage, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

    const getStatusText = (status) => {
        const statusMap = {
            'pending': 'Đang xử lý',
            'processing': 'Đang xử lý',
            'confirmed': 'Đã xác nhận',
            'shipping': 'Đang giao',
            'delivered': 'Đã giao',
            'cancelled': 'Đã hủy',
            'completed': 'Hoàn thành'
        };
        return statusMap[status?.toLowerCase()] || status || 'Đang xử lý';
    };

    const getStatusClass = (status) => {
        const statusLower = status?.toLowerCase();
        if (['pending', 'processing'].includes(statusLower)) return 'status-processing';
        if (['confirmed'].includes(statusLower)) return 'status-confirmed';
        if (['shipping'].includes(statusLower)) return 'status-shipping';
        if (['delivered', 'completed'].includes(statusLower)) return 'status-delivered';
        if (['cancelled'].includes(statusLower)) return 'status-cancelled';
        return 'status-default';
    };

    const getPaymentStatusText = (status) => {
        const statusMap = {
            'pending': 'Chờ thanh toán',
            'paid': 'Đã thanh toán',
            'failed': 'Thanh toán thất bại',
            'refunded': 'Đã hoàn tiền'
        };
        return statusMap[status?.toLowerCase()] || status || 'Chờ thanh toán';
    };

    const getPaymentStatusClass = (status) => {
        const statusLower = status?.toLowerCase();
        if (statusLower === 'pending') return 'payment-pending';
        if (statusLower === 'paid') return 'payment-paid';
        if (statusLower === 'failed') return 'payment-failed';
        if (statusLower === 'refunded') return 'payment-refunded';
        return 'payment-default';
    };

    const getPaymentMethodText = (method) => {
        const methodMap = {
            '1': 'COD',
            '2': 'VNPAY',
            '3': 'MOMO',
            '4': 'Chuyển khoản',
            'cod': 'COD',
            'vnpay': 'VNPAY',
            'momo': 'MOMO',
            'bank': 'Chuyển khoản',
            'bank_transfer': 'Chuyển khoản'
        };
        return methodMap[method?.toString().toLowerCase()] || method || 'COD';
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleOrderClick = (orderId) => {
        navigate(`/orders/${orderId}`);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCategoryFilter = () => { };
    const handleSearch = () => { };

    if (loading && orders.length === 0) {
        return (
            <>
                <Header
                    categories={[]}
                    onCategoryFilter={handleCategoryFilter}
                    onSearch={handleSearch}
                />
                <div className="orders-page">
                    <div className="container">
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Đang tải đơn hàng...</p>
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
                categories={[]}
                onCategoryFilter={handleCategoryFilter}
                onSearch={handleSearch}
            />
            <div className="orders-page">
                <div className="container">
                    <div className="orders-header">
                        <h1>Đơn hàng của tôi</h1>
                        <p className="orders-subtitle">Quản lý đơn hàng và theo dõi trạng thái giao hàng</p>
                    </div>

                    {/* Filter */}
                    <div className="orders-filter">
                        <button
                            className={`filter-btn ${statusFilter === '' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('')}
                        >
                            Tất cả
                        </button>
                        <button
                            className={`filter-btn ${statusFilter === 'processing' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('processing')}
                        >
                            Đang xử lý
                        </button>
                        <button
                            className={`filter-btn ${statusFilter === 'shipping' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('shipping')}
                        >
                            Đang giao
                        </button>
                        <button
                            className={`filter-btn ${statusFilter === 'delivered' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('delivered')}
                        >
                            Đã giao
                        </button>
                        <button
                            className={`filter-btn ${statusFilter === 'cancelled' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('cancelled')}
                        >
                            Đã hủy
                        </button>
                    </div>

                    {/* Orders List */}
                    {orders.length === 0 ? (
                        <div className="empty-orders">
                            <div className="empty-icon">📦</div>
                            <h3>Chưa có đơn hàng nào</h3>
                            <p>Bạn chưa có đơn hàng nào. Hãy khám phá và mua sắm ngay!</p>
                            <button className="btn-shopping" onClick={() => navigate('/')}>
                                Tiếp tục mua sắm
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="orders-list">
                                {orders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="order-card"
                                        onClick={() => handleOrderClick(order.id)}
                                    >
                                        <div className="order-header">
                                            <div className="order-info">
                                                <h3 className="order-code">
                                                    Đơn hàng #{order.code || order.id}
                                                </h3>
                                                <span className="order-date">
                                                    {formatDate(order.createdAt)}
                                                </span>
                                            </div>
                                            <div className="order-status-badges">
                                                <span className={`status-badge ${getStatusClass(order.status)}`}>
                                                    {getStatusText(order.status)}
                                                </span>
                                                <span className={`payment-badge ${getPaymentStatusClass(order.paymentStatus)}`}>
                                                    {getPaymentStatusText(order.paymentStatus)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="order-body">
                                            <div className="order-details">
                                                <div className="detail-row">
                                                    <span className="detail-label">Phương thức thanh toán:</span>
                                                    <span className="detail-value">
                                                        {getPaymentMethodText(order.typePayment)}
                                                    </span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="detail-label">Tổng tiền:</span>
                                                    <span className="detail-value amount">
                                                        {formatPrice(order.totalAmount)}
                                                    </span>
                                                </div>
                                                {order.items && order.items.length > 0 && (
                                                    <div className="detail-row">
                                                        <span className="detail-label">Sản phẩm:</span>
                                                        <span className="detail-value">
                                                            {order.items.length} sản phẩm
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="order-footer">
                                            <button className="btn-view-detail">
                                                Xem chi tiết →
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="pagination">
                                    <button
                                        className="pagination-btn"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        ← Trước
                                    </button>

                                    <div className="pagination-numbers">
                                        {[...Array(totalPages)].map((_, index) => {
                                            const page = index + 1;
                                            // Hiển thị: 1, 2, 3 ... 8, 9, 10 hoặc 1 ... 5, 6, 7 ... 10
                                            if (
                                                page === 1 ||
                                                page === totalPages ||
                                                (page >= currentPage - 1 && page <= currentPage + 1)
                                            ) {
                                                return (
                                                    <button
                                                        key={page}
                                                        className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                                                        onClick={() => handlePageChange(page)}
                                                    >
                                                        {page}
                                                    </button>
                                                );
                                            } else if (
                                                page === currentPage - 2 ||
                                                page === currentPage + 2
                                            ) {
                                                return <span key={page} className="pagination-dots">...</span>;
                                            }
                                            return null;
                                        })}
                                    </div>

                                    <button
                                        className="pagination-btn"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        Sau →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default OrdersPage;
