import React, { useState, useEffect, useCallback } from 'react';
import { Dialog } from '@headlessui/react';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaFilePdf, FaSpinner } from 'react-icons/fa';
import api from '../../services/api';
import PropTypes from 'prop-types';

const TranscriptGenerationDialog = ({ isOpen, onClose, student, academicYear }) => {
    const [loading, setLoading] = useState(true);
    const [validation, setValidation] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [language, setLanguage] = useState('en');

    const validateReadiness = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Determine level from promotion (e.g., "L3")
            const level = student?.promotionId?.level || 'L1'; // Fallback

            const response = await api.get(`/transcripts/validate/${student._id}`, {
                params: { academicYear, level }
            });

            setValidation(response.data);
        } catch (err) {
            console.error('Validation error:', err);
            setError(`Failed to validate transcript: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    }, [student, academicYear]);

    useEffect(() => {
        if (isOpen && student) {
            setLanguage('en');
            validateReadiness();
        }
    }, [isOpen, student, validateReadiness]);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const response = await api.get(`/transcripts/student/${student._id}/pdf`, {
                params: {
                    academicYear,
                    level: student?.promotionId?.level || 'L1',
                    lang: language
                },
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `transcript_${student.lastName}_${student.firstName}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            onClose();
        } catch (err) {
            console.error('Generation error:', err);
            setError(`PDF generation failed: ${err.response?.data?.message || err.message}`);
        } finally {
            setGenerating(false);
        }
    };

    const handleCalculateAnnual = async () => {
        setLoading(true);
        try {
            await api.post('/calculations/annual', {
                studentId: student._id,
                academicYear,
                level: student?.promotionId?.level || 'L1'
            });
            // Re-validate after calculation
            validateReadiness();
        } catch (err) {
            console.error('Calculation error:', err);
            setError(`Calculation failed: ${err.response?.data?.message || err.message}`);
            setLoading(false);
        }
    };

    if (!student) return null;

    return (
        <Dialog open={isOpen} onClose={() => !generating && onClose()} className="relative z-50">
            {/* The backdrop, rendered as a fixed sibling to the panel container */}
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            {/* Full-screen container to center the panel */}
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-2xl w-full rounded-lg bg-white p-6 shadow-xl">
                    <Dialog.Title className="text-lg font-bold text-gray-900 mb-4">
                        Transcript Generation: {student.firstName} {student.lastName}
                    </Dialog.Title>

                    <div className="mt-4">
                        {loading ? (
                            <div className="flex justify-center p-8">
                                <FaSpinner className="animate-spin text-4xl text-blue-500" />
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <FaTimesCircle className="h-5 w-5 text-red-500" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                </div>
                            </div>
                        ) : validation ? (
                            <div>
                                <div className="flex items-center justify-between mb-6 bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <span className="text-gray-700 font-medium mr-2">Readiness Status:</span>
                                        <span className={`font-bold ${validation.readyForTranscript ? 'text-green-600' : 'text-red-600'}`}>
                                            {validation.readyForTranscript ? 'READY' : 'NOT READY'}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-sm text-gray-500 mr-2">
                                            Completion: {validation.completionPercentage}%
                                        </span>
                                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${validation.readyForTranscript ? 'bg-green-500' : 'bg-yellow-500'}`}
                                                style={{ width: `${validation.completionPercentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                                    {validation.messages?.map((msg, index) => {
                                        let icon = <FaCheckCircle className="text-green-500 mt-1" />;
                                        let textColor = 'text-gray-700';

                                        if (msg.startsWith('❌')) {
                                            icon = <FaTimesCircle className="text-red-500 mt-1" />;
                                            textColor = 'text-red-700';
                                        }
                                        if (msg.startsWith('⚠️')) {
                                            icon = <FaExclamationTriangle className="text-yellow-500 mt-1" />;
                                            textColor = 'text-yellow-700';
                                        }

                                        return (
                                            <div key={index} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                                                <div className="flex-shrink-0">{icon}</div>
                                                <span className={`text-sm ${textColor}`}>{msg.substring(2)}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {!validation.readyForTranscript && validation.missing?.annualCalculation?.possible && !validation.missing?.annualCalculation?.calculated && (
                                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 flex justify-between items-center">
                                        <p className="text-sm text-blue-700">
                                            Annual calculation is possible but hasn't been run yet.
                                        </p>
                                        <button
                                            onClick={handleCalculateAnnual}
                                            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                        >
                                            Calculate Now
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
                        <span className="text-sm font-medium text-gray-700">Transcript language</span>
                        <select
                            value={language}
                            onChange={(event) => setLanguage(event.target.value)}
                            disabled={generating}
                            className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="en">English</option>
                            <option value="fr">French</option>
                        </select>
                    </div>

                    <div className="mt-8 flex justify-end space-x-3 border-t pt-4">
                        <button
                            onClick={onClose}
                            disabled={generating}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleGenerate}
                            disabled={generating || (validation && !validation.readyForTranscript)}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {generating ? (
                                <>
                                    <FaSpinner className="animate-spin mr-2" /> Generating...
                                </>
                            ) : (
                                <>
                                    <FaFilePdf className="mr-2" /> Generate PDF
                                </>
                            )}
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

TranscriptGenerationDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    student: PropTypes.object,
    academicYear: PropTypes.string.isRequired,
};

export default TranscriptGenerationDialog;
