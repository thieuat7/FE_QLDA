// Chuyển đổi phương thức thanh toán
const getPaymentMethodText = (paymentMethod) => {
    const map = {
        1: 'COD',
        2: 'VNPAY',
        3: 'MoMo',
        4: 'Bank Transfer',
        'cod': 'COD',
        'vnpay': 'VNPAY',
        'momo': 'MoMo',
        'bank': 'Bank Transfer',
        'banktransfer': 'Bank Transfer',
        'bank_transfer': 'Bank Transfer'
    };
    if (paymentMethod === null || paymentMethod === undefined || paymentMethod === '') return 'Không xác định';
    const key = typeof paymentMethod === 'string' ? paymentMethod.toLowerCase().replace(/\s|_/g, '') : paymentMethod;
    return map[key] || 'Không xác định';
};
import { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import Header from '../components/Header.jsx';
import FloatingProfileNotice from '../components/FloatingProfileNotice.jsx';
import './PaymentHistoryPage.css';

const PaymentHistoryPage = () => {
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalOrders: 0, limit: 10 });
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentStatus, setPaymentStatus] = useState(''); // Chỉ giữ lại paymentStatus
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, [pagination.currentPage, pagination.limit, paymentStatus, searchTerm]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await apiService.getUserPaymentHistory({
                page: pagination.currentPage,
                limit: pagination.limit,
                paymentStatus, // Chỉ gửi trạng thái thanh toán lên API
                searchTerm
            });
            if (res.success) {
                setOrders(res.data.orders);
                setPagination(res.data.pagination);
            }
        } catch (err) {
            console.error('Lỗi fetch:', err);
        } finally {
            setLoading(false);
        }
    };

    const getPaymentStatusClass = (status) => {
        const statusMap = {
            'paid': 'status-badge status-paid',
            'pending': 'status-badge status-pending',
            'failed': 'status-badge status-failed',
            'refunded': 'status-badge status-refunded'
        };
        return statusMap[status] || 'status-badge';
    };

    const translatePaymentStatus = (status) => {
        const map = {
            'paid': 'Đã thanh toán',
            'pending': 'Chờ thanh toán',
            'failed': 'Thất bại',
            'refunded': 'Hoàn tiền'
        };
        return map[status] || status;
    };

    return (
        <>
            <Header />
            <div className="user-page-container">
                <h2>Lịch Sử Thanh Toán</h2>

                <div className="filter-bar">
                    <input
                        placeholder="Tìm theo mã đơn hoặc nội dung..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}>
                        <option value="">Tất cả trạng thái thanh toán</option>
                        <option value="pending">Chờ thanh toán</option>
                        <option value="paid">Đã thanh toán</option>
                        <option value="failed">Thất bại</option>
                        <option value="refunded">Hoàn tiền</option>
                    </select>
                </div>

                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Mã đơn</th>
                                <th>Phương thức</th>
                                <th>Trạng thái thanh toán</th>
                                <th>Tổng tiền</th>
                                <th>Ngày giao dịch</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center' }}>Đang tải...</td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center' }}>Không có lịch sử giao dịch</td></tr>
                            ) : orders
                                .filter(order => order.paymentStatus === 'paid')
                                .map(order => (
                                    <tr key={order.id}>
                                        <td><strong>{order.code}</strong></td>
                                        <td>{getPaymentMethodText(order.paymentMethod)}</td>
                                        <td>
                                            <span className={getPaymentStatusClass(order.paymentStatus)}>
                                                {translatePaymentStatus(order.paymentStatus)}
                                            </span>
                                        </td>
                                        <td className="amount-cell">{order.finalAmount.toLocaleString()}₫</td>
                                        <td>{new Date(order.createdAt).toLocaleString()}</td>
                                        <td>
                                            <button className="btn-view" onClick={() => setSelectedOrder(order)}>Chi tiết</button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                {/* Phân trang giữ nguyên như cũ */}
                <div className="pagination-bar">
                    <button
                        disabled={pagination.currentPage === 1 || pagination.totalOrders === 0}
                        onClick={() => setPagination(p => ({ ...p, currentPage: Math.max(1, p.currentPage - 1) }))}
                    >Trước</button>
                    <span>Trang {pagination.currentPage} / {Math.max(1, pagination.totalPages)}</span>
                    <button
                        disabled={pagination.currentPage >= pagination.totalPages || pagination.totalOrders === 0}
                        onClick={() => setPagination(p => ({ ...p, currentPage: Math.min(p.totalPages, p.currentPage + 1) }))}
                    >Sau</button>
                </div>

                {/* Modal chi tiết - cũng nên bỏ trạng thái đơn ở đây */}
                {selectedOrder && (
                    <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <h3>Chi tiết giao dịch #{selectedOrder.code}</h3>
                            <p><b>Phương thức:</b> {getPaymentMethodText(selectedOrder.paymentMethod)}</p>
                            <p>
                                <b>Tình trạng:</b>
                                <span className={getPaymentStatusClass(selectedOrder.paymentStatus)}>
                                    {translatePaymentStatus(selectedOrder.paymentStatus)}
                                </span>
                            </p>
                            <hr />
                            <h4>Sản phẩm</h4>
                            <ul className="product-list">
                                {selectedOrder.items.map(item => (
                                    <li key={item.productId} className="product-item">
                                        <span>{item.productName} x{item.quantity}</span>
                                        <span>{(item.price * item.quantity).toLocaleString()}₫</span>
                                    </li>
                                ))}
                            </ul>
                            <div style={{ textAlign: 'right', marginTop: '15px' }}>
                                <p style={{ fontSize: '1.2rem' }}><b>Tổng cộng: {selectedOrder.finalAmount.toLocaleString()}₫</b></p>
                                <button className="btn-close" onClick={() => setSelectedOrder(null)}>Đóng</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default PaymentHistoryPage;