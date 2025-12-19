// ProductCard.js
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/formatters';
import { getImageUrl, handleImageError } from '../utils/imageHelper';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/product/${product.id}`);
    };

    const showFlashVoucher = true; // Logic giả lập

    // Logic xác định
    const isHot = product.isHot || product.category_id === 'hot';
    const isSale = product.isSale === true;

    // Tính phần trăm giảm giá giả định (nếu có dữ liệu thật thì thay vào)
    const discountPercent = isSale ? Math.round(((product.price - product.priceSale) / product.price) * 100) : 0;

    return (
        <div className="product-card" onClick={handleClick}>
            {/* --- PHẦN ẢNH --- */}
            <div className="product-image-wrapper">
                <img
                    src={getImageUrl(product.image)}
                    alt={product.title}
                    onError={handleImageError}
                />

                {/* Badge MALL/Yêu thích (Giả lập icon góc trái trên như hình mẫu) */}
                <div className="badge-left-top">
                    <span className="badge-mall">Mall</span>
                </div>

                {/* Badge SALE/HOT (Góc phải trên - To và Rõ hơn) */}
                <div className="badge-right-group">
                    {isSale && (
                        <div className="badge-sticker sale">
                            <span className="percent">{discountPercent}%</span>
                            <span className="label">GIẢM</span>
                        </div>
                    )}
                    {/* Nếu không Sale mà là Hot thì hiện Hot */}
                    {!isSale && isHot && (
                        <div className="badge-sticker hot">
                            <span className="label">HOT</span>
                        </div>
                    )}
                </div>

                {/* Flash Voucher (Giữ nguyên của bạn vì nó khá đẹp rồi) */}
                {showFlashVoucher && (
                    <div className="flash-voucher-badge">
                        <div className="voucher-main">
                            <span>FLASH VOUCHER</span>
                            120K
                        </div>
                        <div className="voucher-subs">
                            <span className="sub-tag">12K</span>
                            <span className="sub-tag">20K</span>
                            <span className="sub-tag">50K</span>
                        </div>
                    </div>
                )}
            </div>

            {/* --- PHẦN THÔNG TIN --- */}
            <div className="product-info">
                <h3 className="product-title">{product.title}</h3>

                {/* Tags row: Làm đẹp lại các tag nhỏ */}
                <div className="tags-row">
                    {isHot && <span className="tag tag-hot">🔥 Bán chạy</span>}
                    {isSale && <span className="tag tag-sale">Đang giảm giá</span>}
                    <span className="tag tag-ship">Freeship</span>
                </div>

                <div className="price-row">
                    {isSale ? (
                        <>
                            <div className="price-group">
                                <span className="price-original">{formatPrice(product.price)}</span>
                                <span className="price-sale">{formatPrice(product.priceSale)}</span>
                            </div>
                        </>
                    ) : (
                        <span className="price-text">{formatPrice(product.price)}</span>
                    )}

                    <button className="cart-icon-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;