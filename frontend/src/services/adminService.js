import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Get auth token from localStorage
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// ==================== USER MANAGEMENT ====================

export const getAllUsers = async (filters = {}) => {
    try {
        const response = await axios.get(`${API_URL}/admin/users`, {
            headers: getAuthHeader(),
            params: filters
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch users' };
    }
};

export const getUserDetails = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/admin/users/${userId}/details`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch user details' };
    }
};

export const suspendUser = async (userId, reason) => {
    try {
        const response = await axios.put(
            `${API_URL}/admin/users/${userId}/suspend`,
            { reason },
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to suspend user' };
    }
};

export const activateUser = async (userId) => {
    try {
        const response = await axios.put(
            `${API_URL}/admin/users/${userId}/activate`,
            {},
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to activate user' };
    }
};

export const updateTrustLevel = async (userId, trustLevel) => {
    try {
        const response = await axios.put(
            `${API_URL}/admin/users/${userId}/trust-level`,
            { trust_level: trustLevel },
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to update trust level' };
    }
};

// ==================== PROPERTY MANAGEMENT ====================

export const getAllProperties = async (filters = {}) => {
    try {
        const response = await axios.get(`${API_URL}/admin/properties`, {
            headers: getAuthHeader(),
            params: filters
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch properties' };
    }
};

export const getPendingProperties = async () => {
    try {
        const response = await axios.get(`${API_URL}/admin/properties/pending`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch pending properties' };
    }
};

export const approveProperty = async (propertyId, notes = '') => {
    try {
        const response = await axios.put(
            `${API_URL}/admin/properties/${propertyId}/approve`,
            { notes },
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to approve property' };
    }
};

export const rejectProperty = async (propertyId, reason) => {
    try {
        const response = await axios.put(
            `${API_URL}/admin/properties/${propertyId}/reject`,
            { reason },
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to reject property' };
    }
};

export const deactivateProperty = async (propertyId, reason) => {
    try {
        const response = await axios.delete(
            `${API_URL}/admin/properties/${propertyId}/deactivate`,
            {
                headers: getAuthHeader(),
                data: { reason }
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to deactivate property' };
    }
};

// ==================== DASHBOARD & STATS ====================

export const getDashboardStats = async () => {
    try {
        const response = await axios.get(`${API_URL}/admin/dashboard/stats`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch dashboard statistics' };
    }
};

// ==================== LEGACY FUNCTIONS (keep for compatibility) ====================

export const getPendingUsers = async () => {
    try {
        const response = await axios.get(`${API_URL}/users/pending`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch pending users' };
    }
};

export const getUserStats = async () => {
    try {
        const response = await axios.get(`${API_URL}/users/stats`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch statistics' };
    }
};

export const approveUser = async (userId) => {
    try {
        const response = await axios.put(
            `${API_URL}/users/${userId}/approve`,
            {},
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to approve user' };
    }
};

export const rejectUser = async (userId) => {
    try {
        const response = await axios.put(
            `${API_URL}/users/${userId}/reject`,
            {},
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to reject user' };
    }
};
