// Header Component - Tái sử dụng cho toàn bộ website
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { getAvatarUrl } from '../utils/avatarHelper';
import './Header.css';

const Header = ({ categories = [], onCategoryFilter, onSearch }) => {
    const { user, logout } = useAuth();
    const { getTotalItems } = useCart();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);

    const cartItemCount = getTotalItems();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim() && onSearch) {
            onSearch(searchQuery);
        }
    };

    return (
        <>
            {/* Main Header */}
            <header className="main-header">
                <div className="container">
                    <div className="header-content">
                        {/* Logo */}
                        <div className="logo-section">
                            <h1 className="store-logo" onClick={() => navigate('/')}>
                                🛍️ I6O STORE
                            </h1>
                            <p className="store-tagline">Fashion & Lifestyle</p>
                        </div>

                        {/* Search Bar */}
                        <div className="search-section">
                            <form onSubmit={handleSearch} className="search-form">
                                <input
                                    type="text"
                                    placeholder="Bạn đang tìm gì..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="search-input"
                                />
                                <button type="submit" className="search-btn">
                                    🔍
                                </button>
                            </form>
                        </div>

                        {/* User Actions */}
                        <div className="header-actions">
                            <button className="action-btn" onClick={() => navigate('/')}>
                                <span className="icon">🏪</span>
                                <span className="text">Cửa hàng</span>
                            </button>
                            <div className="user-menu-wrapper">
                                <button
                                    className="action-btn user-btn"
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                >
                                    <img
                                        src={getAvatarUrl(user?.avatar)}
                                        alt="Avatar"
                                        className="user-avatar-small"
                                    />
                                    <span className="text">{user?.fullName || user?.username}</span>
                                </button>
                                {showUserMenu && (
                                    <div className="user-dropdown">
                                        <button onClick={() => { navigate('/profile'); setShowUserMenu(false); }}>
                                            👤 Tài khoản
                                        </button>
                                        <button onClick={() => { navigate('/orders'); setShowUserMenu(false); }}>
                                            📦 Đơn hàng của tôi
                                        </button>
                                        <button onClick={() => { navigate('/payment-history'); setShowUserMenu(false); }}>
                                            💳 Lịch Sử Thanh Toán
                                        </button>
                                        <button onClick={handleLogout}>
                                            🚪 Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                            <button className="action-btn cart-btn" onClick={() => navigate('/cart')}>
                                <span className="icon">🛒</span>
                                <span className="text">Giỏ hàng</span>
                                {cartItemCount > 0 && (
                                    <span className="badge">{cartItemCount}</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation Menu */}
            <nav className="main-nav">
                <div className="container">
                    <ul className="nav-menu">
                        <li className="nav-item active">
                            <a href="#" onClick={(e) => { e.preventDefault(); onCategoryFilter?.('all'); }}>
                                🏠 TRANG CHỦ
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="#">🎁 HÀNG MỚI <span className="badge-new">NEW</span></a>
                        </li>
                        {categories.slice(0, 5).map((cat) => (
                            <li key={cat.id} className="nav-item">
                                <a href="#" onClick={(e) => { e.preventDefault(); onCategoryFilter?.(cat.id); }}>
                                    {cat.icon} {cat.title.toUpperCase()}
                                </a>
                            </li>
                        ))}
                        <li className="nav-item sale">
                            <a href="#">🔥 SALE <span className="badge-sale">-50%</span></a>
                        </li>
                        <li className="nav-item">
                            <a href="#">📰 TIN THỜI TRANG</a>
                        </li>
                    </ul>
                </div>
            </nav>
        </>
    );
};

export default Header;
