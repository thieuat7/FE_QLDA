// Model - Quản lý authentication logic
class AuthModel {
    constructor() {
        this.token = null;
        this.user = null;
        this.isAuthenticated = false;
    }

    // Lưu token và thông tin user vào localStorage
    saveAuth(token, user) {
        this.token = token;
        this.user = user;
        this.isAuthenticated = true;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    }

    // Load auth từ localStorage
    loadAuth() {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
            try {
                this.token = token;
                this.user = JSON.parse(userStr);
                return true;
            } catch (error) {
                console.error("Lỗi dữ liệu auth trong storage:", error);
                // Nếu dữ liệu rác, xóa sạch để tránh lỗi lặp lại
                this.clearAuth();
                return false;
            }
        }
        return false;
    }

    // Xóa auth (logout)
    clearAuth() {
        this.token = null;
        this.user = null;
        this.isAuthenticated = false;

        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    // Lấy token hiện tại
    getToken() {
        return this.token || localStorage.getItem('token');
    }

    // Lấy user hiện tại
    getUser() {
        if (this.user) return this.user;

        const userStr = localStorage.getItem('user');
        if (userStr) {
            this.user = JSON.parse(userStr);
            return this.user;
        }

        return null;
    }

    // Kiểm tra đã đăng nhập chưa
    isLoggedIn() {
        return !!this.getToken();
    }

    // Validate email
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate password
    validatePassword(password) {
        return password && password.length >= 6;
    }

    // Validate phone
    validatePhone(phone) {
        const phoneRegex = /^[0-9]{10,11}$/;
        return phoneRegex.test(phone);
    }

    // Validate form đăng ký
    validateRegisterForm(formData) {
        const errors = {};

        if (!formData.username || formData.username.trim() === '') {
            errors.username = 'Tên đăng nhập không được để trống';
        }

        if (!formData.email || !this.validateEmail(formData.email)) {
            errors.email = 'Email không đúng định dạng';
        }

        if (!formData.password || !this.validatePassword(formData.password)) {
            errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        if (!formData.fullName || formData.fullName.trim() === '') {
            errors.fullName = 'Họ tên không được để trống';
        }

        if (!formData.phone || formData.phone.trim() === '') {
            errors.phone = 'Số điện thoại không được để trống';
        } else if (!this.validatePhone(formData.phone)) {
            errors.phone = 'Số điện thoại không hợp lệ (10-11 số)';
        }

        return errors;
    }

    // Validate form đăng nhập
    validateLoginForm(formData) {
        const errors = {};

        if (!formData.email || formData.email.trim() === '') {
            errors.email = 'Vui lòng nhập email';
        } else if (!this.validateEmail(formData.email)) {
            errors.email = 'Email không đúng định dạng';
        }

        if (!formData.password || formData.password.trim() === '') {
            errors.password = 'Vui lòng nhập mật khẩu';
        }

        return errors;
    }
}

export default AuthModel;
