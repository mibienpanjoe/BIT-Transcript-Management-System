import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaCalculator, FaLock, FaFilePdf, FaSpinner } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

const AnnualResultsTable = ({ promotionId, academicYear }) => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [calculating, setCalculating] = useState(false);
    const [stats, setStats] = useState({ total: 0, validated: 0, failed: 0 });

    useEffect(() => {
        if (promotionId && academicYear) {
            fetchResults();
        }
    }, [promotionId, academicYear]);

    const fetchResults = async () => {
        setLoading(true);
        try {
            // We need to know the level. For now, we'll fetch students to get the level or assume it from promotion
            // A better way is to fetch promotion details first.
            const promoRes = await api.get(`/promotions/${promotionId}`);
            const level = promoRes.data.level;

            const res = await api.get('/calculations/annual-results', {
                params: { academicYear, level }
            });

            setResults(res.data.data || res.data);
            calculateStats(res.data.data || res.data);
        } catch (error) {
            console.error('Error fetching annual results:', error);
            toast.error('Failed to load annual results.');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const validated = data.filter(r => r.status === 'VALIDATED').length;
        const failed = data.filter(r => r.status === 'NOT VALIDATED').length;
        setStats({
            total: data.length,
            validated,
            failed
        });
    };

    const handleBulkCalculate = async () => {
        if (!window.confirm('Are you sure you want to recalculate annual results for ALL students in this promotion? This may take a while.')) {
            return;
        }

        setCalculating(true);
        try {
            // First get all students in promotion
            const studentsRes = await api.get(`/students/promotion/${promotionId}`);
            const studentsData = studentsRes.data.data || studentsRes.data;
            const students = studentsData.map(s => s._id);
            const level = studentsData[0]?.promotionId?.level || 'L1'; // Fallback

            const res = await api.post('/calculations/annual/bulk', {
                students,
                academicYear,
                level
            });

            alert(`Calculation complete!\nSuccess: ${res.data.results.length}\nFailed: ${res.data.errors.length}`);
            fetchResults(); // Refresh table
        } catch (error) {
            console.error('Bulk calculation error:', error);
            toast.error('Failed to perform bulk calculation. Check console for details.');
            alert(`Error: ${error.response?.data?.message || error.message}`);
        } finally {
            setCalculating(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'VALIDATED':
                return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"><FaCheckCircle className="mr-1" /> Validated</span>;
            case 'NOT VALIDATED':
                return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800"><FaTimesCircle className="mr-1" /> Not Validated</span>;
            default:
                return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800"><FaExclamationTriangle className="mr-1" /> Incomplete</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow flex flex-wrap justify-between items-center">
                <div className="flex space-x-6">
                    <div className="text-center">
                        <p className="text-sm text-gray-500">Total Students</p>
                        <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-500">Validated</p>
                        <p className="text-2xl font-bold text-green-600">{stats.validated}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-500">Not Validated</p>
                        <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                    </div>
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={handleBulkCalculate}
                        disabled={calculating}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {calculating ? <FaExclamationTriangle className="animate-spin mr-2" /> : <FaCalculator className="mr-2" />}
                        {calculating ? 'Calculating...' : 'Recalculate All'}
                    </button>
                    <button
                        className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
                        title="Lock results (Coming Soon)"
                    >
                        <FaLock className="mr-2" /> Close Year
                    </button>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S1 Avg</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S2 Avg</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Annual Avg</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mention</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {results.map((result) => (
                            <tr key={result._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {result.studentId?.lastName} {result.studentId?.firstName}
                                    </div>
                                    <div className="text-sm text-gray-500">{result.studentId?.registrationNumber}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {result.semester1?.average?.toFixed(2) || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {result.semester2?.average?.toFixed(2) || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                    {result.annualAverage?.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(result.status)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {result.mention}
                                </td>
                            </tr>
                        ))}
                        {loading && (
                            <tr>
                                <td colSpan="6" className="px-6 py-10 text-center">
                                    <FaSpinner className="animate-spin mx-auto text-4xl text-blue-500" />
                                    <p className="mt-2 text-sm text-gray-500">Loading results...</p>
                                </td>
                            </tr>
                        )}
                        {results.length === 0 && !loading && (
                            <tr>
                                <td colSpan="6" className="px-6 py-10 text-center text-sm text-gray-500">
                                    No annual results found. Click "Recalculate All" to generate them.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

AnnualResultsTable.propTypes = {
    promotionId: PropTypes.string.isRequired,
    academicYear: PropTypes.string.isRequired,
};

export default AnnualResultsTable;
