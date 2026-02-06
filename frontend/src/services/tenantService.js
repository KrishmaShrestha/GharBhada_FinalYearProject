import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// ==================== PROPERTY SEARCH ====================
export const searchProperties = async (filters = {}) => {
    try {
        const response = await axios.get(`${API_URL}/properties`, {
            headers: getAuthHeader(),
            params: filters
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to search properties' };
    }
};

export const getPropertyDetails = async (propertyId) => {
    try {
        const response = await axios.get(`${API_URL}/properties/${propertyId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch property details' };
    }
};

// ==================== BOOKINGS ====================
export const submitBookingRequest = async (bookingData) => {
    try {
        const response = await axios.post(`${API_URL}/bookings`, bookingData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to submit booking request' };
    }
};

export const getMyBookings = async () => {
    try {
        const response = await axios.get(`${API_URL}/bookings`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch bookings' };
    }
};

export const updateBookingDuration = async (bookingId, durationData) => {
    try {
        const response = await axios.put(`${API_URL}/bookings/${bookingId}/duration`, durationData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to update duration' };
    }
};

// ==================== AGREEMENTS ====================
export const getMyAgreements = async () => {
    try {
        const response = await axios.get(`${API_URL}/agreements`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch agreements' };
    }
};

export const respondToAgreement = async (agreementId, status) => {
    try {
        const response = await axios.put(`${API_URL}/agreements/${agreementId}/respond`, { status }, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to respond to agreement' };
    }
};

// ==================== PAYMENTS ====================
export const getMyPayments = async () => {
    try {
        const response = await axios.get(`${API_URL}/payments`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch payments' };
    }
};

export const payDeposit = async (bookingId, paymentData) => {
    try {
        const response = await axios.post(`${API_URL}/bookings/${bookingId}/deposit`, paymentData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to pay deposit' };
    }
};

export const payMonthlyRent = async (paymentId, paymentData) => {
    try {
        const response = await axios.post(`${API_URL}/payments/${paymentId}/pay`, paymentData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to pay rent' };
    }
};

// ==================== NOTIFICATIONS ====================
export const getNotifications = async () => {
    try {
        const response = await axios.get(`${API_URL}/notifications`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch notifications' };
    }
};
// ==================== USER PROFILE ====================
export const updateProfile = async (formData) => {
    try {
        const response = await axios.put(`${API_URL}/users/profile`, formData, {
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to update profile' };
    }
};
