import api from './api';

export const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
};

export const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

export const getMe = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

export const logout = async () => {
    // Optional: Call backend logout if needed, otherwise just clear client state
    // await api.post('/auth/logout');
};
