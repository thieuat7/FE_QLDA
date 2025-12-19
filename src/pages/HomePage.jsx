// Home Page - Trang chủ web bán hàng
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiService from '../services/apiService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FloatingProfileNotice from '../components/FloatingProfileNotice';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import './HomePage.css';
import imgbaner1 from '../assets/banners/sanphamhot.jpg';
import imgbaner2 from '../assets/banners/sieusale.jpg';

const HomePage = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // State
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        page: 1,
        limit: 12,
        category_id: null,
        sort: null
    });
    const [forceReload, setForceReload] = useState(0);
    const [currentSlide, setCurrentSlide] = useState(0);
    const sliderRef = useRef(null);

    // Banner slides
    const bannerSlides = [
        {
            id: 1,
            bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            image: imgbaner1
        },
        {
            id: 2,
            bgColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            image: imgbaner2
        },
    ];

    // Load categories khi component mount
    useEffect(() => {
        loadCategories();
    }, []);

    // Load products khi filters thay đổi
    useEffect(() => {
        loadProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, forceReload]);

    // Auto slide banner
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
        }, 5000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Sync filters với URL params
    useEffect(() => {
        const categoryFromUrl = searchParams.get('category');
        if (categoryFromUrl && categoryFromUrl !== filters.category_id) {
            setFilters(prev => ({ ...prev, category_id: categoryFromUrl, page: 1 }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const loadCategories = async () => {
        try {
            const response = await apiService.getCategories();
            if (response.success) {
                setCategories(response.data.categories);
            }
        } catch (error) {
            console.error('Load categories error:', error);
        }
    };

    const loadProducts = async () => {
        try {
            setLoading(true);
            let response;
            // Nếu filter là hot hoặc sale thì gọi API riêng
            if (filters.category_id === 'hot') {
                response = await apiService.getHotProducts?.();
            } else if (filters.category_id === 'sale') {
                response = await apiService.getSaleProducts?.();
            } else {
                response = await apiService.getProducts(filters);
            }
            if (response && response.success) {
                setProducts(response.data.products);
                // Nếu không có pagination, tạo object mặc định
                if (response.data.pagination) {
                    setPagination(response.data.pagination);
                } else {
                    setPagination({
                        totalProducts: response.data.products?.length || 0,
                        currentPage: 1,
                        totalPages: 1
                    });
                }
            }
        } catch (error) {
            console.error('Load products error:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryFilter = (categoryId) => {
        const newFilters = {
            ...filters,
            category_id: categoryId === 'all' ? null : categoryId,
            page: 1
        };
        setFilters(newFilters);

        // Update URL
        if (categoryId && categoryId !== 'all') {
            setSearchParams({ category: categoryId });
        } else {
            setSearchParams({});
        }
    };

    const handleSortChange = (sortType) => {
        setFilters({ ...filters, sort: sortType || null, page: 1 });
    };

    const handlePageChange = (newPage) => {
        setFilters({ ...filters, page: newPage });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearch = (searchQuery) => {
        if (!searchQuery || searchQuery.trim() === "") {
            // 1. Reset state filters
            setFilters({
                page: 1,
                limit: 12,
                category_id: null,
                sort: null
            });

            // 2. QUAN TRỌNG: Xóa luôn params trên URL để tránh useEffect tự động load lại category cũ
            setSearchParams({});

            // 3. Force reload để gọi lại API
            setForceReload(prev => prev + 1);
            return;
        }
        // Tìm kiếm sản phẩm qua API
        setLoading(true);
        apiService.searchProducts(searchQuery)
            .then((response) => {
                if (response.success) {
                    setProducts(response.data.products);
                    setPagination({
                        totalProducts: response.data.products?.length || 0,
                        currentPage: 1,
                        totalPages: 1
                    });
                } else {
                    setProducts([]);
                    setPagination({ totalProducts: 0, currentPage: 1, totalPages: 1 });
                }
            })
            .catch(() => {
                setProducts([]);
                setPagination({ totalProducts: 0, currentPage: 1, totalPages: 1 });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
    };

    return (
        <div className="homepage-modern">
            {/* Header Component */}
            <Header
                onCategoryFilter={handleCategoryFilter}
                onSearch={handleSearch}
            />

            {/* Profile Completion Banner */}
            <FloatingProfileNotice />

            {/* Hero Banner Slider */}
            <section className="hero-banner">
                <div className="banner-slider" ref={sliderRef}>
                    {bannerSlides.map((slide, index) => (
                        <div
                            key={slide.id}
                            className={`slide ${index === currentSlide ? 'active' : ''}`}
                            style={{ backgroundImage: `url(${slide.image})` }}
                            onClick={(e) => e.stopPropagation()} // chặn click trên toàn bộ banner
                        >
                            <div className="container">
                                <div className="slide-content">
                                    <div className="slide-text">
                                        <h2 className="slide-title">{slide.title}</h2>
                                        <p className="slide-subtitle">{slide.subtitle}</p>
                                        <button
                                            className="shop-now-btn"
                                            onClick={(e) => {
                                                e.stopPropagation(); // đảm bảo chỉ nút này xử lý click
                                                // Banner 1 -> hot, Banner 2 -> sale
                                                if (index === 0) handleCategoryFilter('hot');
                                                else if (index === 1) handleCategoryFilter('sale');
                                                else handleCategoryFilter('all');
                                                // Scroll to products
                                                setTimeout(() => {
                                                    const el = document.querySelector('.products-section');
                                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                                    else window.scrollTo({ top: 600, behavior: 'smooth' });
                                                }, 100);
                                            }}
                                        >
                                            XEM NGAY →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Slider Controls */}
                    <button className="slider-btn prev-btn" onClick={prevSlide}>
                        ‹
                    </button>
                    <button className="slider-btn next-btn" onClick={nextSlide}>
                        ›
                    </button>

                    {/* Slider Dots */}
                    <div className="slider-dots">
                        {bannerSlides.map((_, index) => (
                            <button
                                key={index}
                                className={`dot ${index === currentSlide ? 'active' : ''}`}
                                onClick={() => setCurrentSlide(index)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Products Section */}
            <section className="products-section">
                <div className="container">

                    {/* Filters Bar */}
                    <div className="filters-bar">
                        <div className="filter-group">
                            <label>Danh mục:</label>
                            <select
                                value={filters.category_id || 'all'}
                                onChange={(e) => handleCategoryFilter(e.target.value)}
                            >
                                <option value="all">Tất cả danh mục</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.icon} {cat.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Sắp xếp:</label>
                            <select
                                value={filters.sort || ''}
                                onChange={(e) => handleSortChange(e.target.value)}
                            >
                                <option value="">Mới nhất</option>
                                <option value="price_asc">Giá: Thấp → Cao</option>
                                <option value="price_desc">Giá: Cao → Thấp</option>
                            </select>
                        </div>

                        {pagination && pagination.totalProducts > 0 && (
                            <div className="results-info">
                                Tìm thấy <strong>{pagination.totalProducts}</strong> sản phẩm
                            </div>
                        )}
                    </div>

                    {/* Products Grid */}
                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>Đang tải sản phẩm...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="no-products">
                            <p>😔 Không có sản phẩm nào</p>
                        </div>
                    ) : (
                        <>
                            <div className="products-grid">
                                {products.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <Pagination
                                    currentPage={pagination.currentPage}
                                    totalPages={pagination.totalPages}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* Footer Component */}
            <Footer />
        </div>
    );
};

export default HomePage;
