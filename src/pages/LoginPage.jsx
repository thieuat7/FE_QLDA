// Login Page
import LoginView from '../views/LoginView';
import useAuthController from '../controllers/AuthController';

const LoginPage = () => {
    const { handleLogin, loading, error } = useAuthController();

    return (
        <LoginView
            onLogin={handleLogin}
            loading={loading}
            error={error}
        />
    );
};

export default LoginPage;
