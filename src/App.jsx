// App Component - Container chính
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GoogleCallbackPage from './pages/GoogleCallbackPage';
import FacebookCallbackPage from './pages/FacebookCallbackPage';
import UpdateProfilePage from './pages/UpdateProfilePage';
import HomePage from './pages/HomePage';
import './App.css';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/auth/google/success" element={<GoogleCallbackPage />} />
                    <Route path="/auth/facebook/success" element={<FacebookCallbackPage />} />

                    {/* Protected routes - Cập nhật profile */}
                    <Route
                        path="/update-profile"
                        element={
                            <ProtectedRoute>
                                <UpdateProfilePage />
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

                    {/* Redirect unknown routes */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;