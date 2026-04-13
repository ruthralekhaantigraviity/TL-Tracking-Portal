import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = '/api/hr';

// Add interceptor to attach token to every request
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add interceptor to handle 401 errors globally
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        // Don't trigger "Session expired" for login/register attempts themselves
        const isAuthRequest = error.config && (error.config.url.endsWith('/login') || error.config.url.endsWith('/register'));
        
        if (error.response && error.response.status === 401 && !isAuthRequest) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            toast.error('Session expired. Please log in again.');
            window.location.reload();
        }

        // Detailed logging for development
        if (error.response) {
            console.error(`[API Error] ${error.config.method.toUpperCase()} ${error.config.url}: ${error.response.status} ${error.response.statusText}`);
            console.error('Data:', error.response.data);
        } else if (error.request) {
            console.error('[API Error] No response received:', error.request);
        } else {
            console.error('[API Error] Request setup failed:', error.message);
        }

        return Promise.reject(error);
    }
);

export const login = async (username, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, { username, password });
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 429) {
            throw new Error(error.response.data.message || 'Too many attempts. Please try again later.');
        }
        console.error('Login error:', error);
        if (error.response && error.response.status === 404) {
            throw new Error(`Login endpoint not found (404). Check backend connectivity at ${error.config.url}`);
        }
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
        const response = await axios.get(`${API_URL}/teams`);
        return response.data;
    } catch (error) {
        console.error('Error fetching teams:', error);
        throw error;
    }
};

export const getTeams = fetchTeams;

export const fetchMembers = async (team) => {
    try {
        const response = await axios.get(API_URL, { 
            params: { team }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching members:', error);
        throw error;
    }
};

export const fetchMemberById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
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
        const response = await axios.put(`${API_URL}/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating member:', error);
        throw error;
    }
};

export const createMember = async (data) => {
    try {
        const response = await axios.post(API_URL, data);
        return response.data;
    } catch (error) {
        console.error('Error creating member:', error);
        throw error;
    }
};

export const deleteMember = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting member:', error);
        throw error;
    }
};

export const deleteTeam = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/teams/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting team:', error);
        throw error;
    }
};
