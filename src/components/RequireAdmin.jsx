import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RequireAdmin = ({ children }) => {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                fontSize: '18px',
                color: '#666'
            }}>
                Đang kiểm tra quyền truy cập...
            </div>
        );
    }

    if (!isAuthenticated) {
        // Chưa đăng nhập -> redirect đến login
        return <Navigate to="/login" replace />;
    }

    // Fallback: Nếu user chưa load từ context, lấy từ localStorage
    let currentUser = user;
    if (!currentUser) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                currentUser = JSON.parse(userStr);
            } catch (e) {
                console.error('Failed to parse user from localStorage:', e);
            }
        }
    }

    // Kiểm tra role admin
    // Backend có thể trả về role = 'admin' hoặc role = 1
    console.log('RequireAdmin - user:', currentUser);
    console.log('RequireAdmin - user.role:', currentUser?.role);
    console.log('RequireAdmin - isAuthenticated:', isAuthenticated);

    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 1 || currentUser?.role === '1';
    console.log('RequireAdmin - isAdmin:', isAdmin);

    if (!isAdmin) {
        // Không phải admin -> hiển thị thông báo
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                padding: '20px',
                textAlign: 'center'
            }}>
                <div style={{
                    fontSize: '64px',
                    marginBottom: '20px'
                }}>
                    🚫
                </div>
                <h2 style={{
                    fontSize: '24px',
                    color: '#2c3e50',
                    marginBottom: '10px'
                }}>
                    Không có quyền truy cập
                </h2>
                <p style={{
                    color: '#7f8c8d',
                    fontSize: '16px',
                    marginBottom: '20px'
                }}>
                    Bạn cần quyền Admin để truy cập trang này.
                </p>
                <button
                    onClick={() => window.location.href = '/'}
                    style={{
                        padding: '12px 24px',
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                >
                    Quay về trang chủ
                </button>
            </div>
        );
    }

    // Là admin -> cho phép truy cập
    return children;
};

export default RequireAdmin;
