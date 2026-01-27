import api from './api';

export const getTranscriptData = (studentId, academicYear) => {
    return api.get(`/transcripts/student/${studentId}`, {
        params: academicYear ? { academicYear } : undefined
    });
};

export const generateTranscriptPDF = (studentId, semesterId = null, lang = 'en') => {
    const url = semesterId
        ? `/transcripts/semester/${semesterId}/student/${studentId}/pdf`
        : `/transcripts/student/${studentId}/pdf`;

    return api.get(url, {
        params: { lang },
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
