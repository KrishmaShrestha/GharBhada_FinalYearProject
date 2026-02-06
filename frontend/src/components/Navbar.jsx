import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './common/NotificationBell';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-white shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="text-2xl font-bold text-primary-500">
                        GharBhada
                    </Link>

                    <div className="hidden md:flex space-x-6">
                        <Link to="/" className="text-gray-700 hover:text-primary-500">
                            Home
                        </Link>
                        <Link to="/properties" className="text-gray-700 hover:text-primary-500">
                            Properties
                        </Link>
                        {user && (
                            <Link to="/dashboard" className="text-gray-700 hover:text-primary-500">
                                Dashboard
                            </Link>
                        )}
                    </div>

                    <div className="flex items-center space-x-6">
                        {user ? (
                            <>
                                <NotificationBell />
                                <span className="hidden sm:inline-block text-sm font-black text-gray-900 uppercase tracking-tighter">Hello, {user.full_name}</span>
                                <button
                                    onClick={logout}
                                    className="btn-secondary"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-700 hover:text-primary-500">
                                    Login
                                </Link>
                                <Link to="/register" className="btn-primary">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
