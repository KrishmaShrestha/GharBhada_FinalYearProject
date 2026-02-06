import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Get auth token from localStorage
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// ==================== OWNER PROFILE ====================

export const getOwnerProfile = async () => {
    try {
        const response = await axios.get(`${API_URL}/owner/profile`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch profile' };
    }
};

export const updateOwnerProfile = async (profileData) => {
    try {
        const response = await axios.put(`${API_URL}/owner/profile`, profileData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to update profile' };
    }
};

export const updateBankDetails = async (bankData) => {
    try {
        const response = await axios.put(`${API_URL}/owner/bank-details`, bankData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to update bank details' };
    }
};

// ==================== DASHBOARD STATS ====================

export const getDashboardStats = async () => {
    try {
        const response = await axios.get(`${API_URL}/owner/dashboard/stats`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch dashboard stats' };
    }
};

// ==================== PROPERTIES ====================

export const getOwnerProperties = async (filters = {}) => {
    try {
        const response = await axios.get(`${API_URL}/owner/properties`, {
            headers: getAuthHeader(),
            params: filters
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch properties' };
    }
};

export const addProperty = async (propertyData, images) => {
    try {
        const formData = new FormData();

        // Append all field data
        Object.keys(propertyData).forEach(key => {
            if (key === 'amenities') {
                formData.append(key, JSON.stringify(propertyData[key]));
            } else {
                formData.append(key, propertyData[key]);
            }
        });

        // Append images using the field name expected by backend: 'propertyImages'
        if (images && images.length > 0) {
            images.forEach(image => {
                formData.append('propertyImages', image);
            });
        }

        const response = await axios.post(`${API_URL}/properties`, formData, {
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to add property' };
    }
};

export const updateProperty = async (propertyId, propertyData) => {
    try {
        const response = await axios.put(`${API_URL}/properties/${propertyId}`, propertyData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to update property' };
    }
};

export const deleteProperty = async (propertyId) => {
    try {
        const response = await axios.delete(`${API_URL}/properties/${propertyId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to delete property' };
    }
};

export const uploadPropertyImages = async (propertyId, images) => {
    try {
        const formData = new FormData();
        images.forEach((image) => {
            formData.append('propertyImages', image);
        });

        const response = await axios.post(`${API_URL}/properties/${propertyId}/images`, formData, {
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to upload images' };
    }
};

export const setPropertyUtilities = async (propertyId, utilities) => {
    try {
        const response = await axios.put(`${API_URL}/properties/${propertyId}/utilities`, utilities, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to set utilities' };
    }
};

// ==================== BOOKING REQUESTS ====================

export const getBookingRequests = async (status = 'all') => {
    try {
        const response = await axios.get(`${API_URL}/owner/booking-requests`, {
            headers: getAuthHeader(),
            params: { status }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch booking requests' };
    }
};

export const getBookingRequestDetails = async (requestId) => {
    try {
        const response = await axios.get(`${API_URL}/owner/booking-requests/${requestId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch request details' };
    }
};

export const acceptBookingRequest = async (requestId) => {
    try {
        const response = await axios.put(`${API_URL}/bookings/${requestId}/status`,
            { status: 'accepted' },
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to accept booking' };
    }
};

export const rejectBookingRequest = async (requestId, reason) => {
    try {
        const response = await axios.put(`${API_URL}/bookings/${requestId}/status`,
            { status: 'rejected', reason },
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to reject booking' };
    }
};

export const approveLeaseDuration = async (requestId, approved) => {
    try {
        // If approved, we move to 'duration_approved' status so the owner can create agreement
        const response = await axios.put(`${API_URL}/bookings/${requestId}/status`,
            { status: approved ? 'duration_approved' : 'rejected' },
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to approve duration' };
    }
};

export const createAgreement = async (bookingId, agreementData) => {
    try {
        const response = await axios.post(`${API_URL}/bookings/${bookingId}/agreement`,
            agreementData,
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to create agreement' };
    }
};

// ==================== RENTAL AGREEMENTS ====================

export const getAgreements = async (status = 'all') => {
    try {
        const response = await axios.get(`${API_URL}/owner/agreements`, {
            headers: getAuthHeader(),
            params: { status }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch agreements' };
    }
};

export const getAgreementDetails = async (agreementId) => {
    try {
        const response = await axios.get(`${API_URL}/owner/agreements/${agreementId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch agreement details' };
    }
};

export const updateAgreementStatus = async (agreementId, status) => {
    try {
        const response = await axios.put(`${API_URL}/agreements/${agreementId}/status`,
            { status },
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to update agreement status' };
    }
};

export const signAgreement = async (agreementId) => {
    try {
        const response = await axios.post(`${API_URL}/owner/agreements/${agreementId}/sign`, {}, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to sign agreement' };
    }
};

export const downloadAgreementPDF = async (agreementId) => {
    try {
        const response = await axios.get(`${API_URL}/owner/agreements/${agreementId}/pdf`, {
            headers: getAuthHeader(),
            responseType: 'blob'
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to download PDF' };
    }
};

// ==================== PAYMENTS ====================

export const getPaymentHistory = async (filters = {}) => {
    try {
        const response = await axios.get(`${API_URL}/owner/payments`, {
            headers: getAuthHeader(),
            params: filters
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch payment history' };
    }
};

export const getPaymentSummary = async (period = 'month') => {
    try {
        const response = await axios.get(`${API_URL}/owner/payments/summary`, {
            headers: getAuthHeader(),
            params: { period }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch payment summary' };
    }
};

export const recordPayment = async (paymentData) => {
    try {
        const response = await axios.post(`${API_URL}/owner/record-payment`, paymentData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to record payment' };
    }
};

// ==================== NOTIFICATIONS ====================

export const getNotifications = async (unreadOnly = false) => {
    try {
        const response = await axios.get(`${API_URL}/owner/notifications`, {
            headers: getAuthHeader(),
            params: { unread_only: unreadOnly }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch notifications' };
    }
};

export const markNotificationAsRead = async (notificationId) => {
    try {
        const response = await axios.put(`${API_URL}/owner/notifications/${notificationId}/read`, {}, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to mark notification as read' };
    }
};

export const markAllNotificationsAsRead = async () => {
    try {
        const response = await axios.put(`${API_URL}/owner/notifications/read-all`, {}, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to mark all as read' };
    }
};
