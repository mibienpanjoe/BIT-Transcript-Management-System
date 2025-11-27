import api from './api';

// We can reuse grade endpoints but might want specific ones for clarity or bulk operations
// For now, we'll use the same structure as grade submission but focused on presence

export const getTUEsForAttendance = async (semesterId) => {
    // This endpoint needs to be supported by backend. 
    // If not, we can reuse getTUs or getTUEs with filters.
    // Let's assume we fetch all TUEs for a semester to select one for attendance entry.
    const response = await api.get('/tues', { params: { semesterId } });
    return response.data;
};

export const submitAttendance = async (data) => {
    // data: { studentId, tueId, presence }
    // We use the same grade endpoint but only send presence
    // Add academicYear as it is required by the backend model
    const payload = {
        ...data,
        academicYear: new Date().getFullYear().toString()
    };
    const response = await api.post('/grades', payload);
    return response.data;
};

export const getAttendanceForTUE = async (tueId) => {
    // Reusing the grade fetching endpoint as it returns the full grade object including presence
    const response = await api.get(`/grades/tue/${tueId}`);
    return response.data;
};
