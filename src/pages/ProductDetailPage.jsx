// Product Detail Page - Chi tiết sản phẩm
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import { getImageUrl, handleImageError } from '../utils/imageHelper';
import { useCart } from '../contexts/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    // State
    const [product, setProduct] = useState(null);
    const [categories, setCategories] = useState([]);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [size, setSize] = useState('S');
    const [color, setColor] = useState('Đen');
    const [activeTab, setActiveTab] = useState('description');
    const [showToast, setShowToast] = useState(false);

    // Load product detail
    useEffect(() => {
        loadProductDetail();
        loadCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const loadProductDetail = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getProductById(id);

            if (response.success) {
                const productData = response.data.product || response.data;
                setProduct(productData);
                setSelectedImage(getImageUrl(productData.image));

                // Load related products
                if (productData.productCategoryId) {
                    loadRelatedProducts(productData.productCategoryId);
                }
            } else {
                setError(response.message || 'Không thể tải thông tin sản phẩm');
            }
        } catch (err) {
            console.error('Load product error:', err);
            setError('Có lỗi xảy ra khi tải thông tin sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const response = await apiService.getCategories();
            if (response.success) {
                setCategories(response.data.categories);
            }
        } catch (err) {
            console.error('Load categories error:', err);
        }
    };

    const loadRelatedProducts = async (categoryId) => {
        try {
            const response = await apiService.getProducts({
                category_id: categoryId,
                limit: 6
            });

            if (response.success) {
                // Lọc bỏ sản phẩm hiện tại
                const filtered = response.data.products.filter(p => p.id !== parseInt(id));
                setRelatedProducts(filtered);
            }
        } catch (err) {
            console.error('Load related products error:', err);
        }
    };

    const handleCategoryFilter = (categoryId) => {
        navigate(`/?category=${categoryId}`);
    };

    const handleSearch = (query) => {
        navigate(`/?search=${query}`);
    };

    const handleQuantityChange = (delta) => {
        const newQuantity = quantity + delta;
        if (newQuantity >= 1 && newQuantity <= (product?.quantity || 999)) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = () => {
        if (!product) return;

        const cartItem = {
            id: product.id,
            title: product.title,
            image: product.image,
            price: product.priceSale || product.price,
            quantity: quantity,
            size: size,
            color: color,
            productCode: product.productCode
        };

        addToCart(cartItem);

        // Show success message
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleBuyNow = () => {
        handleAddToCart();
        navigate('/cart');
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const calculateDiscount = () => {
        if (!product?.priceSale || product.priceSale >= product.price) return 0;
        return Math.round((1 - product.priceSale / product.price) * 100);
    };

    if (loading) {
        return (
            <div className="product-detail-page">
                <Header
                    categories={categories}
                    onCategoryFilter={handleCategoryFilter}
                    onSearch={handleSearch}
                />
                <div className="container">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Đang tải thông tin sản phẩm...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="product-detail-page">
                <Header
                    categories={categories}
                    onCategoryFilter={handleCategoryFilter}
                    onSearch={handleSearch}
                />
                <div className="container">
                    <div className="error-container">
                        <h2>😕 Không tìm thấy sản phẩm</h2>
                        <p>{error || 'Sản phẩm không tồn tại hoặc đã bị xóa'}</p>
                        <button className="back-btn" onClick={() => navigate('/')}>
                            ← Quay lại trang chủ
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const discount = calculateDiscount();

    return (
        <div className="product-detail-page">
            <Header
                categories={categories}
                onCategoryFilter={handleCategoryFilter}
                onSearch={handleSearch}
            />

            <div className="container">
                {/* Breadcrumb */}
                <div className="breadcrumb">
                    <span onClick={() => navigate('/')} className="breadcrumb-link">Trang chủ</span>
                    <span className="separator">/</span>
                    {(product.category || product.Category) && (
                        <>
                            <span
                                onClick={() => handleCategoryFilter((product.category || product.Category).id)}
                                className="breadcrumb-link"
                            >
                                {(product.category || product.Category).title || (product.category || product.Category).name}
                            </span>
                            <span className="separator">/</span>
                        </>
                    )}
                    <span className="current">{product.title}</span>
                </div>

                {/* Product Detail */}
                <div className="product-detail-container">
                    {/* Left: Images */}
                    <div className="product-images">
                        <div className="main-image">
                            <img
                                src={selectedImage}
                                alt={product.title}
                                onError={handleImageError}
                            />
                            {discount > 0 && (
                                <div className="discount-badge">-{discount}%</div>
                            )}
                        </div>

                        {/* Thumbnail gallery */}
                        {product.images && product.images.length > 0 && (
                            <div className="image-thumbnails">
                                {product.images.map((img, index) => (
                                    <div
                                        key={index}
                                        className={`thumbnail ${selectedImage === getImageUrl(img.image) ? 'active' : ''}`}
                                        onClick={() => setSelectedImage(getImageUrl(img.image))}
                                    >
                                        <img
                                            src={getImageUrl(img.image)}
                                            alt={`${product.title} ${index + 1}`}
                                            onError={handleImageError}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Info */}
                    <div className="product-info">
                        <h1 className="product-title">{product.title}</h1>

                        <div className="product-meta">
                            <span className="product-code">Mã SP: {product.productCode || 'N/A'}</span>
                            <span className="product-status">
                                {product.quantity > 0 ? (
                                    <span className="in-stock">✓ Còn hàng ({product.quantity})</span>
                                ) : (
                                    <span className="out-of-stock">✗ Hết hàng</span>
                                )}
                            </span>
                        </div>

                        {/* Price */}
                        <div className="product-price">
                            {product.priceSale && product.priceSale < product.price ? (
                                <>
                                    <span className="sale-price">{formatPrice(product.priceSale)}</span>
                                    <span className="original-price">{formatPrice(product.price)}</span>
                                </>
                            ) : (
                                <span className="sale-price">{formatPrice(product.price)}</span>
                            )}
                        </div>

                        {/* Discount Codes */}
                        <div className="discount-codes">
                            <p className="discount-label">Mã giảm giá bạn có thể sử dụng:</p>
                            <div className="code-list">
                                <span className="code-badge">DEC20</span>
                                <span className="code-badge">DEC50</span>
                                <span className="code-badge">DEC80</span>
                                <span className="code-badge">DEC150</span>
                            </div>
                        </div>

                        {/* Color Selection */}
                        <div className="product-option">
                            <div className="option-header">
                                <label>Màu sắc: <span className="selected-value">{color}</span></label>
                            </div>
                            <div className="color-options-circles">
                                <div
                                    className={`color-circle ${color === 'Đen' ? 'active' : ''}`}
                                    style={{ backgroundColor: '#000' }}
                                    onClick={() => setColor('Đen')}
                                    title="Đen"
                                />
                                <div
                                    className={`color-circle ${color === 'Xám' ? 'active' : ''}`}
                                    style={{ backgroundColor: '#888' }}
                                    onClick={() => setColor('Xám')}
                                    title="Xám"
                                />
                            </div>
                        </div>

                        {/* Size Selection */}
                        <div className="product-option">
                            <div className="option-header">
                                <label>Kích thước: <span className="selected-value">{size}</span></label>
                                <a href="#size-guide" className="size-guide-link">📏 Hướng dẫn chọn size</a>
                            </div>
                            <div className="size-options-tabs">
                                {['S', 'M', 'L', 'XL'].map(s => (
                                    <button
                                        key={s}
                                        className={`size-tab ${size === s ? 'active' : ''}`}
                                        onClick={() => setSize(s)}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="product-option">
                            <label>Số lượng:</label>
                            <div className="quantity-selector">
                                <button
                                    className="qty-btn"
                                    onClick={() => handleQuantityChange(-1)}
                                    disabled={quantity <= 1}
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    value={quantity}
                                    readOnly
                                    className="qty-input"
                                />
                                <button
                                    className="qty-btn"
                                    onClick={() => handleQuantityChange(1)}
                                    disabled={quantity >= product.quantity}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="product-actions">
                            <button
                                className="btn-add-cart"
                                onClick={handleAddToCart}
                                disabled={product.quantity === 0}
                            >
                                THÊM VÀO GIỎ
                            </button>
                            <button
                                className="btn-buy-now"
                                onClick={handleBuyNow}
                                disabled={product.quantity === 0}
                            >
                                MUA NGAY
                            </button>
                        </div>

                        {/* Store Info */}
                        <div className="store-info">
                            <p className="store-count">🏪 Có 9 cửa hàng còn sản phẩm này</p>
                        </div>

                        {/* Benefits Grid */}
                        <div className="benefits-grid">
                            <div className="benefit-item">
                                <div className="benefit-icon">📦</div>
                                <p>Đổi trả dễ dàng trong vòng 15 ngày</p>
                            </div>
                            <div className="benefit-item">
                                <div className="benefit-icon">🚚</div>
                                <p>Miễn phí vận chuyển đơn từ 299K</p>
                            </div>
                            <div className="benefit-item">
                                <div className="benefit-icon">✅</div>
                                <p>Bảo hành trọn vòng 30 ngày</p>
                            </div>
                            <div className="benefit-item">
                                <div className="benefit-icon">📞</div>
                                <p>Hotline: 0287.100.8788 hỗ trợ từ 8h30-24h</p>
                            </div>
                            <div className="benefit-item">
                                <div className="benefit-icon">🌏</div>
                                <p>Giao hàng toàn quốc</p>
                            </div>
                            <div className="benefit-item">
                                <div className="benefit-icon">💎</div>
                                <p>Có công đơn ưu đãi DXTH</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="product-tabs-section">
                    <div className="tabs-header">
                        <button
                            className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                            onClick={() => setActiveTab('description')}
                        >
                            MÔ TẢ
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
                            onClick={() => setActiveTab('shipping')}
                        >
                            CHÍNH SÁCH GIAO HÀNG
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'return' ? 'active' : ''}`}
                            onClick={() => setActiveTab('return')}
                        >
                            CHÍNH SÁCH ĐỔI HÀNG
                        </button>
                    </div>

                    <div className="tabs-content">
                        {activeTab === 'description' && (
                            <div className="tab-pane">
                                <h3>{product.title}</h3>
                                {product.detail ? (
                                    <div dangerouslySetInnerHTML={{ __html: product.detail }} />
                                ) : (
                                    <div>
                                        <p>{product.description}</p>
                                        <h4>Thông tin sản phẩm:</h4>
                                        <ul>
                                            <li>Chất liệu: Cotton cao cấp</li>
                                            <li>Form: Regular fit</li>
                                            <li>Xuất xứ: Việt Nam</li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'shipping' && (
                            <div className="tab-pane">
                                <h3>Chính sách giao hàng</h3>
                                <ul>
                                    <li>✅ Miễn phí vận chuyển cho đơn hàng từ 299.000đ</li>
                                    <li>📦 Đóng gói cẩn thận, giao hàng nhanh chóng</li>
                                    <li>🚚 Thời gian giao hàng: 2-5 ngày tùy khu vực</li>
                                    <li>📍 Giao hàng toàn quốc</li>
                                    <li>💰 Thanh toán khi nhận hàng (COD)</li>
                                </ul>
                            </div>
                        )}

                        {activeTab === 'return' && (
                            <div className="tab-pane">
                                <h3>Chính sách đổi trả</h3>
                                <ul>
                                    <li>🔄 Đổi trả trong vòng 15 ngày</li>
                                    <li>✨ Sản phẩm còn nguyên tem mác, chưa qua sử dụng</li>
                                    <li>📦 Đổi size miễn phí trong 7 ngày đầu</li>
                                    <li>💸 Hoàn tiền 100% nếu sản phẩm lỗi</li>
                                    <li>📞 Liên hệ hotline: 0287.100.8788 để được hỗ trợ</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="related-products-section">
                        <h2>🔗 Sản phẩm liên quan</h2>
                        <div className="related-products-grid">
                            {relatedProducts.map(relatedProduct => (
                                <div
                                    key={relatedProduct.id}
                                    className="related-product-card"
                                    onClick={() => {
                                        navigate(`/product/${relatedProduct.id}`);
                                        window.scrollTo(0, 0);
                                    }}
                                >
                                    <img
                                        src={getImageUrl(relatedProduct.image)}
                                        alt={relatedProduct.title}
                                        onError={handleImageError}
                                    />
                                    <h3>{relatedProduct.title}</h3>
                                    <p className="price">
                                        {formatPrice(relatedProduct.priceSale || relatedProduct.price)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Footer />

            {/* Success Toast */}
            {showToast && (
                <div className="cart-toast">
                    ✓ Đã thêm vào giỏ hàng!
                </div>
            )}
        </div>
    );
};

export default ProductDetailPage;
