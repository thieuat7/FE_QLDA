// Định nghĩa URL Backend (Dễ dàng thay đổi tại 1 nơi)
const API_URL = 'https://be-qlda.onrender.com';

// Helper functions for image handling

// Xử lý URL hình ảnh từ backend
export const getImageUrl = (imagePath) => {
    if (!imagePath) {
        return '/placeholder-product.svg';
    }

    // Nếu đã là full URL (ví dụ link ảnh online)
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
        
        // Cập nhật đường dẫn sang Render
        return `${API_URL}/Uploads/images/sanpham/${encodedFilename}`;
    }

    // Nếu chỉ là tên file (ví dụ: "image.jpg")
    if (!imagePath.startsWith('/')) {
        const encodedPath = encodeURIComponent(imagePath);
        // Cập nhật đường dẫn sang Render
        return `${API_URL}/Uploads/images/sanpham/${encodedPath}`;
    }

    // Nếu là path từ backend (/Uploads/...)
    // Cập nhật đường dẫn sang Render
    return `${API_URL}${imagePath}`;
};

// Xử lý lỗi khi load image
export const handleImageError = (e) => {
    e.target.src = '/placeholder-product.svg'; 
};

// Xử lý avatar URL riêng
export const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) {
        return '/placeholder-avatar.svg'; 
    }

    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
        return avatarPath;
    }

    // Cập nhật đường dẫn sang Render
    return `${API_URL}${avatarPath}`;
};