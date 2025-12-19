import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import './DiscountManagementPage.css';

const DiscountManagementPage = () => {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Form state
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        type: 'percent',
        value: '',
        minOrderAmount: '',
        maxDiscount: '',
        startDate: '',
        endDate: '',
        usageLimit: '',
        isActive: true
    });

    const fetchDiscounts = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const response = await fetch(
                `https://be-qlda.onrender.com/api/discounts?page=${currentPage}&limit=20`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            const result = await response.json();

            if (result.success) {
                setDiscounts(result.data.discounts);
                setTotalPages(result.data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Error fetching discounts:', error);
            alert('Lỗi khi tải danh sách mã giảm giá');
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    useEffect(() => {
        fetchDiscounts();
    }, [fetchDiscounts]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');
            const url = editingDiscount
                ? `https://be-qlda.onrender.com/api/discounts/${editingDiscount.id}`
                : 'https://be-qlda.onrender.com/api/discounts';

            const method = editingDiscount ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                alert(result.message);
                setShowModal(false);
                resetForm();
                fetchDiscounts();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error saving discount:', error);
            alert('Lỗi khi lưu mã giảm giá');
        }
    };

    const handleEdit = (discount) => {
        setEditingDiscount(discount);
        setFormData({
            code: discount.code,
            description: discount.description || '',
            type: discount.type,
            value: discount.value,
            minOrderAmount: discount.minOrderAmount || '',
            maxDiscount: discount.maxDiscount || '',
            startDate: discount.startDate?.split('T')[0] || '',
            endDate: discount.endDate?.split('T')[0] || '',
            usageLimit: discount.usageLimit || '',
            isActive: discount.isActive
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa mã giảm giá này?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://be-qlda.onrender.com/api/discounts/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const result = await response.json();

            if (result.success) {
                alert('Xóa mã giảm giá thành công');
                fetchDiscounts();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error deleting discount:', error);
            alert('Lỗi khi xóa mã giảm giá');
        }
    };

    const toggleActive = async (discount) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://be-qlda.onrender.com/api/discounts/${discount.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isActive: !discount.isActive })
            });

            const result = await response.json();

            if (result.success) {
                fetchDiscounts();
            }
        } catch (error) {
            console.error('Error toggling active:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            description: '',
            type: 'percent',
            value: '',
            minOrderAmount: '',
            maxDiscount: '',
            startDate: '',
            endDate: '',
            usageLimit: '',
            isActive: true
        });
        setEditingDiscount(null);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const getDiscountText = (discount) => {
        if (discount.type === 'percent') {
            return `${discount.value}%`;
        }
        return formatCurrency(discount.value);
    };

    const isExpired = (endDate) => {
        return new Date(endDate) < new Date();
    };

    const isUpcoming = (startDate) => {
        return new Date(startDate) > new Date();
    };

    return (
        <AdminLayout>
            <div className="discount-management-page">
                <div className="page-header">
                    <h1>Quản Lý Mã Giảm Giá</h1>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="btn-create"
                    >
                        ➕ Tạo Mã Giảm Giá
                    </button>
                </div>

                {loading ? (
                    <div className="loading">Đang tải...</div>
                ) : (
                    <>
                        <div className="discounts-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Mã</th>
                                        <th>Mô Tả</th>
                                        <th>Loại</th>
                                        <th>Giá Trị</th>
                                        <th>Đơn Tối Thiểu</th>
                                        <th>Thời Gian</th>
                                        <th>Sử Dụng</th>
                                        <th>Trạng Thái</th>
                                        <th>Thao Tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {discounts.map((discount) => (
                                        <tr key={discount.id} className={!discount.isActive ? 'inactive' : ''}>
                                            <td className="code-cell">
                                                <strong>{discount.code}</strong>
                                            </td>
                                            <td>{discount.description || '-'}</td>
                                            <td>
                                                <span className={`type-badge ${discount.type}`}>
                                                    {discount.type === 'percent' ? '% Phần trăm' : '₫ Số tiền'}
                                                </span>
                                            </td>
                                            <td className="value-cell">{getDiscountText(discount)}</td>
                                            <td>{formatCurrency(discount.minOrderAmount)}</td>
                                            <td className="date-cell">
                                                <div>{formatDate(discount.startDate)}</div>
                                                <div>→ {formatDate(discount.endDate)}</div>
                                                {isExpired(discount.endDate) && (
                                                    <span className="badge expired">Hết hạn</span>
                                                )}
                                                {isUpcoming(discount.startDate) && (
                                                    <span className="badge upcoming">Sắp diễn ra</span>
                                                )}
                                            </td>
                                            <td className="usage-cell">
                                                {discount.usedCount} / {discount.usageLimit || '∞'}
                                            </td>
                                            <td>
                                                <label className="switch">
                                                    <input
                                                        type="checkbox"
                                                        checked={discount.isActive}
                                                        onChange={() => toggleActive(discount)}
                                                    />
                                                    <span className="slider"></span>
                                                </label>
                                            </td>
                                            <td className="action-cell">
                                                <button
                                                    onClick={() => handleEdit(discount)}
                                                    className="btn-edit"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(discount.id)}
                                                    className="btn-delete"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {discounts.length === 0 && (
                                <div className="empty-state">
                                    <p>Chưa có mã giảm giá nào</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    « Trước
                                </button>
                                <span>Trang {currentPage} / {totalPages}</span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Sau »
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Create/Edit Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>{editingDiscount ? 'Cập Nhật Mã Giảm Giá' : 'Tạo Mã Giảm Giá Mới'}</h2>
                                <button onClick={() => setShowModal(false)} className="btn-close">✕</button>
                            </div>

                            <form onSubmit={handleSubmit} className="discount-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Mã Giảm Giá *</label>
                                        <input
                                            type="text"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            placeholder="VD: SUMMER2024"
                                            required
                                            disabled={editingDiscount}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Loại Giảm Giá *</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            disabled={editingDiscount}
                                        >
                                            <option value="percent">Phần trăm (%)</option>
                                            <option value="amount">Số tiền cố định (₫)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Mô Tả</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Mô tả về mã giảm giá..."
                                        rows={3}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Giá Trị Giảm *</label>
                                        <input
                                            type="number"
                                            value={formData.value}
                                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                            placeholder={formData.type === 'percent' ? '0-100' : '50000'}
                                            required
                                            min="0"
                                            max={formData.type === 'percent' ? '100' : undefined}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Đơn Hàng Tối Thiểu</label>
                                        <input
                                            type="number"
                                            value={formData.minOrderAmount}
                                            onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>

                                    {formData.type === 'percent' && (
                                        <div className="form-group">
                                            <label>Giảm Tối Đa</label>
                                            <input
                                                type="number"
                                                value={formData.maxDiscount}
                                                onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                                                placeholder="100000"
                                                min="0"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Ngày Bắt Đầu *</label>
                                        <input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Ngày Kết Thúc *</label>
                                        <input
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Giới Hạn Sử Dụng</label>
                                        <input
                                            type="number"
                                            value={formData.usageLimit}
                                            onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                            placeholder="Không giới hạn"
                                            min="0"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={formData.isActive}
                                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            />
                                            Kích hoạt ngay
                                        </label>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">
                                        Hủy
                                    </button>
                                    <button type="submit" className="btn-save">
                                        {editingDiscount ? 'Cập Nhật' : 'Tạo Mới'}
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

export default DiscountManagementPage;
