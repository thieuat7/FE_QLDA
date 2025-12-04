// Cart Context - Quản lý giỏ hàng
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load cart from localStorage khi khởi động
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                setCartItems(JSON.parse(savedCart));
            }
        } catch (error) {
            console.error('Load cart error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Lưu cart vào localStorage mỗi khi có thay đổi
    useEffect(() => {
        if (!loading) {
            localStorage.setItem('cart', JSON.stringify(cartItems));
        }
    }, [cartItems, loading]);

    // Thêm sản phẩm vào giỏ hàng
    const addToCart = (product) => {
        setCartItems(prevItems => {
            // Kiểm tra sản phẩm đã có trong giỏ chưa
            const existingItem = prevItems.find(
                item => item.id === product.id &&
                    item.size === product.size &&
                    item.color === product.color
            );

            if (existingItem) {
                // Nếu có rồi thì tăng số lượng
                return prevItems.map(item =>
                    item.id === product.id &&
                        item.size === product.size &&
                        item.color === product.color
                        ? { ...item, quantity: item.quantity + product.quantity }
                        : item
                );
            } else {
                // Nếu chưa có thì thêm mới
                return [...prevItems, {
                    ...product,
                    cartId: `${product.id}-${product.size}-${product.color}-${Date.now()}`
                }];
            }
        });
    };

    // Xóa sản phẩm khỏi giỏ hàng
    const removeFromCart = (cartId) => {
        setCartItems(prevItems => prevItems.filter(item => item.cartId !== cartId));
    };

    // Cập nhật số lượng sản phẩm
    const updateQuantity = (cartId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(cartId);
            return;
        }

        setCartItems(prevItems =>
            prevItems.map(item =>
                item.cartId === cartId
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
    };

    // Xóa toàn bộ giỏ hàng
    const clearCart = () => {
        setCartItems([]);
    };

    // Tính tổng số loại sản phẩm trong giỏ hàng
    const getTotalItems = () => {
        return cartItems.length;
    };

    // Tính tổng tiền
    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => {
            const price = item.price || 0;
            return total + (price * item.quantity);
        }, 0);
    };

    // Kiểm tra sản phẩm đã có trong giỏ chưa
    const isInCart = (productId, size, color) => {
        return cartItems.some(
            item => item.id === productId &&
                item.size === size &&
                item.color === color
        );
    };

    const value = {
        cartItems,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        isInCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
