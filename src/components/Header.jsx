// Header.jsx
import { useState, useEffect, useRef } from 'react';
import apiService from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAvatarUrl } from '../utils/avatarHelper';
import './Header.css';

const Header = ({ onCategoryFilter, onSearch }) => {
    // --- GIỮ NGUYÊN TOÀN BỘ LOGIC CŨ ---
    const { user, logout } = useAuth();
    const { getTotalItems } = useCart();
    const navigate = useNavigate();
    const location = useLocation(); // Thêm location để xử lý active menu nếu cần

    const [searchQuery, setSearchQuery] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [categories, setCategories] = useState([]);

    // Logic Slider (nếu bạn vẫn muốn giữ logic này dù không hiển thị ở đây)
    const [currentSlide, setCurrentSlide] = useState(0);
    const sliderRef = useRef(null);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await apiService.getCategories();
                if (response.success) {
                    setCategories(response.data.categories);
                }
            } catch (error) {
                console.error('Load categories error:', error);
            }
        };
        loadCategories();
    }, []);

    const cartItemCount = getTotalItems();

    // Kiểm tra quyền admin (backend có thể trả về 'admin' hoặc 1)
    const isAdmin = user?.role === 'admin' || user?.role === 1 || user?.role === '1';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // CODE MỚI (SỬA LẠI)
    const handleSearch = (e) => {
        e.preventDefault();

        const q = searchQuery.trim();
        // If parent provided a handler (homepage), use it.
        if (typeof onSearch === 'function') {
            onSearch(q);
            return;
        }

        // Otherwise navigate to tin-tuc with query param so TinTucPage can handle it.
        if (q) {
            navigate(`/tin-tuc?q=${encodeURIComponent(q)}`);
        } else {
            navigate('/tin-tuc');
        }
    };

    // Truyền thêm loại filter đặc biệt (hot/sale)
    const handleCategoryFilter = (categoryId, type) => {
        if (type === 'hot') {
            onCategoryFilter?.('hot');
        } else if (type === 'sale') {
            onCategoryFilter?.('sale');
        } else {
            onCategoryFilter?.(categoryId);
        }
        // Nếu đang ở trang con, quay về trang chủ
        if (location.pathname !== '/') navigate('/');
    };

    // --- PHẦN GIAO DIỆN ĐÃ ĐƯỢC CẤU TRÚC LẠI ---
    // Hàm xử lý khi nhấn vào logo: reset filter về mặc định
    const handleLogoClick = () => {
        setSearchQuery('');
        onCategoryFilter?.(null); // reset về tất cả sản phẩm
        navigate('/');
    };

    return (
        <div className="app-header-wrapper">
            {/* KHỐI 1: TOP HEADER (MÀU ĐEN) */}
            <div className="top-bar-black">
                <div className="container">
                    <div className="header-content">
                        {/* Logo */}
                        <div className="logo-section" onClick={handleLogoClick}>
                            <h1 className="store-logo">BABYSHARk</h1>
                        </div>

                        <div className="search-section">
                            <form onSubmit={handleSearch} className="search-form">
                                <div className="search-wrapper">
                                    <input
                                        type="text"
                                        placeholder="Bạn đang tìm gì..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="search-input"
                                    />

                                    <button type="submit" className="search-btn-inside">
                                        🔍
                                    </button>
                                </div>
                            </form>
                        </div>


                        {/* Actions: Cửa hàng, User, Giỏ hàng */}
                        <div className="header-actions">


                            {/* Nút 'Quay về Admin' sẽ hiển thị trong dropdown user (nếu là admin) */}

                            <div className="user-menu-wrapper">
                                <button
                                    className="action-btn user-btn"
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                >
                                    {/* Logic hiển thị Avatar hoặc Icon mặc định */}
                                    {user?.avatar ? (
                                        <img
                                            src={getAvatarUrl(user?.avatar)}
                                            alt="Avatar"
                                            className="user-avatar-small"
                                        />
                                    ) : (
                                        <span className="icon">👤</span>
                                    )}
                                    <span className="text">{user?.fullName || user?.username || 'Tài khoản'}</span>
                                </button>

                                {showUserMenu && (
                                    <div className="user-dropdown">
                                        {isAdmin && (
                                            <button onClick={() => { navigate('/admin/dashboard'); setShowUserMenu(false); }}>
                                                Trang Quản Trị
                                            </button>
                                        )}
                                        <button onClick={() => { navigate('/profile'); setShowUserMenu(false); }}>
                                            👤 Hồ sơ của tôi
                                        </button>
                                        <button onClick={() => { navigate('/orders'); setShowUserMenu(false); }}>
                                            📦 Đơn hàng
                                        </button>
                                        <button onClick={() => { navigate('/payment-history'); setShowUserMenu(false); }}>
                                            💳 Lịch sử thanh toán
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
            </div>

            {/* KHỐI 2: NAVIGATION MENU (MÀU TRẮNG - DÍNH LIỀN KHỐI TRÊN) */}
            <nav className="nav-bar-white">
                <div className="container">
                    <ul className="nav-menu">
                        {/* Nút Sản Phẩm Hot */}
                        <li className="nav-item highlight">
                            <a href="#" onClick={(e) => { e.preventDefault(); handleCategoryFilter(null, 'hot'); }}>
                                Sản Phẩm <span className="badge-new">Hot</span>
                            </a>
                        </li>


                        {/* Render Danh mục từ API */}
                        {categories.slice(0, 5).map((cat) => (
                            <li key={cat.id} className="nav-item">
                                <a href="#" onClick={(e) => { e.preventDefault(); handleCategoryFilter(cat.id); }}>
                                    {cat.icon} {cat.title.toUpperCase()}
                                </a>
                            </li>
                        ))}

                        {/* Nút Sale */}
                        <li className="nav-item sale">
                            <a href="#" onClick={(e) => { e.preventDefault(); handleCategoryFilter(null, 'sale'); }}>
                                🔥 SALE 12.12 <span className="badge-sale">-50%</span>
                            </a>
                        </li>

                        <li className="nav-item">
                            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/tin-tuc'); }}>TIN THỜI TRANG</a>
                        </li>
                    </ul>
                </div>
            </nav>
        </div>
    );
};

export default Header;