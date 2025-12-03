// Home Page - Trang chủ sau khi đăng nhập
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import IncompleteProfileBanner from '../components/IncompleteProfileBanner';
import './HomePage.css';

const HomePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="home-container">
            <IncompleteProfileBanner />
            <div className="home-header">
                <h1>🏠 Trang chủ</h1>
                <div className="user-info">
                    <span>Xin chào, <strong>{user?.fullName || user?.username}</strong>!</span>
                    <button onClick={handleLogout} className="btn btn-logout">
                        🚪 Đăng xuất
                    </button>
                </div>
            </div>

            <div className="home-content">
                <div className="welcome-card">
                    <h2>✨ Chào mừng đến với hệ thống!</h2>
                    <p>Đăng nhập thành công với MVC Pattern</p>

                    <div className="user-details">
                        <h3>📋 Thông tin tài khoản:</h3>
                        <ul>
                            <li><strong>Username:</strong> {user?.username}</li>
                            <li><strong>Email:</strong> {user?.email}</li>
                            <li><strong>Họ tên:</strong> {user?.fullName}</li>
                            {user?.phone && <li><strong>SĐT:</strong> {user.phone}</li>}
                            {user?.role && <li><strong>Role:</strong> {user.role}</li>}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
