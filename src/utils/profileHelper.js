// Helper - Kiểm tra user đã hoàn thiện profile chưa
export const isProfileComplete = (user) => {
    if (!user) return false;

    // Kiểm tra các trường bắt buộc: phone, username
    // Email không bắt buộc vì có thể đăng nhập bằng Google (có email) hoặc Facebook (có thể không có email)
    // Password không bắt buộc vì đăng nhập social không cần password
    return !!(user.phone && user.username);
};

export const getIncompleteFields = (user) => {
    if (!user) return ['phone', 'username'];

    const incomplete = [];

    if (!user.username) incomplete.push('username');
    if (!user.phone) incomplete.push('phone');

    // Nếu đăng nhập bằng Facebook và không có email → cần email
    if (user.googleId === null && !user.email) {
        incomplete.push('email');
    }

    // Luôn suggest thêm password để có thể đăng nhập bằng email sau này
    // Nhưng không bắt buộc

    return incomplete;
};
