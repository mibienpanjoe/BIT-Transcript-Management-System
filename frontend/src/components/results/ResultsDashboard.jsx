import React, { useState, useEffect } from 'react';
import { FaFilePdf, FaEye, FaSync, FaList, FaTable } from 'react-icons/fa';
import api from '../../services/api';
import TranscriptGenerationDialog from './TranscriptGenerationDialog';
import AnnualResultsTable from './AnnualResultsTable';
import { toast } from 'react-toastify';

const generateAcademicYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = -2; i <= 1; i++) {
        const year = currentYear + i;
        years.push(`${year}-${year + 1}`);
    }
    return years;
};

const ResultsDashboard = () => {
    const [students, setStudents] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [selectedPromotion, setSelectedPromotion] = useState('');

    const [academicYears] = useState(generateAcademicYears());
    const [academicYear, setAcademicYear] = useState(academicYears[2]); // Default to current year

    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('students'); // 'students' or 'results'

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        fetchPromotions();
    }, []);

    useEffect(() => {
        if (selectedPromotion) {
            fetchStudents(selectedPromotion);
        }
    }, [selectedPromotion, academicYear]);

    const fetchPromotions = async () => {
        try {
            const response = await api.get('/promotions');
            setPromotions(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching promotions:', error);
            toast.error('Failed to load promotions. Please refresh the page.');
        }
    };

    const fetchStudents = async (promotionId) => {
        setLoading(true);
        try {
            const response = await api.get(`/students/promotion/${promotionId}`);
            setStudents(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Failed to load students for this promotion.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (student) => {
        setSelectedStudent(student);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedStudent(null);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
                Results & Transcripts
            </h1>

            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                        <select
                            value={academicYear}
                            onChange={(e) => setAcademicYear(e.target.value)}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                        >
                            {academicYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Promotion</label>
                        <select
                            value={selectedPromotion}
                            onChange={(e) => setSelectedPromotion(e.target.value)}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                        >
                            <option value="">Select Promotion</option>
                            {promotions.map((promo) => (
                                <option key={promo._id} value={promo._id}>
                                    {promo.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {selectedPromotion && (
                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('students')}
                            className={`${activeTab === 'students'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                        >
                            <FaList className="mr-2" /> Student List
                        </button>
                        <button
                            onClick={() => setActiveTab('results')}
                            className={`${activeTab === 'results'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                        >
                            <FaTable className="mr-2" /> Annual Results
                        </button>
                    </nav>
                </div>
            )}

            {activeTab === 'students' ? (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration No.</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {students.map((student) => (
                                <tr key={student._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.registrationNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            Active
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleOpenDialog(student)}
                                            className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                                            title="Generate Transcript"
                                        >
                                            <FaFilePdf className="mr-1" /> Generate
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {students.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-sm text-gray-500">
                                        {selectedPromotion ? 'No students found' : 'Select a promotion to view students'}
                                    </td>
                                </tr>
                            )}
                            {loading && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-sm text-gray-500">
                                        Loading...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : selectedPromotion ? (
                <AnnualResultsTable
                    promotionId={selectedPromotion}
                    academicYear={academicYear}
                    key={`${selectedPromotion}-${academicYear}`}
                />
            ) : null}

            <TranscriptGenerationDialog
                isOpen={dialogOpen}
                onClose={handleCloseDialog}
                student={selectedStudent}
                academicYear={academicYear}
            />
        </div>
    );
};

export default ResultsDashboard;
