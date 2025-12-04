// Helper functions for image handling

// Xử lý URL hình ảnh từ backend
export const getImageUrl = (imagePath) => {
    if (!imagePath) {
        return '/placeholder-product.svg';
    }

    // Nếu đã là full URL
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // Fix: Nếu là đường dẫn Windows tuyệt đối (có chứa C:\\ hoặc \\)
    // VD: "Get-Item \"C:\\...\\thun be1.jpg\"" → "thun be1.jpg"
    if (imagePath.includes('\\')) {
        // Lấy tên file cuối cùng sau dấu \\
        const parts = imagePath.split('\\');
        const filename = parts[parts.length - 1].replace(/["']/g, '').trim();
        const encodedFilename = encodeURIComponent(filename);
        return `http://localhost:3000/Uploads/images/sanpham/${encodedFilename}`;
    }

    // Nếu chỉ là tên file
    if (!imagePath.startsWith('/')) {
        const encodedPath = encodeURIComponent(imagePath);
        return `http://localhost:3000/Uploads/images/sanpham/${encodedPath}`;
    }

    // Nếu là path từ backend (/Uploads/...)
    return `http://localhost:3000${imagePath}`;
};

// Xử lý lỗi khi load image
export const handleImageError = (e) => {
    e.target.src = '/placeholder-product.svg'; // ← Đổi thành .svg
};

// Xử lý avatar URL riêng
export const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) {
        return '/placeholder-avatar.svg'; // ← Thêm function mới
    }

    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
        return avatarPath;
    }

    return `http://localhost:3000${avatarPath}`;
};