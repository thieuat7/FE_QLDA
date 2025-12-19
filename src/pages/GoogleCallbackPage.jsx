// Page - Google OAuth Callback Handler
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const GoogleCallbackPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        let isMounted = true;

        const handleGoogleCallback = async () => {
            const token = searchParams.get('token');

            if (!token) {
                console.error('No token found in URL');
                if (isMounted) navigate('/login', { replace: true });
                return;
            }

            console.log('Google callback - Token received:', token.substring(0, 20) + '...');

            // Kiểm tra token đã được xử lý thành công chưa (có cả token VÀ user)
            const existingToken = localStorage.getItem('token');
            const existingUser = localStorage.getItem('user');

            if (existingToken === token && existingUser) {
                console.log('Token already processed with user data, redirecting to home...');
                if (isMounted) navigate('/', { replace: true });
                return;
            }

            console.log('Processing new Google token...');

            try {
                // Lưu token vào localStorage
                localStorage.setItem('token', token);

                console.log('Fetching user info from API...');

                // Gọi API lấy thông tin user
                const response = await fetch('https://be-qlda.onrender.com/api/auth/me', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!isMounted) return; // Component unmounted, stop processing

                const data = await response.json();

                if (data.success && data.user) {
                    console.log('Google login successful:', data.user);

                    // Lưu user vào localStorage
                    localStorage.setItem('user', JSON.stringify(data.user));

                    // Dispatch event để AuthContext cập nhật state
                    window.dispatchEvent(new Event('auth-changed'));
                    console.log('Auth state updated, dispatched auth-changed event');

                    // Navigate chỉ khi component vẫn mounted
                    if (isMounted) {
                        console.log('Navigating to home...');
                        navigate('/', { replace: true });
                    }
                } else {
                    console.error('Failed to get user info:', data);
                    try {
                        window.dispatchEvent(new CustomEvent('auth-expired', { detail: { source: 'GoogleCallback', message: data?.message || 'Failed to fetch user' } }));
                    } catch (e) {
                        localStorage.removeItem('token');
                        if (isMounted) navigate('/login', { replace: true });
                    }
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
                try {
                    window.dispatchEvent(new CustomEvent('auth-expired', { detail: { source: 'GoogleCallback', message: error?.message || 'Error fetching user info' } }));
                } catch (e) {
                    localStorage.removeItem('token');
                    if (isMounted) navigate('/login', { replace: true });
                }
            }
        };

        handleGoogleCallback();

        // Cleanup function
        return () => {
            isMounted = false;
        };
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
                <p style={{ fontSize: '1.2rem' }}>Đang xử lý đăng nhập Google...</p>
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

export default GoogleCallbackPage;
