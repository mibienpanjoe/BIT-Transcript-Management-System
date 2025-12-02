import React, { useState, useEffect } from 'react';
import { getGradesForTUE, submitGrade, downloadTemplate, importGrades } from '../../services/gradeService';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import Alert from '../common/Alert';
import { formatGrade } from '../../utils/formatters';
import { toast } from 'react-toastify';
import { FaDownload, FaUpload, FaSave, FaUserGraduate } from 'react-icons/fa';
import PropTypes from 'prop-types';

const GradeTableSkeleton = () => (
    <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex space-x-4 mb-3">
                <div className="flex-1 h-12 bg-gray-100 rounded"></div>
                <div className="w-20 h-12 bg-gray-100 rounded"></div>
                <div className="w-20 h-12 bg-gray-100 rounded"></div>
                <div className="w-20 h-12 bg-gray-100 rounded"></div>
                <div className="w-20 h-12 bg-gray-100 rounded"></div>
            </div>
        ))}
    </div>
);

const GradeEntry = ({ tueId }) => {
    const [gradeData, setGradeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editedGrades, setEditedGrades] = useState({});
    const [importFile, setImportFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [recentlySaved, setRecentlySaved] = useState(new Set());

    useEffect(() => {
        loadGrades();
    }, [tueId]);

    const loadGrades = async () => {
        try {
            setLoading(true);
            const res = await getGradesForTUE(tueId);
            setGradeData(res.data);
            setEditedGrades({});
        } catch (error) {
            console.error('Grade loading error:', error);
            const errorMsg = error.response?.data?.message
                || (error.response?.status === 404
                    ? 'Course not found or you do not have access to it'
                    : 'Failed to load grades. Please try again.');
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleGradeChange = (studentId, field, value) => {
        setEditedGrades(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value
            }
        }));
    };

    const getDisplayValue = (studentId, field, originalValue) => {
        return editedGrades[studentId]?.[field] !== undefined
            ? editedGrades[studentId][field]
            : originalValue || '';
    };

    const validateGrade = (value) => {
        if (value === '' || value === null || value === undefined) return true; // Allow empty
        const num = parseFloat(value);
        return !isNaN(num) && num >= 0 && num <= 20;
    };

    const hasInvalidGrades = () => {
        return Object.values(editedGrades).some(grades =>
            (grades.participation !== undefined && !validateGrade(grades.participation)) ||
            (grades.evaluation !== undefined && !validateGrade(grades.evaluation))
        );
    };

    const getInputClassName = (value, isEditable = true) => {
        const baseClasses = "w-20 rounded-md shadow-sm sm:text-sm";

        if (!isEditable) {
            return `${baseClasses} border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed`;
        }

        const parsedValue = parseFloat(value);

        if (value === '' || value === null || value === undefined) {
            return `${baseClasses} border-gray-300 focus:ring-blue-500 focus:border-blue-500`;
        }

        if (isNaN(parsedValue) || parsedValue < 0 || parsedValue > 20) {
            return `${baseClasses} border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50`;
        }

        return `${baseClasses} border-green-300 focus:ring-green-500 focus:border-green-500`;
    };

    const handleSaveRow = async (studentId) => {
        const student = gradeData.students.find(s => s.student._id === studentId);
        const changes = editedGrades[studentId];

        if (!changes) return;

        try {
            const payload = {
                studentId,
                tueId,
                presence: changes.presence !== undefined
                    ? changes.presence
                    : student?.grade?.presence || 0,
                participation: changes.participation !== undefined
                    ? changes.participation
                    : student?.grade?.participation || 0,
                evaluation: changes.evaluation !== undefined
                    ? changes.evaluation
                    : student?.grade?.evaluation || 0
                // academicYear removed - backend derives it from student's promotion
            };

            await submitGrade(payload);
            toast.success('Grade saved');

            // Update local state to reflect saved changes
            setGradeData(prev => ({
                ...prev,
                students: prev.students.map(s =>
                    s.student._id === studentId
                        ? { ...s, grade: { ...s.grade, ...payload } }
                        : s
                )
            }));

            // Remove from edited
            setEditedGrades(prev => {
                const next = { ...prev };
                delete next[studentId];
                return next;
            });

            // Add highlight indicator
            setRecentlySaved(prev => new Set([...prev, studentId]));
            setTimeout(() => {
                setRecentlySaved(prev => {
                    const next = new Set(prev);
                    next.delete(studentId);
                    return next;
                });
            }, 3000);

        } catch (error) {
            if (error.response?.status === 403) {
                toast.error('This grade is locked. Only administrators can modify submitted grades.');
            } else {
                toast.error('Failed to save grade');
            }
        }
    };

    const handleSaveAll = async () => {
        if (Object.keys(editedGrades).length === 0) return;

        if (hasInvalidGrades()) {
            toast.error('Please fix invalid grades before saving (must be between 0 and 20)');
            return;
        }

        // Filter out locked grades
        const editableGrades = Object.entries(editedGrades).filter(([studentId]) => {
            const student = gradeData.students.find(s => s.student._id === studentId);
            return student?.grade?.isEditable !== false;
        });

        if (editableGrades.length === 0) {
            toast.warning('No editable grades to save');
            return;
        }

        setSaving(true);
        try {
            const promises = editableGrades.map(([studentId, changes]) => {
                const student = gradeData.students.find(s => s.student._id === studentId);
                const payload = {
                    studentId,
                    tueId,
                    presence: changes.presence !== undefined
                        ? changes.presence
                        : student?.grade?.presence || 0,
                    participation: changes.participation !== undefined
                        ? changes.participation
                        : student?.grade?.participation || 0,
                    evaluation: changes.evaluation !== undefined
                        ? changes.evaluation
                        : student?.grade?.evaluation || 0
                    // academicYear removed - backend derives it from student's promotion
                };
                return submitGrade(payload);
            });

            await Promise.all(promises);
            toast.success('All grades saved successfully');
            loadGrades();
        } catch (error) {
            if (error.response?.status === 403) {
                toast.error('Some grades are locked. Only administrators can modify submitted grades.');
            } else {
                toast.error('Failed to save some grades');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const blob = await downloadTemplate(tueId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Grade_Template_${gradeData.tue.code}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            const errorMsg = error.response?.status === 404
                ? 'Template not available for this course'
                : 'Failed to download template. Please try again.';
            toast.error(errorMsg);
        }
    };

    const handleImport = async (e) => {
        e.preventDefault();
        if (!importFile) {
            toast.error('Please select a file');
            return;
        }

        // Add confirmation dialog
        const studentCount = gradeData.students.length;
        const confirmMessage = `Import grades from Excel? This will overwrite existing grades for ${studentCount} students. This action cannot be undone.`;

        if (!window.confirm(confirmMessage)) {
            return;
        }

        const formData = new FormData();
        formData.append('file', importFile);
        // academicYear removed - backend derives it from TUE's promotion

        setImporting(true);
        try {
            const res = await importGrades(tueId, formData);
            toast.success(res.message);
            setImportFile(null);
            loadGrades();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Import failed');
        } finally {
            setImporting(false);
        }
    };

    if (loading) return (
        <div className="bg-white p-6 rounded-lg shadow">
            <GradeTableSkeleton />
        </div>
    );
    if (!gradeData) return <Alert type="error" message="Failed to load grade data" />;

    return (
        <div className="space-y-6">
            {/* Promotion Context Banner */}
            {gradeData.tue?.tuId?.semesterId?.promotionId && (
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold">
                                {gradeData.tue.tuId.semesterId.promotionId.name}
                            </h3>
                            <p className="text-sm opacity-90 mt-1">
                                {gradeData.tue.name} ({gradeData.tue.code})
                            </p>
                        </div>
                        <div className="bg-white bg-opacity-20 px-4 py-2 rounded">
                            <p className="text-xs uppercase tracking-wide opacity-90">Academic Year</p>
                            <p className="text-2xl font-bold">
                                {gradeData.tue.tuId.semesterId.promotionId.academicYear || 'N/A'}
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 p-2 bg-blue-800 bg-opacity-30 rounded text-sm">
                        <p className="flex items-center">
                            <span className="mr-2">ℹ️</span>
                            Grades will be automatically saved for the academic year shown above.
                        </p>
                    </div>
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {gradeData.tue.name} ({gradeData.tue.code})
                        </h2>
                        <p className="text-gray-600 mt-1">
                            Enter grades for students. Presence grades are managed by Schooling Manager.
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            onClick={handleDownloadTemplate}
                            className="flex items-center"
                        >
                            <FaDownload className="mr-2" /> Template
                        </Button>
                        <form onSubmit={handleImport} className="flex items-center space-x-2">
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={(e) => setImportFile(e.target.files[0])}
                                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            <Button
                                type="submit"
                                isLoading={importing}
                                disabled={!importFile}
                                className="flex items-center"
                            >
                                <FaUpload className="mr-2" /> Import
                            </Button>
                        </form>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Student
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Presence (5%)
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Participation (5%)
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Evaluation (90%)
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Final Grade
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {gradeData.students.map((item) => (
                                <tr key={item.student._id} className={recentlySaved.has(item.student._id) ? 'bg-green-50 transition-colors duration-500' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {item.student.lastName} {item.student.firstName}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {item.student.studentId}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatGrade(item.grade?.presence)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="number"
                                            min="0"
                                            max="20"
                                            step="0.01"
                                            disabled={!item.grade?.isEditable}
                                            className={getInputClassName(
                                                getDisplayValue(item.student._id, 'participation', item.grade?.participation),
                                                item.grade?.isEditable
                                            )}
                                            value={getDisplayValue(item.student._id, 'participation', item.grade?.participation)}
                                            onChange={(e) => handleGradeChange(item.student._id, 'participation', e.target.value)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="number"
                                            min="0"
                                            max="20"
                                            step="0.01"
                                            disabled={!item.grade?.isEditable}
                                            className={getInputClassName(
                                                getDisplayValue(item.student._id, 'evaluation', item.grade?.evaluation),
                                                item.grade?.isEditable
                                            )}
                                            value={getDisplayValue(item.student._id, 'evaluation', item.grade?.evaluation)}
                                            onChange={(e) => handleGradeChange(item.student._id, 'evaluation', e.target.value)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                        {formatGrade(item.grade?.finalGrade)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {editedGrades[item.student._id] && item.grade?.isEditable && (
                                            <button
                                                onClick={() => handleSaveRow(item.student._id)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Save
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {gradeData.students.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-2">
                            <FaUserGraduate className="mx-auto h-12 w-12" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No Students Enrolled</h3>
                        <p className="text-sm text-gray-500">
                            There are no students enrolled in this course yet.
                        </p>
                    </div>
                )}

                {Object.keys(editedGrades).length > 0 && (
                    <div className="mt-6 flex justify-end">
                        <Button
                            onClick={handleSaveAll}
                            isLoading={saving}
                            className="flex items-center"
                        >
                            <FaSave className="mr-2" /> Save All Changes
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

GradeEntry.propTypes = {
    tueId: PropTypes.string.isRequired,
};

export default GradeEntry;
