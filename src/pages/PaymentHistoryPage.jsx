import { useState, useEffect } from 'react';
// ✅ Import đúng file ApiService chúng ta đã tạo
import apiService from '../services/apiService';
import AdminLayout from '../components/AdminLayout';
import './AdminPaymentHistoryPage.css';

const AdminPaymentHistoryPage = () => {
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalOrders: 0, limit: 20 });
    const [loading, setLoading] = useState(false);
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [status, setStatus] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('DESC');
    
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line
    }, [pagination.currentPage, pagination.limit, status, paymentStatus, sortBy, sortOrder]); // Bỏ searchTerm khỏi dependency để tránh call API liên tục khi gõ

    // Hàm search riêng để xử lý debounce (nếu cần) hoặc ấn Enter mới tìm
    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            fetchOrders();
        }
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            // ✅ Gọi qua ApiService
            const res = await apiService.getAdminPaymentHistory({
                page: pagination.currentPage,
                limit: pagination.limit,
                status,
                paymentStatus,
                searchTerm,
                sortBy,
                sortOrder
            });

            // Kiểm tra cấu trúc trả về của Backend (thường là res.data hoặc res trực tiếp tùy config)
            const data = res.data || res;
            
            if (data) {
                // Map dữ liệu nếu backend trả về cấu trúc khác
                setOrders(data.orders || []);
                setPagination(data.pagination || { currentPage: 1, totalPages: 1, totalOrders: 0 });
            }
        } catch (err) {
            console.error(err);
            // Không alert lỗi 404 nếu là do chưa có đơn hàng
            if (err?.status !== 404) {
                alert('Lỗi khi lấy lịch sử thanh toán: ' + (err.message || 'Unknown error'));
            } else {
                setOrders([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (order) => {
        setSelectedOrder(order);
    };

    const handleConfirmPayment = async (orderId) => {
        if (!window.confirm('Xác nhận đơn này đã nhận được tiền (Thanh toán thành công)?')) return;
        try {
            const res = await apiService.confirmOrderPayment(orderId);
            if (res && (res.success || res.message)) {
                alert('Đã xác nhận thanh toán thành công!');
                fetchOrders(); // Refresh lại list
                if (selectedOrder?.id === orderId) {
                    setSelectedOrder(null); // Đóng modal nếu đang mở đơn đó
                }
            }
        } catch (err) {
            console.error(err);
            alert(err.message || 'Lỗi xác nhận thanh toán');
        }
    };

    // Helper: Kiểm tra xem có phải chuyển khoản ngân hàng không
    const checkIsBankTransfer = (methodName) => {
        if (!methodName) return false;
        const method = methodName.toString().toLowerCase().replace(/\s|_/g, '');
        return ['banktransfer', 'bank_transfer', 'chuyenkhoan', 'bank'].some(k => method.includes(k));
    };

    // Helper: Format tiền tệ
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    };

    return (
        <AdminLayout>
            <div className="admin-page-container">
                <div className="page-header">
                    <h2>💰 Lịch Sử & Trạng Thái Thanh Toán</h2>
                </div>

                {/* Filter Bar */}
                <div className="filter-bar">
                    <div className="search-box">
                        <input 
                            placeholder="Tìm mã đơn, tên khách..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                        <button onClick={fetchOrders} className="btn-search">🔍</button>
                    </div>

                    <select value={status} onChange={e => { setStatus(e.target.value); setPagination(p => ({...p, currentPage: 1})); }}>
                        <option value="">-- Tất cả trạng thái đơn --</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="shipping">Đang giao</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                    </select>

                    <select value={paymentStatus} onChange={e => { setPaymentStatus(e.target.value); setPagination(p => ({...p, currentPage: 1})); }}>
                        <option value="">-- Tất cả trạng thái thanh toán --</option>
                        <option value="pending">Chưa thanh toán</option>
                        <option value="paid">Đã thanh toán</option>
                        <option value="failed">Thất bại</option>
                    </select>

                    <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                        <option value="DESC">Mới nhất trước</option>
                        <option value="ASC">Cũ nhất trước</option>
                    </select>
                </div>

                {/* Table */}
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Mã đơn</th>
                                <th>Khách hàng</th>
                                <th>Phương thức</th>
                                <th>Trạng thái đơn</th>
                                <th>Thanh toán</th>
                                <th>Tổng tiền</th>
                                <th>Ngày tạo</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} className="text-center">Đang tải dữ liệu...</td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan={8} className="text-center">Không tìm thấy đơn hàng nào</td></tr>
                            ) : (
                                orders.map(order => {
                                    const isBank = checkIsBankTransfer(order.paymentMethod); // Kiểm tra phương thức
                                    // Logic hiển thị nút Confirm: Chỉ hiện khi chưa thanh toán VÀ là chuyển khoản
                                    // (Các cổng online thường tự update, nhưng nếu muốn admin can thiệp thủ công thì bỏ check isBank)
                                    const showConfirmBtn = order.paymentStatus !== 'paid'; 

                                    return (
                                        <tr key={order.id}>
                                            <td><strong>{order.code || ('#' + order.id)}</strong></td>
                                            <td>
                                                <div>{order.customerName || order.fullName}</div>
                                                <small className="text-muted">{order.phone}</small>
                                            </td>
                                            <td>
                                                <span className={`badge method-${isBank ? 'bank' : 'other'}`}>
                                                    {order.paymentMethod || 'COD'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge status-${order.status}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`payment-badge payment-${order.paymentStatus}`}>
                                                    {order.paymentStatus === 'paid' ? 'Đã TT' : 'Chưa TT'}
                                                </span>
                                            </td>
                                            <td className="amount">{formatCurrency(order.totalAmount)}</td>
                                            <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                                            <td className="action-cell">
                                                <button className="btn-view" onClick={() => handleViewDetail(order)} title="Xem chi tiết">
                                                    👁️
                                                </button>
                                                {showConfirmBtn && (
                                                    <button 
                                                        className="btn-confirm-payment" 
                                                        onClick={() => handleConfirmPayment(order.id)}
                                                        title="Xác nhận đã nhận tiền"
                                                    >
                                                        ✅
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="pagination-bar">
                    <button 
                        disabled={pagination.currentPage <= 1} 
                        onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage - 1 }))}
                    >
                        &laquo; Trước
                    </button>
                    <span>Trang {pagination.currentPage} / {pagination.totalPages || 1}</span>
                    <button 
                        disabled={pagination.currentPage >= pagination.totalPages} 
                        onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage + 1 }))}
                    >
                        Sau &raquo;
                    </button>
                </div>

                {/* Modal Chi Tiết */}
                {selectedOrder && (
                    <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                        <div className="modal-content payment-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Chi tiết đơn hàng #{selectedOrder.code || selectedOrder.id}</h3>
                                <button className="close-btn" onClick={() => setSelectedOrder(null)}>×</button>
                            </div>
                            <div className="modal-body">
                                <div className="info-grid">
                                    <div className="info-group">
                                        <label>Khách hàng:</label>
                                        <p>{selectedOrder.customerName || selectedOrder.fullName}</p>
                                    </div>
                                    <div className="info-group">
                                        <label>Số điện thoại:</label>
                                        <p>{selectedOrder.phone}</p>
                                    </div>
                                    <div className="info-group full-width">
                                        <label>Địa chỉ:</label>
                                        <p>{selectedOrder.address}</p>
                                    </div>
                                    <div className="info-group">
                                        <label>Trạng thái đơn:</label>
                                        <span className={`status-text ${selectedOrder.status}`}>{selectedOrder.status}</span>
                                    </div>
                                    <div className="info-group">
                                        <label>Thanh toán:</label>
                                        <span className={`payment-text ${selectedOrder.paymentStatus}`}>
                                            {selectedOrder.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                        </span>
                                    </div>
                                </div>

                                <h4>Danh sách sản phẩm</h4>
                                <ul className="product-list-modal">
                                    {/* ✅ SỬA LOGIC: Backend trả về OrderDetails, không phải items */}
                                    {(selectedOrder.OrderDetails || selectedOrder.items || []).map((item, index) => (
                                        <li key={index} className="product-item-modal">
                                            <div className="prod-name">
                                                {/* Check kỹ field name: item.product?.title hoặc item.productName */}
                                                {item.product?.title || item.productName || 'Sản phẩm'}
                                            </div>
                                            <div className="prod-qty">x {item.quantity}</div>
                                            <div className="prod-price">{formatCurrency(item.price)}</div>
                                        </li>
                                    ))}
                                </ul>
                                
                                <div className="modal-footer-total">
                                    <strong>Tổng cộng:</strong>
                                    <span className="total-price">{formatCurrency(selectedOrder.totalAmount || selectedOrder.finalAmount)}</span>
                                </div>
                            </div>
                            <div className="modal-actions">
                                {selectedOrder.paymentStatus !== 'paid' && (
                                    <button className="btn-modal-confirm" onClick={() => handleConfirmPayment(selectedOrder.id)}>
                                        Xác nhận đã thu tiền
                                    </button>
                                )}
                                <button className="btn-modal-close" onClick={() => setSelectedOrder(null)}>Đóng</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminPaymentHistoryPage;