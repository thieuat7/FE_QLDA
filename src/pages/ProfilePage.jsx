// Page - Thông tin cá nhân
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import { getAvatarUrl } from '../utils/avatarHelper';
import './ProfilePage.css';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user: authUser, updateUser, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('info'); // 'info', 'password', 'avatar'
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Form states
    const [profileForm, setProfileForm] = useState({
        userName: '',
        email: '',
        fullName: '',
        phone: ''
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);

    const [errors, setErrors] = useState({});

    // Load user data khi component mount
    useEffect(() => {
        if (authUser) {
            setProfileForm({
                userName: authUser.username || '',
                email: authUser.email || '',
                fullName: authUser.fullName || '',
                phone: authUser.phone || ''
            });
            // Sử dụng getAvatarUrl để xử lý avatar từ 3 nguồn:
            // 1. Đăng ký thường: /Uploads/avatar-xxx.jpg
            // 2. Google OAuth: https://lh3.googleusercontent.com/...
            // 3. Facebook OAuth: https://graph.facebook.com/...
            setAvatarPreview(getAvatarUrl(authUser.avatar));
        }
    }, [authUser]);

    // Handle profile form change
    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Handle password form change
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Handle avatar file selection
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB
                setMessage({ type: 'error', text: 'Kích thước file không được vượt quá 5MB' });
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
                setAvatarFile(file);
            };
            reader.readAsDataURL(file);
        }
    };

    // Validate profile form
    const validateProfile = () => {
        const newErrors = {};

        if (!profileForm.userName || profileForm.userName.trim() === '') {
            newErrors.userName = 'Tên đăng nhập không được để trống';
        }

        if (!profileForm.email || profileForm.email.trim() === '') {
            newErrors.email = 'Email không được để trống';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
            newErrors.email = 'Email không đúng định dạng';
        }

        if (!profileForm.fullName || profileForm.fullName.trim() === '') {
            newErrors.fullName = 'Họ tên không được để trống';
        }

        if (!profileForm.phone || profileForm.phone.trim() === '') {
            newErrors.phone = 'Số điện thoại không được để trống';
        } else if (!/^[0-9]{10,11}$/.test(profileForm.phone)) {
            newErrors.phone = 'Số điện thoại không hợp lệ (10-11 số)';
        }

        return newErrors;
    };

    // Validate password form
    const validatePassword = () => {
        const newErrors = {};

        // Kiểm tra xem user có phải OAuth user không (chỉ dựa vào googleId/facebookId)
        const isOAuthUser = !!(authUser?.googleId || authUser?.facebookId);
        if (!isOAuthUser && !passwordForm.currentPassword) {
            newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
        }

        if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
            newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        return newErrors;
    };

    // Submit profile update
    const handleProfileSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateProfile();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await apiService.updateProfile({
                userName: profileForm.userName,
                email: profileForm.email,
                fullName: profileForm.fullName,
                phone: profileForm.phone
            });

            if (response.success) {
                // Cập nhật user trong AuthContext và localStorage
                const updatedUser = {
                    ...authUser,
                    username: profileForm.userName,
                    email: profileForm.email,
                    fullName: profileForm.fullName,
                    phone: profileForm.phone
                };
                updateUser(updatedUser);

                // Dispatch event để các component khác biết
                window.dispatchEvent(new Event('auth-changed'));

                setMessage({ type: 'success', text: '✅ Cập nhật thông tin thành công!' });
            } else {
                setMessage({ type: 'error', text: response.message || 'Cập nhật thất bại' });
            }
        } catch (error) {
            console.error('Update profile error:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Lỗi kết nối server. Vui lòng thử lại!'
            });
        } finally {
            setLoading(false);
        }
    };

    // Submit password change
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validatePassword();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Tạo request body
            const requestBody = {
                newPassword: passwordForm.newPassword
            };

            // Chỉ thêm currentPassword nếu user có nhập
            if (passwordForm.currentPassword) {
                requestBody.currentPassword = passwordForm.currentPassword;
            }

            const response = await apiService.changePassword(requestBody);

            if (response.success) {
                setMessage({ type: 'success', text: '✅ Đổi mật khẩu thành công!' });
                setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } else {
                setMessage({ type: 'error', text: response.message || 'Đổi mật khẩu thất bại' });
            }
        } catch (error) {
            console.error('Change password error:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Lỗi kết nối server. Vui lòng thử lại!'
            });
        } finally {
            setLoading(false);
        }
    };

    // Submit avatar upload
    const handleAvatarSubmit = async (e) => {
        e.preventDefault();

        if (!avatarFile) {
            setMessage({ type: 'error', text: 'Vui lòng chọn ảnh đại diện' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const formData = new FormData();
            formData.append('avatar', avatarFile);

            const response = await apiService.uploadAvatar(formData);

            if (response.success) {
                // Cập nhật avatar trong AuthContext (lưu path từ backend: /Uploads/avatar-xxx.jpg)
                const updatedUser = {
                    ...authUser,
                    avatar: response.avatar
                };
                updateUser(updatedUser);

                // Dispatch event để các component khác biết
                window.dispatchEvent(new Event('auth-changed'));

                // Cập nhật preview - dùng getAvatarUrl để xử lý đúng format
                setAvatarPreview(getAvatarUrl(response.avatar));
                setMessage({ type: 'success', text: '✅ Cập nhật ảnh đại diện thành công!' });
                setAvatarFile(null);
            } else {
                setMessage({ type: 'error', text: response.message || 'Upload thất bại' });
            }
        } catch (error) {
            console.error('Upload avatar error:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Lỗi upload. Vui lòng thử lại!'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <button onClick={() => navigate('/')} className="btn-back">
                    ← Quay lại trang chủ
                </button>
                <h1>👤 Thông tin cá nhân</h1>
                <button onClick={handleLogout} className="btn-logout">
                    🚪 Đăng xuất
                </button>
            </div>

            <div className="profile-content">
                {/* Avatar Section */}
                <div className="profile-sidebar">
                    <div className="avatar-section">
                        <div className="avatar-wrapper">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar" className="avatar-image" />
                            ) : (
                                <div className="avatar-placeholder">
                                    {authUser?.fullName?.charAt(0) || authUser?.username?.charAt(0) || '?'}
                                </div>
                            )}
                        </div>
                        <h3>{authUser?.fullName || authUser?.username}</h3>
                        <p>{authUser?.email}</p>
                        {authUser?.googleId && (
                            <span className="badge badge-google">🔗 Google</span>
                        )}
                        {authUser?.facebookId && (
                            <span className="badge badge-facebook">🔗 Facebook</span>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="profile-main">
                    {/* Tabs */}
                    <div className="profile-tabs">
                        <button
                            className={`tab ${activeTab === 'info' ? 'active' : ''}`}
                            onClick={() => setActiveTab('info')}
                        >
                            📝 Thông tin cá nhân
                        </button>
                        <button
                            className={`tab ${activeTab === 'password' ? 'active' : ''}`}
                            onClick={() => setActiveTab('password')}
                        >
                            🔐 Đổi mật khẩu
                        </button>
                        <button
                            className={`tab ${activeTab === 'avatar' ? 'active' : ''}`}
                            onClick={() => setActiveTab('avatar')}
                        >
                            🖼️ Ảnh đại diện
                        </button>
                    </div>

                    {/* Message Display */}
                    {message.text && (
                        <div className={`alert alert-${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    {/* Tab Content */}
                    <div className="tab-content">
                        {activeTab === 'info' && (
                            <form onSubmit={handleProfileSubmit} className="profile-form">
                                <h2>Thông tin cá nhân</h2>
                                <p className="form-description">
                                    Cập nhật thông tin cá nhân của bạn
                                </p>

                                <div className="form-group">
                                    <label htmlFor="userName">Tên đăng nhập *</label>
                                    <input
                                        type="text"
                                        id="userName"
                                        name="userName"
                                        value={profileForm.userName}
                                        onChange={handleProfileChange}
                                        className={errors.userName ? 'error' : ''}
                                        disabled={loading}
                                        autoComplete="username"
                                    />
                                    {errors.userName && (
                                        <span className="error-message">{errors.userName}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={profileForm.email}
                                        onChange={handleProfileChange}
                                        className={errors.email ? 'error' : ''}
                                        disabled={loading}
                                        autoComplete="email"
                                    />
                                    {errors.email && (
                                        <span className="error-message">{errors.email}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="fullName">Họ và tên *</label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        value={profileForm.fullName}
                                        onChange={handleProfileChange}
                                        className={errors.fullName ? 'error' : ''}
                                        disabled={loading}
                                        autoComplete="name"
                                    />
                                    {errors.fullName && (
                                        <span className="error-message">{errors.fullName}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phone">Số điện thoại *</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={profileForm.phone}
                                        onChange={handleProfileChange}
                                        className={errors.phone ? 'error' : ''}
                                        disabled={loading}
                                        autoComplete="tel"
                                    />
                                    {errors.phone && (
                                        <span className="error-message">{errors.phone}</span>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? '⏳ Đang cập nhật...' : '💾 Lưu thay đổi'}
                                </button>
                            </form>
                        )}

                        {activeTab === 'password' && (
                            <form onSubmit={handlePasswordSubmit} className="profile-form">
                                <h2>Đổi mật khẩu</h2>
                                <p className="form-description">
                                    Thay đổi mật khẩu đăng nhập của bạn
                                </p>

                                {(authUser?.googleId || authUser?.facebookId) && (
                                    <div className="alert alert-info">
                                        ℹ️ Bạn đang đăng nhập bằng {authUser?.googleId ? 'Google' : 'Facebook'}.
                                        Đặt mật khẩu để có thể đăng nhập bằng email sau này.
                                    </div>
                                )}

                                <div className="form-group">
                                    <label htmlFor="currentPassword">
                                        {(authUser?.googleId || authUser?.facebookId)
                                            ? 'Mật khẩu hiện tại (không bắt buộc với OAuth)'
                                            : 'Mật khẩu hiện tại *'}
                                    </label>
                                    <input
                                        type="password"
                                        id="currentPassword"
                                        name="currentPassword"
                                        value={passwordForm.currentPassword}
                                        onChange={handlePasswordChange}
                                        className={errors.currentPassword ? 'error' : ''}
                                        disabled={loading}
                                        autoComplete="current-password"
                                        placeholder={(authUser?.googleId || authUser?.facebookId)
                                            ? 'Không bắt buộc (OAuth user)'
                                            : 'Nhập mật khẩu hiện tại'}
                                    />
                                    {errors.currentPassword && (
                                        <span className="error-message">{errors.currentPassword}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="newPassword">Mật khẩu mới *</label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        name="newPassword"
                                        value={passwordForm.newPassword}
                                        onChange={handlePasswordChange}
                                        className={errors.newPassword ? 'error' : ''}
                                        disabled={loading}
                                        autoComplete="new-password"
                                        placeholder="Ít nhất 6 ký tự"
                                    />
                                    {errors.newPassword && (
                                        <span className="error-message">{errors.newPassword}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Xác nhận mật khẩu mới *</label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={passwordForm.confirmPassword}
                                        onChange={handlePasswordChange}
                                        className={errors.confirmPassword ? 'error' : ''}
                                        disabled={loading}
                                        autoComplete="new-password"
                                        placeholder="Nhập lại mật khẩu mới"
                                    />
                                    {errors.confirmPassword && (
                                        <span className="error-message">{errors.confirmPassword}</span>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? '⏳ Đang xử lý...' : '🔒 Đổi mật khẩu'}
                                </button>
                            </form>
                        )}

                        {activeTab === 'avatar' && (
                            <form onSubmit={handleAvatarSubmit} className="profile-form">
                                <h2>Ảnh đại diện</h2>
                                <p className="form-description">
                                    Tải lên ảnh đại diện của bạn (tối đa 5MB)
                                </p>

                                <div className="avatar-upload-preview">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Preview" />
                                    ) : (
                                        <div className="avatar-placeholder-large">
                                            {authUser?.fullName?.charAt(0) || '?'}
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="avatarFile" className="file-label">
                                        📁 Chọn ảnh
                                    </label>
                                    <input
                                        type="file"
                                        id="avatarFile"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        disabled={loading}
                                        style={{ display: 'none' }}
                                    />
                                    {avatarFile && (
                                        <p className="file-name">
                                            Đã chọn: {avatarFile.name}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading || !avatarFile}
                                >
                                    {loading ? '⏳ Đang upload...' : '📤 Upload ảnh'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
