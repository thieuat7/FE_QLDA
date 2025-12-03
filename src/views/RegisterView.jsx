// View - Register Form Component
import { useState } from 'react';
import { Link } from 'react-router-dom';
import './AuthView.css';

const RegisterView = ({ onRegister, loading, error }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        phone: ''
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
        onRegister(formData, setFormErrors);
    };

    return (
        <div className="auth-container">
            <div className="auth-box register-box">
                <div className="auth-header">
                    <h1>📝 Đăng ký tài khoản</h1>
                    <p>Tạo tài khoản mới để bắt đầu mua sắm!</p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        ❌ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="username">Tên đăng nhập *</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Nhập username"
                            className={formErrors.username ? 'error' : ''}
                            disabled={loading}
                            autoComplete="username"
                        />
                        {formErrors.username && (
                            <span className="error-message">{formErrors.username}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email *</label>
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

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="password">Mật khẩu *</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Ít nhất 6 ký tự"
                                className={formErrors.password ? 'error' : ''}
                                disabled={loading}
                                autoComplete="new-password"
                            />
                            {formErrors.password && (
                                <span className="error-message">{formErrors.password}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Xác nhận mật khẩu *</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Nhập lại mật khẩu"
                                className={formErrors.confirmPassword ? 'error' : ''}
                                disabled={loading}
                                autoComplete="new-password"
                            />
                            {formErrors.confirmPassword && (
                                <span className="error-message">{formErrors.confirmPassword}</span>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="fullName">Họ và tên *</label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Nguyễn Văn A"
                            className={formErrors.fullName ? 'error' : ''}
                            disabled={loading}
                            autoComplete="name"
                        />
                        {formErrors.fullName && (
                            <span className="error-message">{formErrors.fullName}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Số điện thoại *</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="0123456789"
                            className={formErrors.phone ? 'error' : ''}
                            disabled={loading}
                            autoComplete="tel"
                        />
                        {formErrors.phone && (
                            <span className="error-message">{formErrors.phone}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-small"></span> Đang đăng ký...
                            </>
                        ) : (
                            '✨ Đăng ký'
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="link">
                            Đăng nhập ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterView;
