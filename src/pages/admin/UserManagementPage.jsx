import { useState, useEffect, useCallback } from 'react';
import apiService from '../../services/apiService';
import AdminLayout from '../../components/AdminLayout';
import './UserManagementPage.css';

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0,
        limit: 10
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all'); // all, admin, customer
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editFormData, setEditFormData] = useState({
        userName: '',
        email: '',
        fullName: '',
        phone: '',
        role: 'customer'
    });
    const [addFormData, setAddFormData] = useState({
        userName: '',
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        phone: '',
        role: 'customer'
    });

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const result = await apiService.getUsers(pagination.currentPage, pagination.limit);

            if (result.success) {
                setUsers(result.data.users);
                setPagination(result.data.pagination);
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('Lỗi khi tải danh sách users');
        } finally {
            setLoading(false);
        }
    }, [pagination.currentPage, pagination.limit]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleAddUser = () => {
        setAddFormData({
            userName: '',
            email: '',
            password: '',
            confirmPassword: '',
            fullName: '',
            phone: '',
            role: 'customer'
        });
        setShowAddModal(true);
    };

    const handleSaveAdd = async (e) => {
        e.preventDefault();

        // Validation
        if (!addFormData.userName || !addFormData.email || !addFormData.password) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc (Username, Email, Password)');
            return;
        }

        if (addFormData.password !== addFormData.confirmPassword) {
            alert('Mật khẩu xác nhận không khớp');
            return;
        }

        if (addFormData.password.length < 6) {
            alert('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        try {
            setLoading(true);

            // Prepare data without confirmPassword
            const dataToSend = {
                userName: addFormData.userName,
                email: addFormData.email,
                password: addFormData.password,
                fullName: addFormData.fullName,
                phone: addFormData.phone,
                role: addFormData.role
            };

            // Use POST /api/users to create new user
            const result = await apiService.addUser(dataToSend);

            if (result.success) {
                alert('Thêm user mới thành công!');
                setShowAddModal(false);
                fetchUsers(); // Refresh list
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error adding user:', error);
            alert(error.response?.data?.message || 'Lỗi khi thêm user');
        } finally {
            setLoading(false);
        }
    }; const handleEditUser = async (user) => {
        setEditingUser(user);
        setEditFormData({
            userName: user.userName,
            email: user.email,
            fullName: user.fullName || '',
            phone: user.phone || '',
            role: user.role
        });
        setShowEditModal(true);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            // Debug: Log data being sent
            console.log('🔍 Editing user data:', {
                userId: editingUser.id,
                data: editFormData
            });

            const result = await apiService.updateUser(editingUser.id, editFormData);

            if (result.success) {
                alert('Cập nhật user thành công!');
                setShowEditModal(false);
                setEditingUser(null);
                fetchUsers(); // Refresh list
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error updating user:', error);
            alert(error.response?.data?.message || 'Lỗi khi cập nhật user');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa user "${userName}"?\n\nLưu ý: Thao tác này không thể hoàn tác!`)) {
            return;
        }

        try {
            const result = await apiService.deleteUser(userId);

            if (result.success) {
                alert('Xóa user thành công!');
                fetchUsers(); // Refresh list
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Lỗi khi xóa user');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Filter users based on search and role
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            (user.userName && user.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.phone && user.phone.includes(searchTerm));

        const matchesRole = filterRole === 'all' || user.role === filterRole;

        return matchesSearch && matchesRole;
    });

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, currentPage: newPage }));
    };

    const handleLimitChange = (e) => {
        setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), currentPage: 1 }));
    };

    if (loading && users.length === 0) {
        return (
            <AdminLayout>
                <div className="loading">Đang tải danh sách users...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="user-management-page">
                <div className="page-header">
                    <h1>👥 Quản Lý Khách Hàng</h1>
                    <div className="header-actions">
                        <button onClick={handleAddUser} className="btn-add">
                            ➕ Thêm User
                        </button>
                        <button onClick={fetchUsers} className="btn-refresh">
                            🔄 Refresh
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="stats-cards">
                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-content">
                            <h3>Tổng Khách Hàng</h3>
                            <p className="stat-value">{pagination.totalUsers}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">👤</div>
                        <div className="stat-content">
                            <h3>Customers</h3>
                            <p className="stat-value">
                                {users.filter(u => u.role === 'customer').length}
                            </p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🔑</div>
                        <div className="stat-content">
                            <h3>Admins</h3>
                            <p className="stat-value">
                                {users.filter(u => u.role === 'admin').length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="filters-section">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="🔍 Tìm kiếm theo tên, email, số điện thoại..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="filter-group">
                        <label>Lọc theo Role:</label>
                        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                            <option value="all">Tất cả</option>
                            <option value="customer">Customer</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Hiển thị:</label>
                        <select value={pagination.limit} onChange={handleLimitChange}>
                            <option value="10">10 users</option>
                            <option value="20">20 users</option>
                            <option value="50">50 users</option>
                            <option value="100">100 users</option>
                        </select>
                    </div>
                </div>

                {/* Users Table */}
                <div className="table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Họ Tên</th>
                                <th>Số Điện Thoại</th>
                                <th>Role</th>
                                <th>Ngày Đăng Ký</th>
                                <th>Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="no-data">
                                        Không tìm thấy user nào
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="username-cell">
                                                <span className="username">{user.userName}</span>
                                            </div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>{user.fullName || '-'}</td>
                                        <td>{user.phone || '-'}</td>
                                        <td>
                                            <span className={`role-badge ${user.role}`}>
                                                {user.role === 'admin' ? '🔑 Admin' : '👤 Customer'}
                                            </span>
                                        </td>
                                        <td>{formatDate(user.createdAt)}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => handleEditUser(user)}
                                                    title="Chỉnh sửa user"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDeleteUser(user.id, user.userName)}
                                                    disabled={user.role === 'admin'}
                                                    title={user.role === 'admin' ? 'Không thể xóa admin' : 'Xóa user'}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="pagination">
                        <button
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1}
                            className="btn-page"
                        >
                            ← Trước
                        </button>
                        <span className="page-info">
                            Trang {pagination.currentPage} / {pagination.totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.totalPages}
                            className="btn-page"
                        >
                            Sau →
                        </button>
                    </div>
                )}

                {/* Total Count */}
                <div className="total-count">
                    Hiển thị {filteredUsers.length} / {pagination.totalUsers} users
                </div>

                {/* Edit Modal */}
                {showEditModal && editingUser && (
                    <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>✏️ Chỉnh Sửa User</h2>
                                <button className="btn-close" onClick={() => setShowEditModal(false)}>×</button>
                            </div>
                            <form onSubmit={handleSaveEdit} className="edit-form">
                                <div className="form-group">
                                    <label>Username</label>
                                    <input
                                        type="text"
                                        value={editFormData.userName}
                                        onChange={(e) => setEditFormData({ ...editFormData, userName: e.target.value })}
                                        placeholder="Nhập username"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={editFormData.email}
                                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                        placeholder="Nhập email"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Họ Tên</label>
                                    <input
                                        type="text"
                                        value={editFormData.fullName}
                                        onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                                        placeholder="Nhập họ tên"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Số Điện Thoại</label>
                                    <input
                                        type="text"
                                        value={editFormData.phone}
                                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                        placeholder="Nhập số điện thoại"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Role</label>
                                    <select
                                        value={editFormData.role}
                                        onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                                    >
                                        <option value="customer">👤 Customer</option>
                                        <option value="admin">🔑 Admin</option>
                                    </select>
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="btn-save" disabled={loading}>
                                        {loading ? 'Đang lưu...' : '💾 Lưu Thay Đổi'}
                                    </button>
                                    <button type="button" onClick={() => setShowEditModal(false)} className="btn-cancel">
                                        ❌ Hủy
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Add User Modal */}
                {showAddModal && (
                    <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>➕ Thêm User Mới</h2>
                                <button className="btn-close" onClick={() => setShowAddModal(false)}>×</button>
                            </div>
                            <form onSubmit={handleSaveAdd} className="edit-form">
                                <div className="form-group">
                                    <label>Username *</label>
                                    <input
                                        type="text"
                                        value={addFormData.userName}
                                        onChange={(e) => setAddFormData({ ...addFormData, userName: e.target.value })}
                                        placeholder="Nhập username"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        value={addFormData.email}
                                        onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                                        placeholder="Nhập email"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Mật khẩu * (Tối thiểu 6 ký tự)</label>
                                    <input
                                        type="password"
                                        value={addFormData.password}
                                        onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })}
                                        placeholder="Nhập mật khẩu"
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Xác nhận mật khẩu *</label>
                                    <input
                                        type="password"
                                        value={addFormData.confirmPassword}
                                        onChange={(e) => setAddFormData({ ...addFormData, confirmPassword: e.target.value })}
                                        placeholder="Nhập lại mật khẩu"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Họ Tên</label>
                                    <input
                                        type="text"
                                        value={addFormData.fullName}
                                        onChange={(e) => setAddFormData({ ...addFormData, fullName: e.target.value })}
                                        placeholder="Nhập họ tên"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Số Điện Thoại</label>
                                    <input
                                        type="text"
                                        value={addFormData.phone}
                                        onChange={(e) => setAddFormData({ ...addFormData, phone: e.target.value })}
                                        placeholder="Nhập số điện thoại"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Role</label>
                                    <select
                                        value={addFormData.role}
                                        onChange={(e) => setAddFormData({ ...addFormData, role: e.target.value })}
                                    >
                                        <option value="customer">👤 Customer</option>
                                        <option value="admin">🔑 Admin</option>
                                    </select>
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="btn-save" disabled={loading}>
                                        {loading ? 'Đang thêm...' : '➕ Thêm User'}
                                    </button>
                                    <button type="button" onClick={() => setShowAddModal(false)} className="btn-cancel">
                                        ❌ Hủy
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

export default UserManagementPage;
