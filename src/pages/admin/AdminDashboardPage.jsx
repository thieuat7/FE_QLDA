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
import './AdminDashboardPage.css';

// ✅ IMPORT SERVICE
import orderService from '../services/orderService';

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

// ✅ Xử lý đường dẫn ảnh
const API_BASE_URL = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '') 
    : 'http://localhost:3000';

const AdminDashboardPage = () => {
    const [loading, setLoading] = useState(false);
    
    // State dữ liệu
    const [overview, setOverview] = useState(null);
    const [revenueChart, setRevenueChart] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    
    // Filter
    const [chartPeriod, setChartPeriod] = useState(7); 

    useEffect(() => {
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chartPeriod]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const periodParam = chartPeriod === 7 ? 'week' : 'month'; 
            
            const [statsData, ordersData] = await Promise.all([
                orderService.getOrderStats(periodParam),        
                orderService.getAllOrders({ limit: 5, page: 1 }) 
            ]);

            // ✅ 1. Xử lý dữ liệu Overview
            if (statsData?.summary) {
                setOverview({
                    revenue: {
                        total: statsData.summary.totalRevenue,
                        today: 0, 
                        thisMonth: 0 
                    },
                    orders: {
                        total: statsData.summary.totalOrders,
                        paid: statsData.byStatus?.completed?.count || 0,
                        byStatus: {
                            processing: statsData.byStatus?.processing?.count || 0
                        }
                    },
                    users: {
                        total: 0, 
                    },
                    products: {
                        total: statsData.summary.totalProducts
                    }
                });
            }

            // ✅ 2. Xử lý Biểu đồ doanh thu
            if (statsData?.revenueByDay) {
                setRevenueChart({
                    chartData: statsData.revenueByDay.reverse(),
                    summary: {
                        totalRevenue: statsData.summary.totalRevenue,
                        totalOrders: statsData.summary.totalOrders,
                        averageRevenuePerDay: statsData.summary.averageOrderValue 
                    }
                });
            }

            // ✅ 3. Xử lý Top Products
            if (statsData?.topProducts) {
                const formattedTopProducts = statsData.topProducts.map((item, index) => ({
                    rank: index + 1,
                    product: {
                        id: item.productId,
                        title: item.productName,
                        productCode: 'SP00' + item.productId,
                        image: item.image || '' 
                    },
                    stats: {
                        totalSold: item.soldQuantity,
                        totalRevenue: item.revenue
                    }
                }));
                setTopProducts(formattedTopProducts);
            }

            // ✅ 4. Xử lý Recent Orders
            if (ordersData?.orders) { 
                setRecentOrders(ordersData.orders);
            } else if (Array.isArray(ordersData)) {
                setRecentOrders(ordersData);
            }

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
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // Config cho biểu đồ
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
            legend: { position: 'top' },
            title: { display: true, text: `Biểu đồ doanh thu ${chartPeriod} ngày gần đây` },
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
                                <span>Tổng quan kì này</span>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card orders">
                        <div className="stat-icon">📦</div>
                        <div className="stat-content">
                            <h3>Đơn Hàng</h3>
                            <p className="stat-value">{overview.orders.total}</p>
                            <div className="stat-details">
                                <span>Hoàn thành: {overview.orders.paid}</span>
                                <span>Đang xử lý: {overview.orders.byStatus.processing}</span>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card products">
                        <div className="stat-icon">🛍️</div>
                        <div className="stat-content">
                            <h3>Sản Phẩm Đã Bán</h3>
                            <p className="stat-value">{overview.products.total}</p>
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
                            <button className={chartPeriod === 7 ? 'active' : ''} onClick={() => setChartPeriod(7)}>
                                7 ngày
                            </button>
                            <button className={chartPeriod === 30 ? 'active' : ''} onClick={() => setChartPeriod(30)}>
                                30 ngày
                            </button>
                        </div>
                    </div>
                    <div className="chart-container">
                        <Line data={revenueChartConfig} options={chartOptions} />
                    </div>
                </div>
            )}

            <div className="dashboard-grid">
                {/* Top Products */}
                <div className="dashboard-section">
                    <h2>🏆 Top Sản Phẩm Bán Chạy</h2>
                    <div className="top-products-list">
                        {topProducts.length > 0 ? topProducts.map((item) => (
                            <div key={item.product.id} className="product-item">
                                <div className="product-rank">#{item.rank}</div>
                                <img
                                    src={item.product.image ? `${API_BASE_URL}${item.product.image}` : 'https://via.placeholder.com/60'}
                                    alt={item.product.title}
                                    className="product-image"
                                    onError={(e) => e.target.src = 'https://via.placeholder.com/60'}
                                />
                                <div className="product-info">
                                    <h4>{item.product.title}</h4>
                                    <div className="product-stats">
                                        <span>Đã bán: <strong>{item.stats.totalSold}</strong></span>
                                        <span>Danh thu: <strong>{formatCurrency(item.stats.totalRevenue)}</strong></span>
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
                                    <span className="order-code">#{order.id}</span>
                                    <span className={`order-status ${order.status}`}>{order.status}</span>
                                </div>
                                <div className="order-customer">
                                    <span>👤 {order.fullName || order.name || 'Khách lẻ'}</span>
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
    );
};

export default AdminDashboardPage;