// Page - Facebook OAuth Callback Handler
import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const FacebookCallbackPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const hasProcessed = useRef(false); // Prevent double execution in StrictMode

    useEffect(() => {
        const handleFacebookCallback = async () => {
            const token = searchParams.get('token');

            if (!token) {
                console.error('No token found in URL');
                navigate('/login', { replace: true });
                return;
            }

            // Kiểm tra xem token này đã được xử lý chưa (tránh StrictMode chạy lại)
            const existingToken = localStorage.getItem('token');
            const existingUser = localStorage.getItem('user');

            if (existingToken === token && existingUser) {
                // Token đã được xử lý và user đã có → redirect ngay
                console.log('Token already processed, redirecting...');
                navigate('/', { replace: true });
                return;
            }

            // Prevent double execution
            if (hasProcessed.current) return;
            hasProcessed.current = true;

            try {
                // Lưu token vào localStorage trước
                localStorage.setItem('token', token);

                // Gọi API lấy thông tin user
                const response = await fetch('http://localhost:3000/api/auth/me', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();

                if (data.success && data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                    console.log('Facebook login successful:', data.user);

                    // Dispatch event để AuthContext cập nhật state
                    window.dispatchEvent(new Event('auth-changed'));
                    console.log('Auth state updated, dispatched auth-changed event');

                    // Navigate ngay
                    navigate('/', { replace: true });
                } else {
                    console.error('Failed to get user info:', data);
                    try {
                        window.dispatchEvent(new CustomEvent('auth-expired', { detail: { source: 'FacebookCallback', message: data?.message || 'Failed to fetch user' } }));
                    } catch (e) {
                        localStorage.removeItem('token');
                        navigate('/login', { replace: true });
                    }
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
                try {
                    window.dispatchEvent(new CustomEvent('auth-expired', { detail: { source: 'FacebookCallback', message: error?.message || 'Error fetching user info' } }));
                } catch (e) {
                    localStorage.removeItem('token');
                    navigate('/login', { replace: true });
                }
            }
        };

        handleFacebookCallback();
    }, [searchParams, navigate]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
            <div style={{ textAlign: 'center', color: 'white' }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    border: '4px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '4px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 1rem'
                }}></div>
                <p style={{ fontSize: '1.2rem' }}>Đang xử lý đăng nhập Facebook...</p>
                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>
                    Vui lòng đợi trong giây lát
                </p>
            </div>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default FacebookCallbackPage;
