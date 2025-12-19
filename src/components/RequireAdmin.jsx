import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RequireAdmin = ({ children }) => {
    const { user, loading } = useAuth(); // Bỏ isAuthenticated, tự check thủ công cho chắc

    // 1. Đang tải thì chờ (Giữ nguyên)
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: '#666' }}>
                Đang kiểm tra quyền truy cập...
            </div>
        );
    }

    // 2. CHIẾN THUẬT "NỒI ĐỒNG CỐI ĐÁ": 
    // Ưu tiên lấy từ Context, nếu không có thì lục lọi trong LocalStorage ngay lập tức
    let currentUser = user;

    if (!currentUser) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                currentUser = JSON.parse(userStr);
            } catch (e) {
                console.error('Lỗi parse user:', e);
            }
        }
    }

    // 3. Kiểm tra xem có User không (Nếu lục cả 2 nơi mà vẫn không có thì mới đá về Login)
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    // 4. Kiểm tra Role Admin
    // Chấp nhận cả string 'admin', '1' hoặc số 1
    const isAdmin = currentUser.role === 'admin' || currentUser.role === 1 || currentUser.role === '1';

    if (!isAdmin) {
        // Có đăng nhập nhưng không phải Admin -> Hiển thị trang cấm
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                minHeight: '100vh', padding: '20px', textAlign: 'center'
            }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚫</div>
                <h2 style={{ fontSize: '24px', color: '#2c3e50', marginBottom: '10px' }}>Không có quyền truy cập</h2>
                <p style={{ color: '#7f8c8d', fontSize: '16px', marginBottom: '20px' }}>Bạn cần quyền Admin để truy cập trang này.</p>
                <button
                    onClick={() => window.location.href = '/'}
                    style={{
                        padding: '12px 24px', background: '#667eea', color: 'white', border: 'none',
                        borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer'
                    }}
                >
                    Quay về trang chủ
                </button>
            </div>
        );
    }

    // 5. Mọi thứ ok -> Cho vào
    return children;
};

export default RequireAdmin;