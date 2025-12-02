// View Component - Hiển thị UI cho User Management
import { useState, useEffect } from 'react';
import './UserView.css';

const UserView = ({ users, loading, error, onAddUser, onLoadUsers }) => {
    const [userName, setUserName] = useState('');

    useEffect(() => {
        // Tự động load users khi component mount
        onLoadUsers();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (userName.trim()) {
            onAddUser(userName);
            setUserName('');
        }
    };

    return (
        <div className="user-view-container">
            <h1>🛍️ Quản lý người dùng</h1>

            {/* Form thêm user */}
            <div className="form-section">
                <h2>Thêm người dùng mới</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Nhập tên người dùng"
                        className="input-field"
                    />
                    <button type="submit" className="btn btn-primary">
                        ➕ Thêm
                    </button>
                </form>
            </div>

            {/* Danh sách users */}
            <div className="users-section">
                <div className="section-header">
                    <h2>Danh sách người dùng</h2>
                    <button onClick={onLoadUsers} className="btn btn-secondary">
                        🔄 Tải lại
                    </button>
                </div>

                {error && (
                    <div className="alert alert-error">
                        ❌ {error}
                    </div>
                )}

                {loading ? (
                    <div className="loading">
                        <div className="spinner"></div>
                        <p>Đang tải...</p>
                    </div>
                ) : (
                    <div className="users-list">
                        {users.length === 0 ? (
                            <p className="empty-message">Chưa có người dùng nào</p>
                        ) : (
                            users.map((user) => (
                                <div key={user.id} className="user-card">
                                    <div className="user-id">#{user.id}</div>
                                    <div className="user-name">{user.name}</div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserView;
