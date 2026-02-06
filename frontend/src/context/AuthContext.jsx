import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);

            return { success: true, user };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed',
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post('/auth/register', userData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Don't auto-login after register as they need admin approval
            return { success: true, message: response.data.message };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed',
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const completeProfile = async (formData) => {
        try {
            const response = await api.post('/auth/complete-profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Update local user state
            const updatedUser = {
                ...user,
                is_profile_complete: true,
                approval_status: 'pending'
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            return { success: true, message: response.data.message };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to complete profile'
            };
        }
    };

    const refreshUser = async () => {
        try {
            const response = await api.get('/auth/me');
            if (response.data.success) {
                const updatedUser = response.data.user;
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
            }
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    };

    const updateProfile = async (formData) => {
        try {
            const response = await api.put('/users/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.success) {
                await refreshUser();
                return { success: true, message: response.data.message };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update profile'
            };
        }
    };

    const setAuth = (token, user) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
    };

    const value = {
        user,
        loading,
        login,
        register,
        setAuth,
        completeProfile,
        refreshUser,
        updateProfile,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
