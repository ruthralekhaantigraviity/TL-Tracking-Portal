import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = '/api/hr';

// Helper to get token
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Add interceptor to handle 401 errors globally
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            toast.error('Session expired. Please log in again.');
            // Let the app re-render and redirect to login
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

export const login = async (username, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, { username, password });
        return response.data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const register = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/register`, userData);
        return response.data;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

export const fetchTeams = async () => {
    try {
        const response = await axios.get(`${API_URL}/teams`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching teams:', error);
        throw error;
    }
};

export const fetchMembers = async (team) => {
    try {
        const response = await axios.get(API_URL, { 
            params: { team },
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching members:', error);
        throw error;
    }
};

export const fetchMemberById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching member:', error);
        throw error;
    }
};

export const seedData = async () => {
    try {
        // Seed users first
        await axios.post(`${API_URL}/seed-users`);
        const response = await axios.post(`${API_URL}/seed`);
        return response.data;
    } catch (error) {
        console.error('Error seeding data:', error);
        throw error;
    }
};

export const updateMember = async (id, data) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, data, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error updating member:', error);
        throw error;
    }
};

export const createMember = async (data) => {
    try {
        const response = await axios.post(API_URL, data, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error creating member:', error);
        throw error;
    }
};

export const deleteMember = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting member:', error);
        throw error;
    }
};

export const deleteTeam = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/teams/${id}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting team:', error);
        throw error;
    }
};
