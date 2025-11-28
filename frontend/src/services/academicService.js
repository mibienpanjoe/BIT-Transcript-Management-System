import api from './api';

// Fields
export const getFields = async () => {
    const response = await api.get('/fields');
    return response.data;
};

export const createField = async (data) => {
    const response = await api.post('/fields', data);
    return response.data;
};

export const updateField = async (id, data) => {
    const response = await api.put(`/fields/${id}`, data);
    return response.data;
};

export const deleteField = async (id) => {
    const response = await api.delete(`/fields/${id}`);
    return response.data;
};

// Promotions
export const getPromotions = async (fieldId = null) => {
    const params = fieldId ? { fieldId } : {};
    const response = await api.get('/promotions', { params });
    return response.data;
};

export const createPromotion = async (data) => {
    const response = await api.post('/promotions', data);
    return response.data;
};

export const updatePromotion = async (id, data) => {
    const response = await api.put(`/promotions/${id}`, data);
    return response.data;
};

export const deletePromotion = async (id) => {
    const response = await api.delete(`/promotions/${id}`);
    return response.data;
};

// Semesters
export const getSemesters = async (filters = {}) => {
    const params = typeof filters === 'string' ? { promotionId: filters } : filters;
    const response = await api.get('/semesters', { params });
    return response.data;
};

export const createSemester = async (data) => {
    const response = await api.post('/semesters', data);
    return response.data;
};

export const updateSemester = async (id, data) => {
    const response = await api.put(`/semesters/${id}`, data);
    return response.data;
};

export const deleteSemester = async (id) => {
    const response = await api.delete(`/semesters/${id}`);
    return response.data;
};

// TUs
export const getTUs = async (filters = {}) => {
    const params = typeof filters === 'string' ? { semesterId: filters } : filters;
    const response = await api.get('/tus', { params });
    return response.data;
};

export const createTU = async (data) => {
    const response = await api.post('/tus', data);
    return response.data;
};

export const updateTU = async (id, data) => {
    const response = await api.put(`/tus/${id}`, data);
    return response.data;
};

export const deleteTU = async (id) => {
    const response = await api.delete(`/tus/${id}`);
    return response.data;
};

// TUEs
export const getTUEs = async (filters = {}) => {
    const params = typeof filters === 'string' ? { tuId: filters } : filters;
    const response = await api.get('/tues', { params });
    return response.data;
};

export const createTUE = async (data) => {
    const response = await api.post('/tues', data);
    return response.data;
};

export const updateTUE = async (id, data) => {
    const response = await api.put(`/tues/${id}`, data);
    return response.data;
};

export const deleteTUE = async (id) => {
    const response = await api.delete(`/tues/${id}`);
    return response.data;
};
