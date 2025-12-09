import { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import AdminLayout from '../../components/AdminLayout';
import './AdminPaymentHistoryPage.css';

const AdminPaymentHistoryPage = () => {
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalOrders: 0, limit: 20 });
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [status, setStatus] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('DESC');
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line
    }, [pagination.currentPage, pagination.limit, status, paymentStatus, searchTerm, sortBy, sortOrder]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await apiService.getAdminPaymentHistory({
                page: pagination.currentPage,
                limit: pagination.limit,
                status,
                paymentStatus,
                searchTerm,
                sortBy,
                sortOrder
            });
            if (res.success) {
                setOrders(res.data.orders);
                setPagination(res.data.pagination);
            }
        } catch (err) {
            alert('Lỗi khi lấy lịch sử thanh toán');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (order) => {
        setSelectedOrder(order);
    };

    const handleConfirmPayment = async (orderId) => {
        if (!window.confirm('Xác nhận đơn này đã thanh toán?')) return;
        try {
            const res = await apiService.confirmOrderPayment(orderId);
            if (res.success) {
                alert('Đã xác nhận thanh toán!');
                fetchOrders();
            } else {
                alert(res.message || 'Lỗi xác nhận thanh toán');
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi xác nhận thanh toán');
        }
    };

    return (
        <AdminLayout>
            <div className="admin-page-container">
                <h2>Lịch Sử Thanh Toán</h2>
                <div className="filter-bar">
                    <input placeholder="Tìm kiếm..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    <select value={status} onChange={e => setStatus(e.target.value)}>
                        <option value="">Tất cả trạng thái đơn</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="processing">Đang xử lý</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="shipping">Đang giao hàng</option>
                        <option value="delivered">Đã giao hàng</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                    </select>
                    <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}>
                        <option value="">Tất cả trạng thái thanh toán</option>
                        <option value="pending">Chờ thanh toán</option>
                        <option value="paid">Đã thanh toán</option>
                        <option value="failed">Thất bại</option>
                        <option value="refunded">Hoàn tiền</option>
                    </select>
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                        <option value="createdAt">Ngày tạo</option>
                        <option value="totalAmount">Tổng tiền</option>
                        <option value="status">Trạng thái đơn</option>
                        <option value="paymentStatus">Trạng thái thanh toán</option>
                        <option value="code">Mã đơn</option>
                    </select>
                    <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                        <option value="DESC">Giảm dần</option>
                        <option value="ASC">Tăng dần</option>
                    </select>
                </div>
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Mã đơn</th>
                                <th>Khách hàng</th>
                                <th>Phương thức</th>
                                <th>Trạng thái đơn</th>
                                <th>Trạng thái thanh toán</th>
                                <th>Tổng tiền</th>
                                <th>Ngày tạo</th>
                                <th>Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8}>Đang tải...</td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan={8}>Không có dữ liệu</td></tr>
                            ) : orders.map(order => (
                                <tr key={order.id}>
                                    <td>{order.code}</td>
                                    <td>{order.customerName}</td>
                                    <td>{order.paymentMethod}</td>
                                    <td>{order.status}</td>
                                    <td>{order.paymentStatus}</td>
                                    <td>{order.finalAmount.toLocaleString()}₫</td>
                                    <td>{new Date(order.createdAt).toLocaleString()}</td>
                                    <td className="action-cell">
                                        <button className="btn-view" onClick={() => handleViewDetail(order)}>👁️ Xem</button>
                                        {order.paymentStatus === 'pending' && (
                                            <button className="btn-confirm" onClick={() => handleConfirmPayment(order.id)}>💸 Xác nhận</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="pagination-bar">
                    <button disabled={pagination.currentPage === 1} onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage - 1 }))}>Trước</button>
                    <span>Trang {pagination.currentPage} / {pagination.totalPages}</span>
                    <button disabled={pagination.currentPage === pagination.totalPages} onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage + 1 }))}>Sau</button>
                </div>
                {selectedOrder && (
                    <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <h3>Chi tiết đơn hàng</h3>
                            <p><b>Mã đơn:</b> {selectedOrder.code}</p>
                            <p><b>Khách hàng:</b> {selectedOrder.customerName}</p>
                            <p><b>Địa chỉ:</b> {selectedOrder.address}</p>
                            <p><b>Email:</b> {selectedOrder.email}</p>
                            <p><b>SĐT:</b> {selectedOrder.phone}</p>
                            <p><b>Phương thức:</b> {selectedOrder.paymentMethod}</p>
                            <p><b>Trạng thái đơn:</b> {selectedOrder.status}</p>
                            <p><b>Trạng thái thanh toán:</b> {selectedOrder.paymentStatus}</p>
                            <p><b>Tổng tiền:</b> {selectedOrder.finalAmount.toLocaleString()}₫</p>
                            <p><b>Ngày tạo:</b> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                            <h4>Sản phẩm</h4>
                            <ul>
                                {selectedOrder.items.map(item => (
                                    <li key={item.productId}>{item.productName} x {item.quantity} - {item.price.toLocaleString()}₫</li>
                                ))}
                            </ul>
                            <button onClick={() => setSelectedOrder(null)}>Đóng</button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminPaymentHistoryPage;
