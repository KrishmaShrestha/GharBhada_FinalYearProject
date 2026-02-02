import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to role-specific dashboard
        if (user) {
            if (user.role === 'admin') {
                navigate('/admin/dashboard', { replace: true });
            } else if (user.role === 'owner') {
                navigate('/owner/dashboard', { replace: true });
            } else {
                navigate('/tenant/dashboard', { replace: true });
            }
        }
    }, [user, navigate]);

    return (
        <div className="container mx-auto px-4 py-8">
            <p>Redirecting...</p>
        </div>
    );
};

export default Dashboard;
