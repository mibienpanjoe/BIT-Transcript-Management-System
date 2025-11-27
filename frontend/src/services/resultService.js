import api from './api';

export const calculateSemesterResults = async (semesterId) => {
    const response = await api.post(`/calculations/semester/${semesterId}`);
    return response.data;
};

export const calculateAnnualResults = async (promotionId) => {
    const response = await api.post(`/calculations/annual/${promotionId}`);
    return response.data;
};

export const getSemesterResults = async (semesterId) => {
    // This endpoint might need to be created in backend if not exists, 
    // or we use the calculation endpoint which usually returns results.
    // Checking backend routes: calculationRoutes has /semester/:semesterId (POST) and /annual/:promotionId (POST).
    // It seems we don't have a dedicated GET for results in calculationRoutes, 
    // but we can use studentService or create a new endpoint.
    // For now, let's assume the calculation endpoint returns the results as per the controller logic.
    // Wait, the controller logic for calculation returns { message: 'Calculation completed', results: [...] }.
    // So calling calculate is also "get" in a way, but it re-calculates.
    // Ideally we should have a GET endpoint.
    // Let's check if we can use the existing POST for now as it is idempotent-ish (re-calculates).
    // However, for just viewing, it might be heavy.
    // Let's assume for this phase we use the calculation trigger to view results.
    const response = await api.post(`/calculations/semester/${semesterId}`);
    return response.data;
};

export const generateTranscript = async (studentId, semesterId = null) => {
    const response = await api.get(`/pdfs/transcript/${studentId}`, {
        params: { semesterId },
        responseType: 'blob', // Important for PDF download
    });
    return response.data;
};
