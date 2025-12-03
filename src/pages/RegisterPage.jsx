// Register Page
import RegisterView from '../views/RegisterView';
import useAuthController from '../controllers/AuthController';

const RegisterPage = () => {
    const { handleRegister, loading, error } = useAuthController();

    return (
        <RegisterView
            onRegister={handleRegister}
            loading={loading}
            error={error}
        />
    );
};

export default RegisterPage;
