// App Component - Container chính
import UserView from './views/UserView';
import useUserController from './controllers/UserController';
import './App.css';

function App() {
    const { users, loading, error, loadUsers, addUser } = useUserController();

    return (
        <div className="App">
            <UserView
                users={users}
                loading={loading}
                error={error}
                onAddUser={addUser}
                onLoadUsers={loadUsers}
            />
        </div>
    );
}

export default App;
