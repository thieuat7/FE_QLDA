// Auth Context - Quản lý global auth state
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import AuthModel from '../models/AuthModel';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [authModel] = useState(() => new AuthModel());
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Load auth state khi app khởi động
    useEffect(() => {
        const loadAuth = () => {
            const isLoggedIn = authModel.loadAuth();
            if (isLoggedIn) {
                setUser(authModel.getUser());
                setToken(authModel.getToken());
                setIsAuthenticated(true);
            }
            setLoading(false);
        };

        loadAuth();

        // Lắng nghe sự kiện auth-changed từ OAuth callback hoặc nơi khác
        const handleAuthChanged = () => {
            console.log('Auth state changed, reloading...');
            const isLoggedIn = authModel.loadAuth();
            if (isLoggedIn) {
                setUser(authModel.getUser());
                setToken(authModel.getToken());
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setToken(null);
                setIsAuthenticated(false);
            }
        };

        window.addEventListener('auth-changed', handleAuthChanged);

        return () => {
            window.removeEventListener('auth-changed', handleAuthChanged);
        };
    }, [authModel]);

    // Login
    const login = (tokenData, userData) => {
        authModel.saveAuth(tokenData, userData);
        setUser(userData);
        setToken(tokenData);
        setIsAuthenticated(true);
    };

    // Logout
    const logout = () => {
        authModel.clearAuth();
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
    };

    // Update user info
    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

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
        </AuthContext.Provider>
    );
};

// Custom hook để sử dụng AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export default AuthContext;
