// View - Login Form Component
import { useState } from 'react';
import { Link } from 'react-router-dom';
import './AuthView.css';

const LoginView = ({ onLogin, loading, error }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [formErrors, setFormErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Xóa lỗi khi user bắt đầu sửa
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(formData, setFormErrors);
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-header">
                    <h1>🔐 Đăng nhập</h1>
                    <p>Chào mừng bạn quay lại!</p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        ❌ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="example@gmail.com"
                            className={formErrors.email ? 'error' : ''}
                            disabled={loading}
                            autoComplete="email"
                        />
                        {formErrors.email && (
                            <span className="error-message">{formErrors.email}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Mật khẩu</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Nhập mật khẩu"
                            className={formErrors.password ? 'error' : ''}
                            disabled={loading}
                            autoComplete="current-password"
                        />
                        {formErrors.password && (
                            <span className="error-message">{formErrors.password}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-small"></span> Đang đăng nhập...
                            </>
                        ) : (
                            '🚀 Đăng nhập'
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="divider">
                    <span>Hoặc</span>
                </div>

                {/* Social Login Buttons */}
                <button
                    type="button"
                    className="btn btn-google"
                    onClick={() => window.location.href = 'http://localhost:3000/api/auth/google'}
                    disabled={loading}
                >
                    <img
                        src="https://www.google.com/favicon.ico"
                        alt="Google"
                        style={{ width: '20px', height: '20px', marginRight: '8px' }}
                    />
                    Đăng nhập bằng Google
                </button>

                <button
                    type="button"
                    className="btn btn-facebook"
                    onClick={() => window.location.href = 'http://localhost:3000/api/auth/facebook'}
                    disabled={loading}
                    style={{ marginTop: '0.75rem' }}
                >
                    <svg
                        style={{ width: '20px', height: '20px', marginRight: '8px' }}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Đăng nhập bằng Facebook
                </button>

                <div className="auth-footer">
                    <p>
                        Chưa có tài khoản?{' '}
                        <Link to="/register" className="link">
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginView;
