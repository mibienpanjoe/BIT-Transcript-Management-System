import api from './api';

export const getTranscriptData = (studentId) => {
    return api.get(`/transcripts/student/${studentId}`);
};

export const generateTranscriptPDF = (studentId, semesterId = null) => {
    const url = semesterId
        ? `/transcripts/semester/${semesterId}/student/${studentId}/pdf`
        : `/transcripts/student/${studentId}/pdf`;

    return api.get(url, {
        responseType: 'blob',
        headers: {
            'Accept': 'application/pdf'
        }
    });
};

export const bulkGenerateTranscripts = (studentIds, semesterId = null) => {
    return api.post('/transcripts/bulk-generate', {
        studentIds,
        semesterId
    });
};
