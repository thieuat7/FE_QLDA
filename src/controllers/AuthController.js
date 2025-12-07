// Controller - Xử lý Authentication Logic
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModel from '../models/AuthModel';
import apiService from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';

const useAuthController = () => {
    const [model] = useState(() => new AuthModel());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { login: setAuthContext } = useAuth();

    // Xử lý đăng ký
    const handleRegister = useCallback(async (formData, setFormErrors) => {
        try {
            setLoading(true);
            setError(null);

            // Validate form ở client trước
            const validationErrors = model.validateRegisterForm(formData);
            if (Object.keys(validationErrors).length > 0) {
                setFormErrors(validationErrors);
                setLoading(false);
                return;
            }

            // Gọi API đăng ký
            const response = await apiService.register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                fullName: formData.fullName,
                phone: formData.phone
            });

            if (response.success) {
                // Đăng ký thành công, chuyển đến trang login
                alert('Đăng ký thành công! Vui lòng đăng nhập.');
                setTimeout(() => {
                    navigate('/login');
                }, 500);
            }

        } catch (err) {
            console.error('Register error:', err);

            // Xử lý lỗi từ backend
            if (err.response?.data) {
                const backendError = err.response.data;

                // Nếu có lỗi validation từ backend
                if (backendError.errors) {
                    setFormErrors(backendError.errors);
                }

                // Hiển thị message lỗi
                setError(backendError.message || 'Đăng ký thất bại');
            } else {
                setError('Không thể kết nối đến server. Vui lòng thử lại!');
            }
        } finally {
            setLoading(false);
        }
    }, [model, navigate]);

    // Xử lý đăng nhập
    const handleLogin = useCallback(async (formData, setFormErrors) => {
        try {
            setLoading(true);
            setError(null);

            // Validate form
            const validationErrors = model.validateLoginForm(formData);
            if (Object.keys(validationErrors).length > 0) {
                setFormErrors(validationErrors);
                setLoading(false);
                return;
            }

            // Gọi API đăng nhập
            const response = await apiService.login({
                email: formData.email,
                password: formData.password
            });

            if (response.success && response.data?.token) {
                // Lưu token và user info vào localStorage
                model.saveAuth(response.data.token, response.data.user);

                // Cập nhật AuthContext
                setAuthContext(response.data.token, response.data.user);

                // Kiểm tra role để redirect đúng trang
                const userRole = response.data.user?.role;
                const isAdmin = userRole === 'admin' || userRole === 1 || userRole === '1';

                let redirectTo;
                if (isAdmin) {
                    // Admin -> redirect đến dashboard
                    redirectTo = '/admin/dashboard';
                } else {
                    // User thường -> redirect đến trang chủ hoặc trang trước đó
                    redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/';
                    sessionStorage.removeItem('redirectAfterLogin');
                }

                // Navigate ngay lập tức
                navigate(redirectTo);
            }

        } catch (err) {
            console.error('Login error:', err);

            // Xử lý lỗi từ backend
            if (err.response?.data) {
                const backendError = err.response.data;
                setError(backendError.message || 'Đăng nhập thất bại');
            } else {
                setError('Không thể kết nối đến server. Vui lòng thử lại!');
            }
        } finally {
            setLoading(false);
        }
    }, [model, navigate, setAuthContext]);

    // Xử lý đăng xuất
    const handleLogout = useCallback(() => {
        model.clearAuth();
        navigate('/login');
    }, [model, navigate]);

    // Kiểm tra trạng thái đăng nhập
    const checkAuth = useCallback(() => {
        return model.loadAuth();
    }, [model]);

    return {
        loading,
        error,
        handleRegister,
        handleLogin,
        handleLogout,
        checkAuth,
        isLoggedIn: model.isLoggedIn(),
        currentUser: model.getUser()
    };
};

export default useAuthController;
