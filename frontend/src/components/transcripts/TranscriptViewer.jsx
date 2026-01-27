import React, { useState, useEffect } from 'react';
import { getTranscriptData } from '../../services/transcriptService';
import LoadingSpinner from '../common/LoadingSpinner';
import Alert from '../common/Alert';
import { formatGrade } from '../../utils/formatters';

const TranscriptViewer = ({ studentId, academicYear }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            if (!studentId) return;
            try {
                setLoading(true);
                setError(null);
                const response = await getTranscriptData(studentId, academicYear);
                setData(response.data);
            } catch (err) {
                console.error('Transcript load error:', err);
                setError(err.response?.data?.message || 'Failed to load transcript data');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [studentId, academicYear]);

    if (loading) return <LoadingSpinner />;
    if (error) return <Alert type="error" message={error} />;
    if (!data) return <Alert type="info" message="No transcript data available" />;
    if (!data.semesters || data.semesters.length === 0) {
        return <Alert type="warning" message="No semester results calculated yet. Please calculate results first from the Results menu." />;
    }

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="border-b pb-4 mb-4">
                <h2 className="text-xl font-bold">{data.student.firstName} {data.student.lastName}</h2>
                <p className="text-gray-600">ID: {data.student.studentId}</p>
                <p className="text-gray-600">Field: {data.student.field?.name}</p>
            </div>

            <div className="space-y-6">
                {data.semesters?.map((sem) => (
                    <div key={sem.semesterId} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4 bg-gray-50 p-2 rounded">
                            <h3 className="font-bold text-lg">{sem.semesterName}</h3>
                            <div className="text-right">
                                <p className="text-sm font-semibold">Average: {formatGrade(sem.average)}/20</p>
                                <p className={`text-sm ${sem.isValidated ? 'text-green-600' : 'text-red-600'}`}>
                                    {sem.decision}
                                </p>
                            </div>
                        </div>

                        {sem.tus && sem.tus.length > 0 ? (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">TU</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avg</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {sem.tus.map((tu) => (
                                        <tr key={tu.tuId}>
                                            <td className="px-4 py-2 text-sm">{tu.name}</td>
                                            <td className="px-4 py-2 text-sm">{formatGrade(tu.average)}</td>
                                            <td className="px-4 py-2 text-sm">{tu.creditsEarned}/{tu.totalCredits}</td>
                                            <td className="px-4 py-2 text-sm">{tu.validationStatus}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <Alert type="info" message="No TU results available for this semester" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TranscriptViewer;
