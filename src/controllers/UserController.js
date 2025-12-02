// Controller - Kết nối Model và View, xử lý logic
import { useState, useCallback } from 'react';
import UserModel from '../models/UserModel';
import apiService from '../services/apiService';

const useUserController = () => {
    const [model] = useState(() => new UserModel());
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load danh sách users
    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            model.setLoading(true);

            const data = await apiService.getUsers();

            model.setUsers(data);
            setUsers(data);
            model.setLoading(false);
            setLoading(false);
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Không thể tải danh sách người dùng';
            model.setError(errorMsg);
            setError(errorMsg);
            setLoading(false);
            model.setLoading(false);
        }
    }, [model]);

    // Thêm user mới
    const addUser = useCallback(async (name) => {
        try {
            setError(null);

            // Validate dữ liệu
            model.validateUser(name);

            // Gọi API
            const newUser = await apiService.addUser({ name: name.trim() });

            // Cập nhật model
            model.addUser(newUser);

            // Reload danh sách
            await loadUsers();

            return true;
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Không thể thêm người dùng';
            model.setError(errorMsg);
            setError(errorMsg);
            return false;
        }
    }, [model, loadUsers]);

    return {
        users,
        loading,
        error,
        loadUsers,
        addUser
    };
};

export default useUserController;
