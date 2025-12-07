import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import './CategoryManagementPage.css';

const CategoryManagementPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        alias: '',
        icon: ''
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3000/api/categories');
            const result = await response.json();

            if (result.success) {
                setCategories(result.data.categories);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            alert('Lỗi khi tải danh mục');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        // Validate title
        if (!formData.title.trim()) {
            alert('Vui lòng nhập tên danh mục');
            return false;
        }

        if (formData.title.length > 100) {
            alert('Tên danh mục không được quá 100 ký tự');
            return false;
        }

        // Validate alias (nếu có)
        if (formData.alias) {
            const aliasRegex = /^[a-z0-9-]+$/;
            if (!aliasRegex.test(formData.alias)) {
                alert('Alias chỉ được chứa chữ thường, số và dấu gạch ngang');
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Vui lòng đăng nhập');
            return;
        }

        try {
            const url = editingCategory
                ? `http://localhost:3000/api/categories/${editingCategory.id}`
                : 'http://localhost:3000/api/categories';

            const method = editingCategory ? 'PUT' : 'POST';

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
                setEditingCategory(null);
                setFormData({ title: '', alias: '', icon: '' });
                fetchCategories();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Lỗi khi lưu danh mục');
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            title: category.title,
            alias: category.alias || '',
            icon: category.icon || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (categoryId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Vui lòng đăng nhập');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/categories/${categoryId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (result.success) {
                alert(result.message);
                fetchCategories();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Lỗi khi xóa danh mục');
        }
    };

    const handleAddNew = () => {
        setEditingCategory(null);
        setFormData({ title: '', alias: '', icon: '' });
        setShowModal(true);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AdminLayout>
            <div className="category-management-page">
                <div className="container">
                    <div className="page-header">
                        <h1>Quản Lý Danh Mục</h1>
                        <button onClick={handleAddNew} className="btn-add-new">
                            + Thêm Danh Mục Mới
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading">Đang tải...</div>
                    ) : (
                        <div className="categories-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Icon</th>
                                        <th>Tên Danh Mục</th>
                                        <th>Alias</th>
                                        <th>Ngày Tạo</th>
                                        <th>Cập Nhật</th>
                                        <th>Thao Tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((category) => (
                                        <tr key={category.id}>
                                            <td>{category.id}</td>
                                            <td className="icon-cell">{category.icon || '-'}</td>
                                            <td>{category.title}</td>
                                            <td className="alias-cell">{category.alias || '-'}</td>
                                            <td>{formatDate(category.createdAt)}</td>
                                            <td>{formatDate(category.updatedAt)}</td>
                                            <td className="action-cell">
                                                <button
                                                    onClick={() => handleEdit(category)}
                                                    className="btn-edit"
                                                >
                                                    ✏️ Sửa
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category.id)}
                                                    className="btn-delete"
                                                >
                                                    🗑️ Xóa
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {categories.length === 0 && (
                                <div className="empty-state">
                                    <p>Chưa có danh mục nào</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Modal Form */}
                    {showModal && (
                        <div className="modal-overlay" onClick={() => setShowModal(false)}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h2>{editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}</h2>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="btn-close"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label>Tên Danh Mục <span className="required">*</span></label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="Nhập tên danh mục"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Alias (SEO)</label>
                                        <input
                                            type="text"
                                            value={formData.alias}
                                            onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                                            placeholder="vd: ao-thun"
                                        />
                                        <small>Để trống để tự động tạo từ tên danh mục</small>
                                    </div>

                                    <div className="form-group">
                                        <label>Icon</label>
                                        <input
                                            type="text"
                                            value={formData.icon}
                                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                            placeholder="Nhập emoji hoặc class icon"
                                        />
                                        <small>Ví dụ: 👕, 👖, 👟</small>
                                    </div>

                                    <div className="form-actions">
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="btn-cancel"
                                        >
                                            Hủy
                                        </button>
                                        <button type="submit" className="btn-submit">
                                            {editingCategory ? 'Cập Nhật' : 'Tạo Mới'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default CategoryManagementPage;
