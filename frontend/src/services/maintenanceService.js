import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getMaintenanceRequests = async () => {
    try {
        const response = await axios.get(`${API_URL}/maintenance`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch maintenance requests' };
    }
};

export const submitMaintenanceRequest = async (formData) => {
    try {
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'images') {
                formData.images.forEach(image => {
                    data.append('maintenanceImages', image);
                });
            } else {
                data.append(key, formData[key]);
            }
        });

        const response = await axios.post(`${API_URL}/maintenance`, data, {
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to submit maintenance request' };
    }
};

export const updateMaintenanceStatus = async (requestId, statusData) => {
    try {
        const response = await axios.put(`${API_URL}/maintenance/${requestId}/status`, statusData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to update maintenance status' };
    }
};
