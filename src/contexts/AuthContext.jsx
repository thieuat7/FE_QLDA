/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AuthModel from '../models/AuthModel';
import apiService from '../services/apiService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Dùng lazy init cho AuthModel để tránh tạo instance mới mỗi lần render
    const [authModel] = useState(() => new AuthModel());
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // UI States
    const [showAuthExpired, setShowAuthExpired] = useState(false);
    const [expiredDetail, setExpiredDetail] = useState(null);

    // 1. Hàm helper để set state thống nhất, tránh set lẻ tẻ
    const setAuthData = useCallback((userData, tokenData) => {
        setUser(userData);
        setToken(tokenData);
        setIsAuthenticated(!!userData && !!tokenData);
    }, []);

    // 2. Load auth state khi app khởi động
    // Đảm bảo luôn đồng bộ với localStorage khi app khởi động lại hoặc khi navigation đặc biệt xảy ra
    useEffect(() => {
        const syncAuthFromStorage = async () => {
            const localUser = authModel.getUser();
            const localToken = authModel.getToken();

            if (localToken && localUser) {
                setAuthData(localUser, localToken);
                // Background sync với server để lấy user mới nhất
                try {
                    const response = await apiService.getCurrentUser();
                    if (response.success && response.user) {
                        authModel.saveAuth(localToken, response.user);
                        setAuthData(response.user, localToken);
                    }
                } catch (error) {
                    console.error('Background sync failed, using local data:', error);
                }
            } else {
                setAuthData(null, null);
            }
            setLoading(false);
        };

        // Lắng nghe cả sự kiện 'pageshow' để xử lý khi quay lại từ các trang ngoài (MoMo, VNPay, v.v)
        window.addEventListener('pageshow', syncAuthFromStorage);
        syncAuthFromStorage();
        return () => {
            window.removeEventListener('pageshow', syncAuthFromStorage);
        };
    }, [authModel, setAuthData]);

    // 3. Lắng nghe sự kiện auth-changed (Sửa lỗi race condition)
    useEffect(() => {
        const handleAuthChanged = () => {
            // Chỉ reload nếu token trong storage KHÁC với token hiện tại trong State
            // Để tránh việc đang thao tác mà bị reload lại data cũ
            const storageToken = authModel.getToken();
            if (storageToken !== token) {
                console.log('Detected external auth change, syncing...');
                const storageUser = authModel.getUser();
                setAuthData(storageUser, storageToken);
            }
        };

        window.addEventListener('auth-changed', handleAuthChanged);
        return () => window.removeEventListener('auth-changed', handleAuthChanged);
    }, [authModel, token, setAuthData]); // Dependency quan trọng: token

    // Login
    const login = (tokenData, userData) => {
        // Đảm bảo lưu user vào localStorage ngay khi đăng nhập/thanh toán
        authModel.saveAuth(tokenData, userData);
        setAuthData(userData, tokenData);
        // Bắn event để các tab khác hoặc navigation đặc biệt đều đồng bộ
        window.dispatchEvent(new Event('auth-changed'));
    };

    // Logout
    const logout = () => {
        authModel.clearAuth();
        setAuthData(null, null);
    };

    // Update user info (SỬA LỖI QUAN TRỌNG NHẤT)
    const updateUser = (userData) => {
        setUser(userData);
        const currentToken = token || authModel.getToken();
        if (currentToken) {
            authModel.saveAuth(currentToken, userData);
            window.dispatchEvent(new Event('auth-changed'));
        }
    };

    // ... (Giữ nguyên phần xử lý Auth Expired của bạn)
    useEffect(() => {
        const handleAuthExpired = (e) => {
            setExpiredDetail(e?.detail || { message: 'Phiên đăng nhập đã hết hạn.' });
            setShowAuthExpired(true);
            // Có thể clear state ngay để bảo mật, chỉ chừa lại modal
            // logout(); 
        };
        window.addEventListener('auth-expired', handleAuthExpired);
        return () => window.removeEventListener('auth-expired', handleAuthExpired);
    }, []);

    const confirmAuthExpired = () => {
        logout();
        setShowAuthExpired(false);
        window.location.href = '/login';
    };

    const dismissAuthExpired = () => setShowAuthExpired(false);

    const value = {
        user,
        token,
        isAuthenticated,
        loading,
        login,
        logout,
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
            {showAuthExpired && (
                /* ... Giữ nguyên UI Modal của bạn ... */
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ background: 'white', padding: '20px', borderRadius: 8 }}>
                        <h3>Phiên đăng nhập hết hạn</h3>
                        <button onClick={confirmAuthExpired}>Đăng nhập lại</button>
                    </div>
                </div>
            )}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export default AuthContext;