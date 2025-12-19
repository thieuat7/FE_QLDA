// App Component - Container chính
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import RequireAdmin from './components/RequireAdmin';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GoogleCallbackPage from './pages/GoogleCallbackPage';
import FacebookCallbackPage from './pages/FacebookCallbackPage';
import ProfilePage from './pages/ProfilePage';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import VNPayReturnPage from './pages/VNPayReturnPage';
import MomoReturnPage from './pages/MomoReturnPage';
import BankTransferPage from './pages/BankTransferPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrderFailedPage from './pages/OrderFailedPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import CategoryManagementPage from './pages/admin/CategoryManagementPage';
import ProductManagementPage from './pages/admin/ProductManagementPage';
import OrderManagementPage from './pages/admin/OrderManagementPage';
import DiscountManagementPage from './pages/admin/DiscountManagementPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import './App.css';
import AdminPaymentHistoryPage from './pages/admin/AdminPaymentHistoryPage';
import PaymentHistoryPage from './pages/PaymentHistoryPage';
import TinTucPage from './pages/TinTucPage';

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <Router>
                    <Routes>
                        {/* Public routes */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/auth/google/success" element={<GoogleCallbackPage />} />
                        <Route path="/auth/facebook/success" element={<FacebookCallbackPage />} />

                        {/* Protected routes - Profile */}
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <ProfilePage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/payment-history"
                            element={
                                <ProtectedRoute>
                                    <RequireAdmin>
                                        <AdminPaymentHistoryPage />
                                    </RequireAdmin>
                                </ProtectedRoute>
                            }
                        />

                        {/* Protected routes - Home */}
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <HomePage />
                                </ProtectedRoute>
                            }
                        />

                        {/* News page - Tin Tức */}
                        <Route
                            path="/tin-tuc"
                            element={
                                <ProtectedRoute>
                                    <TinTucPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Protected routes - Product Detail */}
                        <Route
                            path="/product/:id"
                            element={
                                <ProtectedRoute>
                                    <ProductDetailPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Protected routes - Cart */}
                        <Route
                            path="/cart"
                            element={
                                <ProtectedRoute>
                                    <CartPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Protected routes - Checkout */}
                        <Route
                            path="/checkout"
                            element={
                                <ProtectedRoute>
                                    <CheckoutPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Protected routes - VNPay Return */}
                        <Route
                            path="/vnpay-return"
                            element={
                                <ProtectedRoute>
                                    <VNPayReturnPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Protected routes - Momo Return */}
                        <Route
                            path="/momo-return"
                            element={
                                <ProtectedRoute>
                                    <MomoReturnPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Protected routes - Bank Transfer */}
                        <Route
                            path="/bank-transfer"
                            element={
                                <ProtectedRoute>
                                    <BankTransferPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Protected routes - Order Success */}
                        <Route
                            path="/order-success"
                            element={
                                <ProtectedRoute>
                                    <OrderSuccessPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Protected routes - Order Failed */}
                        <Route
                            path="/order-failed"
                            element={
                                <ProtectedRoute>
                                    <OrderFailedPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Protected routes - Orders List */}
                        <Route
                            path="/orders"
                            element={
                                <ProtectedRoute>
                                    <OrdersPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Protected routes - Order Detail */}
                        <Route
                            path="/orders/:id"
                            element={
                                <ProtectedRoute>
                                    <OrderDetailPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/payment-history"
                            element={
                                <ProtectedRoute>
                                    <PaymentHistoryPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Admin routes - Category Management */}
                        <Route
                            path="/admin/dashboard"
                            element={
                                <ProtectedRoute>
                                    <RequireAdmin>
                                        <AdminDashboardPage />
                                    </RequireAdmin>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/admin/categories"
                            element={
                                <ProtectedRoute>
                                    <RequireAdmin>
                                        <CategoryManagementPage />
                                    </RequireAdmin>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/admin/products"
                            element={
                                <ProtectedRoute>
                                    <RequireAdmin>
                                        <ProductManagementPage />
                                    </RequireAdmin>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/admin/orders"
                            element={
                                <ProtectedRoute>
                                    <RequireAdmin>
                                        <OrderManagementPage />
                                    </RequireAdmin>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/admin/discounts"
                            element={
                                <ProtectedRoute>
                                    <RequireAdmin>
                                        <DiscountManagementPage />
                                    </RequireAdmin>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/admin/users"
                            element={
                                <ProtectedRoute>
                                    <RequireAdmin>
                                        <UserManagementPage />
                                    </RequireAdmin>
                                </ProtectedRoute>
                            }
                        />

                        {/* Redirect unknown routes */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;