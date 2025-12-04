// Home Page - Trang chủ web bán hàng
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiService from '../services/apiService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import IncompleteProfileBanner from '../components/IncompleteProfileBanner';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import './HomePage.css';

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
    const [currentSlide, setCurrentSlide] = useState(0);
    const sliderRef = useRef(null);

    // Banner slides
    const bannerSlides = [
        {
            id: 1,
            title: 'HÀNG MỚI VỀ',
            subtitle: 'COLLECTION MÙA THU ĐÔNG 2024',
            bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            image: '/banner1.jpg'
        },
        {
            id: 2,
            title: 'SALE UP TO 50%',
            subtitle: 'ƯU ĐÃI KHỦNG CHO MỌI SẢN PHẨM',
            bgColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            image: '/banner2.jpg'
        },
        {
            id: 3,
            title: 'NEW ARRIVALS',
            subtitle: 'XU HƯỚNG THỜI TRANG MỚI NHẤT',
            bgColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            image: '/banner3.jpg'
        }
    ];

    // Load categories khi component mount
    useEffect(() => {
        loadCategories();
    }, []);

    // Load products khi filters thay đổi
    useEffect(() => {
        loadProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

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
            const response = await apiService.getProducts(filters);
            if (response.success) {
                setProducts(response.data.products);
                setPagination(response.data.pagination);
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
        // TODO: Implement search
        console.log('Searching for:', searchQuery);
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
                categories={categories}
                onCategoryFilter={handleCategoryFilter}
                onSearch={handleSearch}
            />

            {/* Profile Completion Banner */}
            <IncompleteProfileBanner />

            {/* Hero Banner Slider */}
            <section className="hero-banner">
                <div className="banner-slider" ref={sliderRef}>
                    {bannerSlides.map((slide, index) => (
                        <div
                            key={slide.id}
                            className={`slide ${index === currentSlide ? 'active' : ''}`}
                            style={{ background: slide.bgColor }}
                        >
                            <div className="container">
                                <div className="slide-content">
                                    <div className="slide-text">
                                        <h2 className="slide-title">{slide.title}</h2>
                                        <p className="slide-subtitle">{slide.subtitle}</p>
                                        <button className="shop-now-btn">
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
                    <h2 className="section-title">🛍️ Sản phẩm</h2>

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

                        {pagination.totalProducts > 0 && (
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
