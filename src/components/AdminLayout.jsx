import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    MdDashboard,
    MdCategory,
    MdInventory,
    MdShoppingCart,
    MdLocalOffer,
    MdPeople,
    MdPayment,
    MdMenu,
    MdClose,
    MdLogout,
    MdStorefront
} from 'react-icons/md';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const menuItems = [
        {
            path: '/admin/dashboard',
            icon: <MdDashboard />,
            label: 'Dashboard',
            active: location.pathname === '/admin/dashboard'
        },
        {
            path: '/admin/categories',
            icon: <MdCategory />,
            label: 'Quản lý Danh Mục',
            active: location.pathname === '/admin/categories'
        },
        {
            path: '/admin/products',
            icon: <MdInventory />,
            label: 'Quản lý Sản Phẩm',
            active: location.pathname === '/admin/products'
        },
        {
            path: '/admin/orders',
            icon: <MdShoppingCart />,
            label: 'Quản lý Đơn Hàng',
            active: location.pathname === '/admin/orders'
        },
        {
            path: '/admin/discounts',
            icon: <MdLocalOffer />,
            label: 'Mã Giảm Giá',
            active: location.pathname === '/admin/discounts'
        },
        {
            path: '/admin/users',
            icon: <MdPeople />,
            label: 'Quản lý User',
            active: location.pathname === '/admin/users'
        },
        {
            path: '/admin/payments',
            icon: <MdPayment />,
            label: 'Xác Nhận Thanh Toán',
            active: location.pathname === '/admin/payments'
        }
    ];

    const handleLogout = () => {
        if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            logout();
            navigate('/login');
        }
    };

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        <span className="logo-icon"><MdStorefront size={28} /></span>
                        {sidebarOpen && <span className="logo-text">Admin Panel</span>}
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${item.active ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {sidebarOpen && <span className="nav-label">{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button
                        onClick={() => navigate('/')}
                        className="footer-btn"
                    >
                        <span className="nav-icon"><MdStorefront /></span>
                        {sidebarOpen && <span className="nav-label">Về Trang Chủ</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="admin-main">
                {/* Top Header */}
                <header className="admin-header">
                    <button
                        className="toggle-sidebar-btn"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
                    </button>

                    <div className="header-right">
                        <div className="user-info">
                            <span className="user-name">{user?.fullName || user?.username || 'Admin'}</span>
                            <span className="user-role">Administrator</span>
                        </div>
                        <button onClick={handleLogout} className="logout-btn">
                            <MdLogout /> Đăng xuất
                        </button>
                    </div>
                </header>

                {/* Content */}
                <main className="admin-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
