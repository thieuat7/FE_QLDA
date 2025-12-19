import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import './OrderManagementPage.css';

const OrderManagementPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [chosenStatus, setChosenStatus] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);

    // Filters
    const [filterStatus, setFilterStatus] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');

    // Stats
    const [stats, setStats] = useState({
        totalRevenue: 0,
        pendingCount: 0,
        confirmedCount: 0,
        shippingCount: 0,
        deliveredCount: 0,
        cancelledCount: 0
    });

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            let url = `https://be-qlda.onrender.com/api/admin/orders?page=${currentPage}&limit=20`;

            if (filterStatus) {
                url += `&status=${filterStatus}`;
            }
            if (searchKeyword) {
                url += `&search=${encodeURIComponent(searchKeyword)}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Check if token is invalid (401 Unauthorized)
            if (response.status === 401) {
                // Emit auth-expired so AuthContext handles logout/redirect centrally
                try {
                    window.dispatchEvent(new CustomEvent('auth-expired', { detail: { source: 'OrderManagementPage', status: 401 } }));
                } catch (e) {
                    // Fallback: if dispatch fails, only clear if not admin
                    const rawUser = localStorage.getItem('user');
                    const currentUser = rawUser ? JSON.parse(rawUser) : null;
                    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 1 || currentUser?.role === '1';
                    if (!isAdmin) {
                        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                    } else {
                        console.warn('auth-expired dispatch failed but current user is admin — suppressing auto-logout.');
                    }
                }
                return;
            }

            const result = await response.json();

            if (result.success) {
                setOrders(result.data.orders || []);
                setTotalPages(result.data.pagination?.totalPages || 1);
                setTotalOrders(result.data.pagination?.totalOrders || 0);

                if (result.data.summary) {
                    setStats(result.data.summary);
                }
            } else {
                console.error('API Error:', result.message);
                alert(result.message || 'Lỗi khi tải danh sách đơn hàng');
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            alert('Lỗi khi tải danh sách đơn hàng. Vui lòng kiểm tra kết nối.');
        } finally {
            setLoading(false);
        }
    }, [currentPage, filterStatus, searchKeyword]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // When opening status modal, initialize chosenStatus to current order status
    useEffect(() => {
        if (showStatusModal && selectedOrder) {
            setChosenStatus(selectedOrder.status || 'pending');
        }
    }, [showStatusModal, selectedOrder]);

    const handleViewDetail = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://be-qlda.onrender.com/api/admin/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (result.success) {
                setSelectedOrder(result.data.order);
                setShowDetailModal(true);
            }
        } catch (error) {
            console.error('Error fetching order detail:', error);
            alert('Lỗi khi tải chi tiết đơn hàng');
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        if (!selectedOrder) return;

        if (!window.confirm(`Xác nhận cập nhật trạng thái thành "${getStatusText(newStatus)}"?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://be-qlda.onrender.com/api/admin/orders/${selectedOrder.id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            const result = await response.json();

            if (result.success) {
                alert('Cập nhật trạng thái thành công');
                setShowStatusModal(false);
                setShowDetailModal(false);
                fetchOrders();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Lỗi khi cập nhật trạng thái');
        }
    };

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

    const getPaymentMethodText = (typePayment) => {
        const methodMap = {
            1: 'COD',
            2: 'VNPAY',
            3: 'MoMo',
            4: 'Bank Transfer'
        };
        return methodMap[typePayment] || 'N/A';
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

    return (
        <AdminLayout>
            <div className="order-management-page">
                {/* Stats Dashboard */}
                <div className="stats-dashboard">
                    <div className="stat-card">
                        <div className="stat-icon revenue">💰</div>
                        <div className="stat-info">
                            <h3>{formatCurrency(stats.totalRevenue)}</h3>
                            <p>Doanh thu</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon pending">⏳</div>
                        <div className="stat-info">
                            <h3>{stats.pendingCount}</h3>
                            <p>Chờ xác nhận</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon shipping">🚚</div>
                        <div className="stat-info">
                            <h3>{stats.shippingCount}</h3>
                            <p>Đang giao</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon delivered">✅</div>
                        <div className="stat-info">
                            <h3>{stats.deliveredCount}</h3>
                            <p>Đã giao</p>
                        </div>
                    </div>
                </div>

                {/* Page Header */}
                <div className="page-header">
                    <h1>Quản Lý Đơn Hàng</h1>
                    <div className="total-info">
                        Tổng: <strong>{totalOrders}</strong> đơn hàng
                    </div>
                </div>

                {/* Filters */}
                <div className="filters">
                    <select
                        value={filterStatus}
                        onChange={(e) => {
                            setFilterStatus(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="filter-select"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="pending">Chờ xác nhận</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="shipping">Đang giao hàng</option>
                        <option value="delivered">Đã giao hàng</option>
                        <option value="cancelled">Đã hủy</option>
                    </select>

                    <input
                        type="text"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                setCurrentPage(1);
                                fetchOrders();
                            }
                        }}
                        placeholder="Tìm theo mã đơn, tên, SĐT..."
                        className="search-input"
                    />

                    <button onClick={() => {
                        setCurrentPage(1);
                        fetchOrders();
                    }} className="btn-search">
                        🔍 Tìm kiếm
                    </button>
                </div>

                {/* Orders Table */}
                {loading ? (
                    <div className="loading">Đang tải...</div>
                ) : (
                    <>
                        <div className="orders-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Mã Đơn</th>
                                        <th>Khách Hàng</th>
                                        <th>SĐT</th>
                                        <th>Tổng Tiền</th>
                                        <th>Thanh Toán</th>
                                        <th>Trạng Thái</th>
                                        <th>Ngày Đặt</th>
                                        <th>Thao Tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.id}>
                                            <td className="code-cell">{order.code}</td>
                                            <td>{order.customerName}</td>
                                            <td>{order.phone}</td>
                                            <td className="price-cell">{formatCurrency(order.totalAmount)}</td>
                                            <td>
                                                <span className="payment-badge">
                                                    {getPaymentMethodText(order.typePayment)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge status-${order.status?.toLowerCase()}`}>
                                                    {getStatusText(order.status)}
                                                </span>
                                            </td>
                                            <td className="date-cell">{formatDate(order.createdAt)}</td>
                                            <td className="action-cell">
                                                <button
                                                    onClick={() => handleViewDetail(order.id)}
                                                    className="btn-view"
                                                >
                                                    👁️ Xem
                                                </button>
                                                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedOrder(order);
                                                            setShowStatusModal(true);
                                                        }}
                                                        className="btn-edit"
                                                    >
                                                        ✏️ Cập nhật
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {orders.length === 0 && (
                                <div className="empty-state">
                                    <p>Không có đơn hàng nào</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="btn-page"
                                >
                                    « Trước
                                </button>

                                <span className="page-info">
                                    Trang {currentPage} / {totalPages}
                                </span>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="btn-page"
                                >
                                    Sau »
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Detail Modal */}
                {showDetailModal && selectedOrder && (
                    <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                        <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Chi Tiết Đơn Hàng #{selectedOrder.code}</h2>
                                <button onClick={() => setShowDetailModal(false)} className="btn-close">
                                    ✕
                                </button>
                            </div>

                            <div className="modal-body">
                                {/* Customer Info */}
                                <div className="detail-section">
                                    <h3>👤 Thông Tin Khách Hàng</h3>
                                    <div className="info-grid">
                                        <div><strong>Họ tên:</strong> {selectedOrder.customerName}</div>
                                        <div><strong>SĐT:</strong> {selectedOrder.phone}</div>
                                        <div><strong>Email:</strong> {selectedOrder.email}</div>
                                        <div><strong>Địa chỉ:</strong> {selectedOrder.address}</div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="detail-section">
                                    <h3>📦 Sản Phẩm</h3>
                                    <div className="order-items">
                                        {selectedOrder.OrderDetails?.map((item) => (
                                            <div key={item.id} className="order-item">
                                                <img src={`https://be-qlda.onrender.com${item.product?.image}`} alt={item.product?.title} />
                                                <div className="item-info">
                                                    <h4>{item.product?.title}</h4>
                                                    <p>Mã: {item.product?.productCode}</p>
                                                </div>
                                                <div className="item-price">
                                                    <p>SL: {item.quantity}</p>
                                                    <p className="price">{formatCurrency(item.price)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div className="detail-section">
                                    <h3>💰 Tổng Kết</h3>
                                    <div className="summary">
                                        <div className="summary-row">
                                            <span>Tổng tiền:</span>
                                            <span className="total">{formatCurrency(selectedOrder.totalAmount)}</span>
                                        </div>
                                        <div className="summary-row">
                                            <span>Thanh toán:</span>
                                            <span>{getPaymentMethodText(selectedOrder.typePayment)}</span>
                                        </div>
                                        <div className="summary-row">
                                            <span>Trạng thái:</span>
                                            <span className={`status-badge status-${selectedOrder.status?.toLowerCase()}`}>
                                                {getStatusText(selectedOrder.status)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                                    <button
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            setShowStatusModal(true);
                                        }}
                                        className="btn-update-status"
                                    >
                                        Cập Nhật Trạng Thái
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Status Update Modal */}
                {showStatusModal && selectedOrder && (
                    <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Cập Nhật Trạng Thái</h2>
                                <button onClick={() => setShowStatusModal(false)} className="btn-close">
                                    ✕
                                </button>
                            </div>

                            <div className="modal-body">
                                <p>Đơn hàng: <strong>#{selectedOrder.code}</strong></p>
                                <p>Trạng thái hiện tại: <strong>{getStatusText(selectedOrder.status)}</strong></p>

                                <div className="status-options">
                                    <label htmlFor="status-select">Chọn trạng thái mới:</label>
                                    <select
                                        id="status-select"
                                        value={chosenStatus}
                                        onChange={(e) => setChosenStatus(e.target.value)}
                                    >
                                        <option value="pending">Chờ xác nhận</option>
                                        <option value="processing">Đang xử lý</option>
                                        <option value="confirmed">Đã xác nhận</option>
                                        <option value="shipping">Đang giao hàng</option>
                                        <option value="delivered">Đã giao hàng</option>
                                        <option value="cancelled">Đã hủy</option>
                                    </select>

                                    <div style={{ marginTop: '12px' }}>
                                        <button
                                            onClick={() => handleUpdateStatus(chosenStatus)}
                                            className="btn-status update"
                                            style={{ marginRight: '8px' }}
                                        >
                                            💾 Cập nhật
                                        </button>
                                        <button onClick={() => setShowStatusModal(false)} className="btn-status cancel">
                                            Hủy
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default OrderManagementPage;
