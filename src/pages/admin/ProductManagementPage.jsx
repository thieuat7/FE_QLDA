import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import './ProductManagementPage.css';

const ProductManagementPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    // Filter
    const [filterCategory, setFilterCategory] = useState('');
    const [sortBy, setSortBy] = useState('');

    // Form
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        detail: '',
        price: '',
        originalPrice: '',
        priceSale: '',
        quantity: '',
        productCategoryId: '',
        productCode: '',
        alias: '',
        isActive: true,
        isHot: false
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, [currentPage, filterCategory, sortBy]);

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/categories');
            const result = await response.json();
            if (result.success) {
                setCategories(result.data.categories);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            let url = `http://localhost:3000/api/products?page=${currentPage}&limit=10`;

            if (filterCategory) {
                url += `&category_id=${filterCategory}`;
            }
            if (sortBy) {
                url += `&sort=${sortBy}`;
            }

            const response = await fetch(url);
            const result = await response.json();

            if (result.success) {
                setProducts(result.data.products);
                setTotalPages(result.data.pagination.totalPages);
                setTotalProducts(result.data.pagination.totalProducts);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            alert('Lỗi khi tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Vui lòng đăng nhập');
            return;
        }

        try {
            const url = editingProduct
                ? `http://localhost:3000/api/products/${editingProduct.id}`
                : 'http://localhost:3000/api/products';

            const method = editingProduct ? 'PUT' : 'POST';

            const formDataToSend = new FormData();

            // Append all fields
            Object.keys(formData).forEach(key => {
                if (formData[key] !== '') {
                    formDataToSend.append(key, formData[key]);
                }
            });

            // Append image file if exists
            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend
            });

            const result = await response.json();

            if (result.success) {
                alert(result.message);
                setShowModal(false);
                resetForm();
                fetchProducts();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Lỗi khi lưu sản phẩm');
        }
    };

    const handleEdit = async (productId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/products/${productId}`);
            const result = await response.json();

            if (result.success) {
                const product = result.data.product;
                setEditingProduct(product);
                setFormData({
                    title: product.title,
                    description: product.description,
                    detail: product.detail || '',
                    price: product.price,
                    originalPrice: product.originalPrice || '',
                    priceSale: product.priceSale || '',
                    quantity: product.quantity,
                    productCategoryId: product.productCategoryId,
                    productCode: product.productCode || '',
                    alias: product.alias || '',
                    isActive: product.isActive,
                    isHot: product.isHot
                });
                setImagePreview(`http://localhost:3000${product.image}`);
                setShowModal(true);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            alert('Lỗi khi tải thông tin sản phẩm');
        }
    };

    const handleDelete = async (productId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Vui lòng đăng nhập');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (result.success) {
                alert(result.message);
                fetchProducts();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Lỗi khi xóa sản phẩm');
        }
    };

    const handleAddNew = () => {
        resetForm();
        setShowModal(true);
    };

    const resetForm = () => {
        setEditingProduct(null);
        setFormData({
            title: '',
            description: '',
            detail: '',
            price: '',
            originalPrice: '',
            priceSale: '',
            quantity: '',
            productCategoryId: '',
            productCode: '',
            alias: '',
            isActive: true,
            isHot: false
        });
        setImageFile(null);
        setImagePreview(null);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    return (
        <AdminLayout>
            <div className="product-management-page">
                <div className="page-header">
                    <h1>Quản Lý Sản Phẩm</h1>
                    <button onClick={handleAddNew} className="btn-add-new">
                        + Thêm Sản Phẩm Mới
                    </button>
                </div>

                {/* Filters */}
                <div className="filters">
                    <select
                        value={filterCategory}
                        onChange={(e) => {
                            setFilterCategory(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="filter-select"
                    >
                        <option value="">Tất cả danh mục</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.icon} {cat.title}
                            </option>
                        ))}
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => {
                            setSortBy(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="filter-select"
                    >
                        <option value="">Sắp xếp mặc định</option>
                        <option value="price_asc">Giá tăng dần</option>
                        <option value="price_desc">Giá giảm dần</option>
                    </select>

                    <div className="total-info">
                        Tổng: <strong>{totalProducts}</strong> sản phẩm
                    </div>
                </div>

                {/* Products Table */}
                {loading ? (
                    <div className="loading">Đang tải...</div>
                ) : (
                    <>
                        <div className="products-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Ảnh</th>
                                        <th>Tên Sản Phẩm</th>
                                        <th>Mã SP</th>
                                        <th>Danh Mục</th>
                                        <th>Giá</th>
                                        <th>Giá Sale</th>
                                        <th>Số Lượng</th>
                                        <th>Trạng Thái</th>
                                        <th>Thao Tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product.id}>
                                            <td>{product.id}</td>
                                            <td className="image-cell">
                                                <img
                                                    src={`http://localhost:3000${product.image}`}
                                                    alt={product.title}
                                                    onError={(e) => e.target.src = '/placeholder.png'}
                                                />
                                            </td>
                                            <td>
                                                <div className="product-title">{product.title}</div>
                                                {product.isHot && <span className="badge-hot">🔥 HOT</span>}
                                            </td>
                                            <td className="code-cell">{product.productCode}</td>
                                            <td>{product.category?.title}</td>
                                            <td className="price-cell">{formatCurrency(product.price)}</td>
                                            <td className="price-cell sale">
                                                {product.priceSale > 0 ? formatCurrency(product.priceSale) : '-'}
                                            </td>
                                            <td className="quantity-cell">
                                                <span className={product.quantity < 10 ? 'low-stock' : ''}>
                                                    {product.quantity}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
                                                    {product.isActive ? '✓ Kích hoạt' : '✕ Ẩn'}
                                                </span>
                                            </td>
                                            <td className="action-cell">
                                                <button
                                                    onClick={() => handleEdit(product.id)}
                                                    className="btn-edit"
                                                >
                                                    ✏️ Sửa
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="btn-delete"
                                                >
                                                    🗑️ Xóa
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {products.length === 0 && (
                                <div className="empty-state">
                                    <p>Chưa có sản phẩm nào</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="btn-page"
                                >
                                    « Trước
                                </button>

                                <span className="page-info">
                                    Trang {currentPage} / {totalPages}
                                </span>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="btn-page"
                                >
                                    Sau »
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Modal Form */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>{editingProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h2>
                                <button onClick={() => setShowModal(false)} className="btn-close">
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Tên Sản Phẩm <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Mã Sản Phẩm</label>
                                        <input
                                            type="text"
                                            value={formData.productCode}
                                            onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                                            placeholder="Để trống để tự động tạo"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Mô Tả Ngắn <span className="required">*</span></label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows="3"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Mô Tả Chi Tiết</label>
                                    <textarea
                                        value={formData.detail}
                                        onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                                        rows="5"
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Giá Gốc</label>
                                        <input
                                            type="number"
                                            value={formData.originalPrice}
                                            onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Giá Bán <span className="required">*</span></label>
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Giá Sale</label>
                                        <input
                                            type="number"
                                            value={formData.priceSale}
                                            onChange={(e) => setFormData({ ...formData, priceSale: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Số Lượng <span className="required">*</span></label>
                                        <input
                                            type="number"
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Danh Mục <span className="required">*</span></label>
                                        <select
                                            value={formData.productCategoryId}
                                            onChange={(e) => setFormData({ ...formData, productCategoryId: e.target.value })}
                                            required
                                        >
                                            <option value="">Chọn danh mục</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.icon} {cat.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Ảnh Sản Phẩm {!editingProduct && <span className="required">*</span>}</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        required={!editingProduct}
                                    />
                                    {imagePreview && (
                                        <div className="image-preview">
                                            <img src={imagePreview} alt="Preview" />
                                        </div>
                                    )}
                                </div>

                                <div className="form-row">
                                    <div className="form-group checkbox-group">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={formData.isActive}
                                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            />
                                            Kích hoạt sản phẩm
                                        </label>
                                    </div>

                                    <div className="form-group checkbox-group">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={formData.isHot}
                                                onChange={(e) => setFormData({ ...formData, isHot: e.target.checked })}
                                            />
                                            🔥 Sản phẩm HOT
                                        </label>
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">
                                        Hủy
                                    </button>
                                    <button type="submit" className="btn-submit">
                                        {editingProduct ? 'Cập Nhật' : 'Tạo Mới'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default ProductManagementPage;
