import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './TinTucPage.css';

const API_BASE = 'http://localhost:3000/api/tin-tuc';

function TinTucPage() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pathFilter, setPathFilter] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(8);
    const [displayNews, setDisplayNews] = useState([]);
    const [searchParams] = useSearchParams();

    const fetchWithFilter = async (filter) => {
        setLoading(true);
        setError(null);
        try {
            // Use parent=giai-tri by default but do NOT force pathFilter so we get more items.
            const params = new URLSearchParams();
            params.set('parent', 'giai-tri');
            if (filter) params.set('pathFilter', filter);
            const res = await fetch(`${API_BASE}?${params.toString()}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            if (!json.success) throw new Error(json.message || 'Fetch failed');
            setNews(json.data?.news || []);
            setDisplayNews(json.data?.news || []);
            setPage(1);
        } catch (err) {
            setError(err.message || 'Lỗi khi tải tin tức');
            setNews([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch without pathFilter to get more items
        fetchWithFilter('');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Apply query-based client-side filtering (from header search q=...)
    useEffect(() => {
        const q = searchParams.get('q')?.trim().toLowerCase();
        if (q) {
            const filtered = (news || []).filter((item) => {
                const hay = (`${item.title || ''} ${item.snippet || ''} ${item.descriptionHtml || ''} ${item.link || ''}`).toLowerCase();
                return hay.includes(q);
            });
            setDisplayNews(filtered);
            setPage(1);
        } else {
            setDisplayNews(news);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [news, searchParams]);

    return (
        <div className="tin-tuc-page-root">
            <Header />

            <div className="tin-tuc-page container">

                {loading && <div className="status">Đang tải tin...</div>}
                {error && <div className="status status-error">Lỗi: {error}</div>}

                {!loading && !error && news.length === 0 && (
                    <div className="status">Chưa có tin nào.</div>
                )}

                <div className="news-list">
                    {displayNews.slice((page - 1) * limit, page * limit).map((item) => (
                        <div key={item.guid || item.link} className="news-card">
                            <a className="news-link" href={item.link} target="_blank" rel="noopener noreferrer">
                                <div className="news-image-wrap">
                                    {item.image ? (
                                        <img className="news-image" src={item.image} alt={item.title} loading="lazy" />
                                    ) : (
                                        <div className="news-image-placeholder">No Image</div>
                                    )}
                                </div>

                                <div className="news-content">
                                    <h3 className="news-title">{item.title}</h3>
                                    <div className="news-meta">{item.pubDate ? new Date(item.pubDate).toLocaleString() : ''}</div>
                                    <p className="news-snippet">{item.snippet}</p>
                                </div>
                            </a>
                        </div>
                    ))}
                </div>

                {/* Pagination controls (client-side) */}
                {displayNews.length > limit && (
                    <div className="pagination-row">
                        <div className="pagination-left">
                            <label>Hiển thị</label>
                            <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
                                <option value={4}>4</option>
                                <option value={8}>8</option>
                                <option value={12}>12</option>
                            </select>
                            <span>trên {displayNews.length} kết quả</span>
                        </div>

                        <div className="pagination-controls">
                            <button className="pg-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                                ‹ Trước
                            </button>

                            {Array.from({ length: Math.ceil(displayNews.length / limit) }).map((_, idx) => {
                                const p = idx + 1;
                                return (
                                    <button
                                        key={p}
                                        className={`pg-btn ${p === page ? 'active' : ''}`}
                                        onClick={() => setPage(p)}
                                    >
                                        {p}
                                    </button>
                                );
                            })}

                            <button className="pg-btn" onClick={() => setPage((p) => Math.min(Math.ceil(displayNews.length / limit), p + 1))} disabled={page === Math.ceil(displayNews.length / limit)}>
                                Tiếp ›
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}

export default TinTucPage;
