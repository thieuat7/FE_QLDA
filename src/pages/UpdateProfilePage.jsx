// Page - Cập nhật thông tin sau khi đăng nhập Google
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../views/AuthView.css';

const UpdateProfilePage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        userName: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Lấy thông tin user từ localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const userData = JSON.parse(userStr);
            setUser(userData);

            // Pre-fill các trường đã có
            setFormData(prev => ({
                ...prev,
                userName: userData.username || '',
                phone: userData.phone || ''
            }));
        } else {
            // Chưa đăng nhập, redirect về login
            navigate('/login', { replace: true });
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Xóa lỗi khi user sửa
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.userName || formData.userName.trim() === '') {
            errors.userName = 'Tên đăng nhập không được để trống';
        }

        if (!formData.phone || formData.phone.trim() === '') {
            errors.phone = 'Số điện thoại không được để trống';
        } else if (!/^[0-9]{10,11}$/.test(formData.phone)) {
            errors.phone = 'Số điện thoại không hợp lệ (10-11 số)';
        }

        if (formData.password || formData.confirmPassword) {
            if (!formData.password || formData.password.length < 6) {
                errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
            }

            if (formData.password !== formData.confirmPassword) {
                errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
            }
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const updateData = {
                userName: formData.userName,
                phone: formData.phone
            };

            // Chỉ gửi password nếu user nhập
            if (formData.password) {
                updateData.password = formData.password;
            }

            const response = await fetch('http://localhost:3000/api/auth/update-profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();

            if (data.success) {
                // Cập nhật user info trong localStorage
                const updatedUser = {
                    ...user,
                    username: formData.userName,
                    phone: formData.phone
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));

                alert('Cập nhật thông tin thành công!');
                navigate('/', { replace: true });
            } else {
                alert(data.message || 'Cập nhật thất bại');
            }
        } catch (error) {
            console.error('Update profile error:', error);
            alert('Lỗi kết nối server. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return null; // Đang load hoặc redirect
    }

    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-header">
                    <h1>📝 Hoàn tất thông tin</h1>
                    <p>Chào mừng <strong>{user.email}</strong>!</p>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                        Để hoàn tất đăng ký và mua hàng, vui lòng bổ sung các thông tin bên dưới.
                    </p>
                </div>

                <div className="alert" style={{
                    background: '#fef3c7',
                    color: '#92400e',
                    border: '1px solid #fcd34d',
                    marginBottom: '1.5rem'
                }}>
                    ⚠️ Bạn cần hoàn thiện thông tin trước khi có thể mua hàng
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="userName">Tên đăng nhập *</label>
                        <input
                            type="text"
                            id="userName"
                            name="userName"
                            value={formData.userName}
                            onChange={handleChange}
                            placeholder="Nhập tên đăng nhập"
                            className={formErrors.userName ? 'error' : ''}
                            disabled={loading}
                        />
                        {formErrors.userName && (
                            <span className="error-message">{formErrors.userName}</span>
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
                        />
                        {formErrors.phone && (
                            <span className="error-message">{formErrors.phone}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            Mật khẩu (Tùy chọn - để trống nếu không muốn đặt)
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Ít nhất 6 ký tự"
                            className={formErrors.password ? 'error' : ''}
                            disabled={loading}
                        />
                        {formErrors.password && (
                            <span className="error-message">{formErrors.password}</span>
                        )}
                        <small style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>
                            Đặt mật khẩu để có thể đăng nhập bằng email sau này
                        </small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Nhập lại mật khẩu"
                            className={formErrors.confirmPassword ? 'error' : ''}
                            disabled={loading}
                        />
                        {formErrors.confirmPassword && (
                            <span className="error-message">{formErrors.confirmPassword}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-small"></span> Đang cập nhật...
                            </>
                        ) : (
                            '✅ Hoàn tất'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UpdateProfilePage;
