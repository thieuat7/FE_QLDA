// Component - Pagination
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxPagesToShow = 5;

    // Logic hiển thị pages (1 ... 4 5 [6] 7 8 ... 20)
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return (
        <div className="pagination">
            {/* Previous */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn-page btn-prev"
            >
                ← Trước
            </button>

            {/* First page */}
            {startPage > 1 && (
                <>
                    <button onClick={() => onPageChange(1)} className="btn-page">
                        1
                    </button>
                    {startPage > 2 && <span className="pagination-dots">...</span>}
                </>
            )}

            {/* Page numbers */}
            {pages.map(page => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`btn-page ${page === currentPage ? 'active' : ''}`}
                >
                    {page}
                </button>
            ))}

            {/* Last page */}
            {endPage < totalPages && (
                <>
                    {endPage < totalPages - 1 && <span className="pagination-dots">...</span>}
                    <button onClick={() => onPageChange(totalPages)} className="btn-page">
                        {totalPages}
                    </button>
                </>
            )}

            {/* Next */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn-page btn-next"
            >
                Sau →
            </button>
        </div>
    );
};

export default Pagination;
