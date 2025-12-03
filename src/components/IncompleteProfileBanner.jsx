// Component - Banner thông báo cần hoàn thiện thông tin
import { Link } from 'react-router-dom';
import { isProfileComplete, getIncompleteFields } from '../utils/profileHelper';
import { useAuth } from '../contexts/AuthContext';
import './IncompleteProfileBanner.css';

const IncompleteProfileBanner = () => {
    const { user } = useAuth();

    // Nếu chưa đăng nhập hoặc đã đủ thông tin → không hiển thị banner
    if (!user || isProfileComplete(user)) {
        return null;
    }

    const incompleteFields = getIncompleteFields(user);
    const fieldLabels = {
        username: 'Tên đăng nhập',
        phone: 'Số điện thoại',
        email: 'Email',
        password: 'Mật khẩu'
    };

    return (
        <div className="incomplete-profile-banner">
            <div className="banner-content">
                <div className="banner-icon">⚠️</div>
                <div className="banner-text">
                    <strong>Thông tin của bạn chưa đầy đủ!</strong>
                    <p>
                        Bạn cần bổ sung: <strong>{incompleteFields.map(f => fieldLabels[f]).join(', ')}</strong>
                        {' '}để có thể đặt hàng và sử dụng đầy đủ tính năng.
                    </p>
                </div>
                <Link to="/update-profile" className="banner-button">
                    Cập nhật ngay
                </Link>
            </div>
        </div>
    );
};

export default IncompleteProfileBanner;
