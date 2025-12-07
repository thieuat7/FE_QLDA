import AdminLayout from '../../components/AdminLayout';
import './AdminDashboardPage.css';

const AdminDashboardPage = () => {
    return (
        <AdminLayout>
            <div className="dashboard-page">
                <div className="dashboard-header">
                    <h1>📊 Dashboard</h1>
                    <p>Chào mừng đến với trang quản trị</p>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#4caf50' }}>
                            📦
                        </div>
                        <div className="stat-info">
                            <h3>Sản phẩm</h3>
                            <p className="stat-number">124</p>
                            <span className="stat-label">Tổng số sản phẩm</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#2196f3' }}>
                            🛒
                        </div>
                        <div className="stat-info">
                            <h3>Đơn hàng</h3>
                            <p className="stat-number">89</p>
                            <span className="stat-label">Đơn hàng mới</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#ff9800' }}>
                            👥
                        </div>
                        <div className="stat-info">
                            <h3>Khách hàng</h3>
                            <p className="stat-number">456</p>
                            <span className="stat-label">Tổng khách hàng</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#9c27b0' }}>
                            💰
                        </div>
                        <div className="stat-info">
                            <h3>Doanh thu</h3>
                            <p className="stat-number">125M</p>
                            <span className="stat-label">Tháng này</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                    <h2>Thao tác nhanh</h2>
                    <div className="actions-grid">
                        <a href="/admin/products" className="action-card">
                            <span className="action-icon">➕</span>
                            <span className="action-label">Thêm sản phẩm</span>
                        </a>
                        <a href="/admin/orders" className="action-card">
                            <span className="action-icon">📋</span>
                            <span className="action-label">Xem đơn hàng</span>
                        </a>
                        <a href="/admin/categories" className="action-card">
                            <span className="action-icon">📂</span>
                            <span className="action-label">Quản lý danh mục</span>
                        </a>
                        <a href="/admin/discounts" className="action-card">
                            <span className="action-icon">🎟️</span>
                            <span className="action-label">Tạo mã giảm giá</span>
                        </a>
                    </div>
                </div>

                {/* Info Section */}
                <div className="info-section">
                    <div className="info-card">
                        <h3>🚀 Bắt đầu</h3>
                        <p>Chào mừng bạn đến với trang quản trị. Bạn có thể quản lý toàn bộ website từ đây.</p>
                        <ul>
                            <li>✅ Quản lý sản phẩm và danh mục</li>
                            <li>✅ Theo dõi đơn hàng và thanh toán</li>
                            <li>✅ Quản lý khách hàng và mã giảm giá</li>
                            <li>✅ Xác nhận chuyển khoản ngân hàng</li>
                        </ul>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboardPage;
