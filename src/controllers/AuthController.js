// Controller - Xử lý Authentication Logic
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModel from '../models/AuthModel'; // Chỉ dùng để validate form
import apiService from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';

const useAuthController = () => {
    // Lấy state và hàm từ Context (Nguồn sự thật duy nhất)
    const { login, logout, user, isAuthenticated } = useAuth();

    // AuthModel ở đây chỉ dùng như một helper để validate, không dùng để lưu state
    // Nếu method validate là static thì không cần new, nếu không thì new 1 lần
    const [validationHelper] = useState(() => new AuthModel());

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Xử lý đăng ký (Giữ nguyên logic)
    const handleRegister = useCallback(async (formData, setFormErrors) => {
        try {
            setLoading(true);
            setError(null);

            // Validate form (Dùng helper)
            const validationErrors = validationHelper.validateRegisterForm(formData);
            if (Object.keys(validationErrors).length > 0) {
                setFormErrors(validationErrors);
                setLoading(false);
                return;
            }

            const response = await apiService.register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                fullName: formData.fullName,
                phone: formData.phone
            });

            if (response.success) {
                alert('Đăng ký thành công! Vui lòng đăng nhập.');
                setTimeout(() => navigate('/login'), 500);
            }

        } catch (err) {
            console.error('Register error:', err);
            if (err.response?.data) {
                const backendError = err.response.data;
                if (backendError.errors) setFormErrors(backendError.errors);
                setError(backendError.message || 'Đăng ký thất bại');
            } else {
                setError('Không thể kết nối đến server.');
            }
        } finally {
            setLoading(false);
        }
    }, [validationHelper, navigate]);

    // Xử lý đăng nhập (SỬA LỚN)
    const handleLogin = useCallback(async (formData, setFormErrors) => {
        try {
            setLoading(true);
            setError(null);

            const validationErrors = validationHelper.validateLoginForm(formData);
            if (Object.keys(validationErrors).length > 0) {
                setFormErrors(validationErrors);
                setLoading(false);
                return;
            }

            const response = await apiService.login({
                email: formData.email,
                password: formData.password
            });

            if (response.success && response.data?.token) {
                // QUAN TRỌNG: Gọi hàm login của Context
                // Context sẽ lo việc lưu vào LocalStorage và cập nhật State
                login(response.data.token, response.data.user);

                // Logic Redirect
                const userRole = response.data.user?.role;
                // Check role linh hoạt hơn (string hoặc number)
                const isAdmin = userRole === 'admin' || userRole == 1;

                let redirectTo;
                if (isAdmin) {
                    redirectTo = '/admin/dashboard';
                } else {
                    redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/';
                    sessionStorage.removeItem('redirectAfterLogin');
                }

                navigate(redirectTo);
            }

        } catch (err) {
            console.error('Login error:', err);
            if (err.response?.data) {
                setError(err.response.data.message || 'Đăng nhập thất bại');
            } else {
                setError('Lỗi kết nối server.');
            }
        } finally {
            setLoading(false);
        }
    }, [validationHelper, navigate, login]); // Dependency là login từ context

    // Xử lý đăng xuất (SỬA LỚN)
    const handleLogout = useCallback(() => {
        // Gọi logout của Context để clear State toàn app
        logout();
        navigate('/login');
    }, [logout, navigate]);

    return {
        loading,
        error,
        handleRegister,
        handleLogin,
        handleLogout,
        // Trả về state trực tiếp từ Context, đảm bảo tính reactive
        isLoggedIn: isAuthenticated,
        currentUser: user
    };
};

export default useAuthController;