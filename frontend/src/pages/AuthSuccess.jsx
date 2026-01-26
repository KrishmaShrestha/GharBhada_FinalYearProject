import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setAuth } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const userDataBase64 = params.get('user');

        if (token && userDataBase64) {
            try {
                const userData = JSON.parse(atob(userDataBase64));

                // Use the setAuth function from context to update state and localStorage
                setAuth(token, userData);

                // Redirect based on completion status and role
                if (userData.role === 'admin') {
                    navigate('/admin/dashboard');
                } else if (!userData.is_profile_complete) {
                    navigate('/complete-profile');
                } else if (userData.role === 'owner') {
                    navigate('/owner/dashboard');
                } else {
                    navigate('/tenant/dashboard');
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
                navigate('/login?error=auth_error');
            }
        } else {
            navigate('/login?error=missing_params');
        }
    }, [location, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold">Authenticating...</h2>
                <p className="text-gray-500">Please wait while we complete the login process.</p>
            </div>
        </div>
    );
};

export default AuthSuccess;
