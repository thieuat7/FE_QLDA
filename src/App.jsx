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

                        {/* Redirect unknown routes */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;