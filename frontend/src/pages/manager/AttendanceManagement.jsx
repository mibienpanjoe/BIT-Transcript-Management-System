import React, { useState, useEffect } from 'react';
import { getFields, getPromotions, getSemesters } from '../../services/academicService';
import {
    getTUEsForAttendance,
    submitAttendance,
    getAttendanceForTUE,
    downloadAttendanceTemplate,
    importAttendance
} from '../../services/attendanceService';
import AttendanceTable from '../../components/attendance/AttendanceTable';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import { toast } from 'react-toastify';
import { FaSave, FaArrowLeft, FaFileDownload, FaFileUpload } from 'react-icons/fa';

const AttendanceManagement = () => {
    const [fields, setFields] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [tues, setTues] = useState([]);
    const [students, setStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});

    const [selectedField, setSelectedField] = useState('');
    const [selectedPromotion, setSelectedPromotion] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedTUE, setSelectedTUE] = useState(null);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        const loadFields = async () => {
            try {
                const res = await getFields();
                setFields(res.data);
            } catch (error) {
                toast.error('Failed to load fields');
            }
        };
        loadFields();
    }, []);

    useEffect(() => {
        const loadPromotions = async () => {
            if (!selectedField) {
                setPromotions([]);
                return;
            }
            try {
                const res = await getPromotions(selectedField);
                setPromotions(res.data);
            } catch (error) {
                toast.error('Failed to load promotions');
            }
        };
        loadPromotions();
    }, [selectedField]);

    useEffect(() => {
        const loadSemesters = async () => {
            if (!selectedPromotion) {
                setSemesters([]);
                return;
            }
            try {
                const res = await getSemesters(selectedPromotion);
                setSemesters(res.data);
            } catch (error) {
                toast.error('Failed to load semesters');
            }
        };
        loadSemesters();
    }, [selectedPromotion]);

    useEffect(() => {
        const loadTUEs = async () => {
            if (!selectedSemester) {
                setTues([]);
                return;
            }
            try {
                const res = await getTUEsForAttendance(selectedSemester);
                setTues(res.data);
            } catch (error) {
                toast.error('Failed to load TUEs');
            }
        };
        loadTUEs();
    }, [selectedSemester]);

    const handleTUESelect = async (tue) => {
        try {
            setLoading(true);
            const res = await getAttendanceForTUE(tue._id);
            // res.data.students is array of { student, grade: { ...gradeData, isEditable } }

            // Map to format expected by AttendanceTable or just use as is
            // Let's assume AttendanceTable expects students array and we manage state separately
            // But actually, the previous code was mapping differently. Let's align with what getGradesForTUE returns.

            // The previous code was:
            // res.data.students.forEach(s => { initialAttendance[s._id] = ... })
            // But getGradesForTUE returns { student, grade } objects.

            // Let's adapt:
            const studentsList = res.data.students.map(item => item.student);
            setStudents(studentsList);

            const initialAttendance = {};
            res.data.students.forEach(item => {
                initialAttendance[item.student._id] = {
                    presence: item.grade?.presence || 0,
                    isEditable: item.grade?.isEditable ?? true // Default to true if not specified
                };
            });
            setAttendanceData(initialAttendance);
            setSelectedTUE(tue);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load attendance data');
        } finally {
            setLoading(false);
        }
    };

    const handleAttendanceChange = (studentId, field, value) => {
        // Check if editable
        if (attendanceData[studentId] && !attendanceData[studentId].isEditable) {
            toast.warning('This grade is locked and cannot be edited.');
            return;
        }

        setAttendanceData(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: Number(value)
            }
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            // Only send updates for editable records
            const updates = Object.keys(attendanceData)
                .filter(studentId => attendanceData[studentId].isEditable)
                .map(studentId => ({
                    studentId,
                    tueId: selectedTUE._id,
                    presence: attendanceData[studentId].presence
                }));

            if (updates.length === 0) {
                toast.info('No editable changes to save');
                return;
            }

            await Promise.all(updates.map(update => submitAttendance(update)));
            toast.success('Attendance saved successfully');

            // Refresh data to update lock status if needed
            handleTUESelect(selectedTUE);

        } catch (error) {
            toast.error('Failed to save attendance');
        } finally {
            setSaving(false);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const blob = await downloadAttendanceTemplate(selectedTUE._id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Attendance_Template_${selectedTUE.code}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            toast.error('Failed to download template');
        }
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setImporting(true);
            const res = await importAttendance(selectedTUE._id, file);
            toast.success(res.message);
            // Refresh data
            handleTUESelect(selectedTUE);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Import failed');
        } finally {
            setImporting(false);
            e.target.value = null; // Reset input
        }
    };

    if (selectedTUE) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setSelectedTUE(null)}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <FaArrowLeft />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold">{selectedTUE.name}</h2>
                            <p className="text-gray-500">{selectedTUE.code}</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            onClick={handleDownloadTemplate}
                            variant="secondary"
                            className="flex items-center"
                        >
                            <FaFileDownload className="mr-2" /> Template
                        </Button>
                        <div className="relative">
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={handleImport}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={importing}
                            />
                            <Button
                                variant="secondary"
                                isLoading={importing}
                                className="flex items-center"
                            >
                                <FaFileUpload className="mr-2" /> Import
                            </Button>
                        </div>
                        <Button
                            onClick={handleSave}
                            isLoading={saving}
                            className="flex items-center"
                        >
                            <FaSave className="mr-2" /> Save Changes
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <AttendanceTable
                        students={students}
                        attendanceData={attendanceData}
                        onAttendanceChange={handleAttendanceChange}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>

            <div className="bg-white p-4 rounded-lg shadow space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select
                        label="Field"
                        value={selectedField}
                        onChange={(e) => setSelectedField(e.target.value)}
                        options={fields.map(f => ({ value: f._id, label: f.name }))}
                    />
                    <Select
                        label="Promotion"
                        value={selectedPromotion}
                        onChange={(e) => setSelectedPromotion(e.target.value)}
                        options={promotions.map(p => ({ value: p._id, label: p.name }))}
                        disabled={!selectedField}
                    />
                    <Select
                        label="Semester"
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        options={semesters.map(s => ({ value: s._id, label: s.name }))}
                        disabled={!selectedPromotion}
                    />
                </div>
            </div>

            {selectedSemester && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tues.map(tue => (
                        <div
                            key={tue._id}
                            onClick={() => handleTUESelect(tue)}
                            className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow border border-transparent hover:border-blue-500"
                        >
                            <h3 className="font-bold text-lg mb-2">{tue.name}</h3>
                            <p className="text-gray-600 text-sm">{tue.code}</p>
                            <p className="text-gray-500 text-xs mt-2">Credits: {tue.credits}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AttendanceManagement;
