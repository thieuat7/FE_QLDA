// App Component - Container chính
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
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
import './App.css';

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

                        {/* Protected routes - Home */}
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <HomePage />
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

                        {/* Redirect unknown routes */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;