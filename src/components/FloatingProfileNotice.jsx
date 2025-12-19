import { useState } from 'react';
import { Link } from 'react-router-dom';
import { isProfileComplete, getIncompleteFields } from '../utils/profileHelper';
import { useAuth } from '../contexts/AuthContext';
import './FloatingProfileNotice.css';

const FloatingProfileNotice = () => {
    const { user } = useAuth();
    const [visible, setVisible] = useState(true);

    if (!user || isProfileComplete(user) || !visible) return null;

    const incompleteFields = getIncompleteFields(user);
    const fieldLabels = {
        username: 'Tên đăng nhập',
        phone: 'Số điện thoại',
        email: 'Email',
        password: 'Mật khẩu'
    };

    return (
        <div className="floating-profile-notice" role="status">
            <button className="fpn-close" aria-label="Đóng thông báo" onClick={() => setVisible(false)}>×</button>
            <div className="fpn-icon">⚠️</div>
            <div className="fpn-body">
                <div className="fpn-title">Thông tin của bạn chưa đầy đủ!</div>
                <div className="fpn-text">
                    Bạn cần bổ sung: <strong>{incompleteFields.map(f => fieldLabels[f]).join(', ')}</strong>
                    {' '}để có thể đặt hàng và sử dụng đầy đủ tính năng.
                </div>
                <Link to="/profile" className="fpn-action">Cập nhật ngay</Link>
            </div>
        </div>
    );
};

export default FloatingProfileNotice;
