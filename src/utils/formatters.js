// Helper functions for formatting

// Format giá tiền VND
export const formatPrice = (price) => {
    if (!price) return '0₫';
    return `${price.toLocaleString('vi-VN')}₫`;
};

// Format số lượng
export const formatQuantity = (quantity) => {
    if (quantity > 0) return `Còn ${quantity} sản phẩm`;
    return 'Hết hàng';
};

// Tính phần trăm giảm giá
export const calculateDiscount = (originalPrice, salePrice) => {
    if (!salePrice || salePrice >= originalPrice) return 0;
    return Math.round((1 - salePrice / originalPrice) * 100);
};
