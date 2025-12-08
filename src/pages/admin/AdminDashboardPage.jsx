import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import AdminLayout from '../../components/AdminLayout';
import './AdminDashboardPage.css';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const AdminDashboardPage = () => {
    const [loading, setLoading] = useState(false);
    const [overview, setOverview] = useState(null);
    const [revenueChart, setRevenueChart] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [chartPeriod, setChartPeriod] = useState(7);

    useEffect(() => {
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chartPeriod]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [overviewRes, revenueRes, topProductsRes, recentOrdersRes] = await Promise.all([
                fetch('http://localhost:3000/api/stats/overview', { headers }),
                fetch(`http://localhost:3000/api/stats/revenue-chart?days=${chartPeriod}`, { headers }),
                fetch('http://localhost:3000/api/stats/top-products?limit=5', { headers }),
                fetch('http://localhost:3000/api/stats/recent-orders?limit=5', { headers })
            ]);

            const overviewData = await overviewRes.json();
            const revenueData = await revenueRes.json();
            const topProductsData = await topProductsRes.json();
            const recentOrdersData = await recentOrdersRes.json();

            if (overviewData.success) setOverview(overviewData.data);
            if (revenueData.success) setRevenueChart(revenueData.data);
            if (topProductsData.success) setTopProducts(topProductsData.data.topProducts);
            if (recentOrdersData.success) setRecentOrders(recentOrdersData.data.recentOrders);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const revenueChartConfig = revenueChart ? {
        labels: revenueChart.chartData.map(d => {
            const date = new Date(d.date);
            return `${date.getDate()}/${date.getMonth() + 1}`;
        }),
        datasets: [
            {
                label: 'Doanh thu (VNĐ)',
                data: revenueChart.chartData.map(d => d.revenue),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.4,
                fill: true
            }
        ]
    } : null;

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: `Biểu đồ doanh thu ${chartPeriod} ngày gần đây`
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return formatCurrency(context.parsed.y);
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        return (value / 1000000).toFixed(1) + 'M';
                    }
                }
            }
        }
    };

    return (
        <AdminLayout>
            <div className="dashboard-page">
                <div className="dashboard-header">
                    <div>
                        <h1>📊 Dashboard Admin</h1>
                        <p>Tổng quan hoạt động kinh doanh</p>
                    </div>
                    <button onClick={fetchDashboardData} className="btn-refresh" disabled={loading}>
                        🔄 {loading ? 'Đang tải...' : 'Refresh'}
                    </button>
                </div>

                {/* Stats Cards */}
                {overview && (
                    <div className="stats-grid">
                        <div className="stat-card revenue">
                            <div className="stat-icon">💰</div>
                            <div className="stat-content">
                                <h3>Tổng Doanh Thu</h3>
                                <p className="stat-value">{formatCurrency(overview.revenue.total)}</p>
                                <div className="stat-details">
                                    <span>Hôm nay: {formatCurrency(overview.revenue.today)}</span>
                                    <span>Tháng này: {formatCurrency(overview.revenue.thisMonth)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="stat-card orders">
                            <div className="stat-icon">📦</div>
                            <div className="stat-content">
                                <h3>Đơn Hàng</h3>
                                <p className="stat-value">{overview.orders.total}</p>
                                <div className="stat-details">
                                    <span>Đã thanh toán: {overview.orders.paid}</span>
                                    <span>Chờ xử lý: {overview.orders.byStatus.processing || 0}</span>
                                </div>
                            </div>
                        </div>

                        <div className="stat-card users">
                            <div className="stat-icon">👥</div>
                            <div className="stat-content">
                                <h3>Khách Hàng</h3>
                                <p className="stat-value">{overview.users.total}</p>
                                <div className="stat-details">
                                    <span>Đã đăng ký</span>
                                </div>
                            </div>
                        </div>

                        <div className="stat-card products">
                            <div className="stat-icon">🛍️</div>
                            <div className="stat-content">
                                <h3>Sản Phẩm</h3>
                                <p className="stat-value">{overview.products.total}</p>
                                <div className="stat-details">
                                    <span>Đang kinh doanh</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Revenue Chart */}
                {revenueChart && revenueChartConfig && (
                    <div className="chart-section">
                        <div className="chart-header">
                            <h2>📈 Biểu Đồ Doanh Thu</h2>
                            <div className="chart-filters">
                                <button
                                    className={chartPeriod === 7 ? 'active' : ''}
                                    onClick={() => setChartPeriod(7)}
                                >
                                    7 ngày
                                </button>
                                <button
                                    className={chartPeriod === 30 ? 'active' : ''}
                                    onClick={() => setChartPeriod(30)}
                                >
                                    30 ngày
                                </button>
                            </div>
                        </div>
                        <div className="chart-container">
                            <Line data={revenueChartConfig} options={chartOptions} />
                        </div>
                        <div className="chart-summary">
                            <div className="summary-item">
                                <span>Tổng doanh thu:</span>
                                <strong>{formatCurrency(revenueChart.summary.totalRevenue)}</strong>
                            </div>
                            <div className="summary-item">
                                <span>Tổng đơn hàng:</span>
                                <strong>{revenueChart.summary.totalOrders}</strong>
                            </div>
                            <div className="summary-item">
                                <span>Trung bình/ngày:</span>
                                <strong>{formatCurrency(revenueChart.summary.averageRevenuePerDay)}</strong>
                            </div>
                        </div>
                    </div>
                )}

                {/* Two Column Layout */}
                <div className="dashboard-grid">
                    {/* Top Products */}
                    <div className="dashboard-section">
                        <h2>🏆 Top Sản Phẩm Bán Chạy</h2>
                        <div className="top-products-list">
                            {topProducts.length > 0 ? topProducts.map((item) => (
                                <div key={item.product.id} className="product-item">
                                    <div className="product-rank">#{item.rank}</div>
                                    <img
                                        src={`http://localhost:3000${item.product.image}`}
                                        alt={item.product.title}
                                        className="product-image"
                                        onError={(e) => e.target.src = 'https://via.placeholder.com/60'}
                                    />
                                    <div className="product-info">
                                        <h4>{item.product.title}</h4>
                                        <p className="product-code">{item.product.productCode}</p>
                                        <div className="product-stats">
                                            <span>Đã bán: <strong>{item.stats.totalSold}</strong></span>
                                            <span>Doanh thu: <strong>{formatCurrency(item.stats.totalRevenue)}</strong></span>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <p className="no-data">Chưa có dữ liệu</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="dashboard-section">
                        <h2>🛒 Đơn Hàng Gần Đây</h2>
                        <div className="recent-orders-list">
                            {recentOrders.length > 0 ? recentOrders.map((order) => (
                                <div key={order.id} className="order-item">
                                    <div className="order-header">
                                        <span className="order-code">{order.code}</span>
                                        <span className={`order-status ${order.status}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="order-customer">
                                        <span>👤 {order.customerName}</span>
                                        <span>📞 {order.phone}</span>
                                    </div>
                                    <div className="order-footer">
                                        <span className="order-amount">{formatCurrency(order.totalAmount)}</span>
                                        <span className="order-time">{formatDate(order.createdAt)}</span>
                                    </div>
                                </div>
                            )) : (
                                <p className="no-data">Chưa có đơn hàng</p>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
};

export default AdminDashboardPage;
