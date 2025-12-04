// Component - Product Card
import { useNavigate } from 'react-router-dom';
import { formatPrice, calculateDiscount } from '../utils/formatters';
import { getImageUrl, handleImageError } from '../utils/imageHelper';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/products/${product.id}`);
    };

    const hasDiscount = product.priceSale && product.priceSale < product.price;
    const discountPercent = hasDiscount ? calculateDiscount(product.price, product.priceSale) : 0;

    return (
        <div className="product-card" onClick={handleClick}>
            {/* Hot Badge */}
            {product.isHot && (
                <span className="badge badge-hot">🔥 Hot</span>
            )}

            {/* Discount Badge */}
            {hasDiscount && discountPercent > 0 && (
                <span className="badge badge-discount">-{discountPercent}%</span>
            )}

            {/* Image */}
            <div className="product-image">
                <img
                    src={getImageUrl(product.image)}
                    alt={product.title}
                    onError={handleImageError}
                />
            </div>

            {/* Info */}
            <div className="product-info">
                <h3 className="product-title">{product.title}</h3>
                <p className="product-category">{product.category?.title || 'Chưa phân loại'}</p>

                {/* Price */}
                <div className="product-price">
                    {hasDiscount ? (
                        <>
                            <span className="price-sale">{formatPrice(product.priceSale)}</span>
                            <span className="price-original">{formatPrice(product.price)}</span>
                        </>
                    ) : (
                        <span className="price">{formatPrice(product.price)}</span>
                    )}
                </div>

                {/* Stock Status */}
                <div className="product-stock">
                    {product.quantity > 0 ? (
                        <span className="in-stock">✓ Còn hàng</span>
                    ) : (
                        <span className="out-stock">✗ Hết hàng</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
