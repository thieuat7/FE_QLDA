// Model - Quản lý state và business logic của User
class UserModel {
    constructor() {
        this.users = [];
        this.loading = false;
        this.error = null;
    }

    // Cập nhật danh sách users
    setUsers(users) {
        this.users = users;
    }

    // Thêm user mới vào danh sách
    addUser(user) {
        this.users.push(user);
    }

    // Lấy tất cả users
    getUsers() {
        return this.users;
    }

    // Set trạng thái loading
    setLoading(loading) {
        this.loading = loading;
    }

    // Set lỗi
    setError(error) {
        this.error = error;
    }

    // Validate dữ liệu user
    validateUser(name) {
        if (!name || name.trim() === '') {
            throw new Error('Tên người dùng không được để trống');
        }
        return true;
    }
}

export default UserModel;
