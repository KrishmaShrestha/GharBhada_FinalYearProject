import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to role-specific dashboard
        if (user) {
            const role = user.role?.toLowerCase();
            console.log('[DEBUG] Dashboard Page - user role:', role);

            if (role === 'admin') {
                console.log('[DEBUG] Dashboard Page - Redirecting to /admin/dashboard');
                navigate('/admin/dashboard', { replace: true });
            } else if (role === 'owner') {
                console.log('[DEBUG] Dashboard Page - Redirecting to /owner/dashboard');
                navigate('/owner/dashboard', { replace: true });
            } else if (role === 'tenant') {
                console.log('[DEBUG] Dashboard Page - Redirecting to /tenant/dashboard');
                navigate('/tenant/dashboard', { replace: true });
            } else {
                console.warn('[DEBUG] Dashboard Page - Unknown role:', role);
            }
        } else {
            console.warn('[DEBUG] Dashboard Page - No user in state');
        }
    }, [user, navigate]);

    return (
        <div className="container mx-auto px-4 py-8">
            <p>Redirecting...</p>
        </div>
    );
};

export default Dashboard;
