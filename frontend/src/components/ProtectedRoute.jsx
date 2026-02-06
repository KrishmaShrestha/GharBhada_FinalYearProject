import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
    const { user, loading } = useAuth();

    console.log('[DEBUG] ProtectedRoute - user:', user);
    console.log('[DEBUG] ProtectedRoute - required role:', role);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (!user) {
        console.warn('[DEBUG] ProtectedRoute - No user, redirecting to /login');
        return <Navigate to="/login" replace />;
    }

    if (!user.is_profile_complete && user.role !== 'admin') {
        console.warn('[DEBUG] ProtectedRoute - Profile incomplete, redirecting to /complete-profile');
        return <Navigate to="/complete-profile" replace />;
    }

    if (role && user.role?.toLowerCase() !== role.toLowerCase()) {
        console.warn(`[DEBUG] ProtectedRoute - Role mismatch. Required: ${role}, User: ${user.role}. Redirecting to /dashboard`);
        return <Navigate to="/dashboard" replace />;
    }

    console.log('[DEBUG] ProtectedRoute - Access granted to:', children.type?.name || 'component');
    return children;
};

export default ProtectedRoute;
