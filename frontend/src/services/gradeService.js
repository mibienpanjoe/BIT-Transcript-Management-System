import api from './api';

export const getMyTUEs = async () => {
    const response = await api.get('/grades/my-tues');
    return response.data;
};

export const getGradesForTUE = async (tueId) => {
    const response = await api.get(`/grades/tue/${tueId}`);
    return response.data;
};

export const submitGrade = async (gradeData) => {
    const response = await api.post('/grades', gradeData);
    return response.data;
};

export const importGrades = async (tueId, formData) => {
    const response = await api.post(`/grades/import/${tueId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const downloadTemplate = async (tueId) => {
    const response = await api.get(`/grades/template/${tueId}`, {
        responseType: 'blob',
    });
    return response.data;
};

export const getEvaluationSchema = async (tueId) => {
    const response = await api.get(`/tues/${tueId}/evaluation-schema`);
    return response.data;
};

export const updateEvaluationSchema = async (tueId, evaluationSchema) => {
    const response = await api.put(`/tues/${tueId}/evaluation-schema`, { evaluationSchema });
    return response.data;
};
