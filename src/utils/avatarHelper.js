// Xóa dấu tiếng Việt
const removeVietnameseTones = (str) => {
    const from = 'àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁÀẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ';
    const to = 'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiioooooooooooooooooouuuuuuuuuuuyyyyyđAAAAAAAAAAAAAAAAAEEEEEEEEEEEIIIIIOOOOOOOOOOOOOOOOOUUUUUUUUUUUYYYYYD';

    let result = str;
    for (let i = 0; i < from.length; i++) {
        result = result.replace(new RegExp(from[i], 'g'), to[i]);
    }
    return result;
};

// Sanitize filename: xóa dấu, thay ký tự đặc biệt, chữ thường
export const sanitizeFilename = (filename) => {
    if (!filename) return '';

    // Tách tên file và extension
    const lastDotIndex = filename.lastIndexOf('.');
    const name = lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
    const ext = lastDotIndex > 0 ? filename.substring(lastDotIndex) : '';

    // Xóa dấu tiếng Việt
    let sanitized = removeVietnameseTones(name);

    // Chuyển chữ thường
    sanitized = sanitized.toLowerCase();

    // Thay thế ký tự đặc biệt và khoảng trắng bằng dấu gạch ngang
    sanitized = sanitized.replace(/[^a-z0-9]+/g, '-');

    // Xóa dấu gạch ngang thừa ở đầu, cuối và liên tiếp
    sanitized = sanitized.replace(/^-+|-+$/g, '').replace(/-+/g, '-');

    // Thêm timestamp và random number để unique
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);

    return `${sanitized}-${timestamp}-${random}${ext}`;
};

// Helper function to get full avatar URL from backend path
export const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) {
        // Nếu không có avatar, dùng default avatar từ backend
        return 'http://localhost:3000/Uploads/default-avatar.png';
    }

    // Nếu đã là URL đầy đủ (http/https), trả về luôn
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
        return avatarPath;
    }

    // Nếu là path từ backend (/Uploads/avatar-xxx.jpg), thêm base URL
    // Backend đã sanitize filename nên không cần encode
    return `http://localhost:3000${avatarPath}`;
};

// Component helper để hiển thị avatar
export const getAvatarDisplay = (user) => {
    if (!user) return null;

    const avatarUrl = getAvatarUrl(user.avatar);

    return {
        url: avatarUrl,
        placeholder: user.fullName?.charAt(0) || user.username?.charAt(0) || '?'
    };
};
