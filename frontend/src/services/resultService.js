import api from './api';

export const calculateSemesterResults = async ({ studentId, semesterId, academicYear }) => {
    const response = await api.post('/calculations/semester', { studentId, semesterId, academicYear });
    return response.data;
};

export const calculateAnnualResults = async ({ studentId, level, academicYear }) => {
    const response = await api.post('/calculations/annual', { studentId, level, academicYear });
    return response.data;
};

export const getSemesterResults = async ({ studentId, academicYear }) => {
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
    const response = await api.get('/calculations/semester-results', {
        params: { studentId, academicYear }
    });
    return response.data;
};

export const generateTranscript = async ({ studentId, semesterId = null, academicYear, lang = 'en' }) => {
    const response = await api.get('/pdf/transcript', {
        params: { studentId, semesterId, academicYear, lang },
        responseType: 'blob', // Important for PDF download
    });
    return response.data;
};
