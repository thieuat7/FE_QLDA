// Component - Require Complete Profile (để chặn checkout/cart nếu chưa hoàn thiện)
import { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isProfileComplete, getIncompleteFields } from '../utils/profileHelper';
import './RequireCompleteProfile.css';

const RequireCompleteProfile = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        // Nếu đã đăng nhập nhưng chưa hoàn thiện profile → hiển thị modal
        if (isAuthenticated && !isProfileComplete(user)) {
            setShowModal(true);
        }
    }, [isAuthenticated, user]);

    // Chưa đăng nhập → redirect login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Đã đăng nhập nhưng chưa hoàn thiện profile → hiển thị modal chặn
    if (!isProfileComplete(user)) {
        const incompleteFields = getIncompleteFields(user);
        const fieldLabels = {
            username: 'Tên đăng nhập',
            phone: 'Số điện thoại',
            email: 'Email',
            password: 'Mật khẩu'
        };

        return (
            <>
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-icon">🔒</div>
                            <h2>Cần hoàn thiện thông tin</h2>
                            <p>
                                Bạn cần bổ sung <strong>{incompleteFields.map(f => fieldLabels[f]).join(', ')}</strong>
                                {' '}để có thể thực hiện chức năng này.
                            </p>
                            <div className="modal-actions">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => navigate('/update-profile')}
                                >
                                    Cập nhật ngay
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => navigate('/')}
                                >
                                    Quay lại trang chủ
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    // Đã đăng nhập và đã hoàn thiện profile → cho phép truy cập
    return children;
};

export default RequireCompleteProfile;
