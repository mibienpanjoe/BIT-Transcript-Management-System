import React, { useState, useEffect } from 'react';
import { getFields, getPromotions, getSemesters } from '../../services/academicService';
import { getTUEsForAttendance, submitAttendance, getAttendanceForTUE } from '../../services/attendanceService';
import AttendanceTable from '../../components/attendance/AttendanceTable';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import { toast } from 'react-toastify';
import { FaSave, FaArrowLeft } from 'react-icons/fa';

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
            setStudents(res.data.students);

            // Initialize attendance data
            const initialAttendance = {};
            res.data.students.forEach(s => {
                initialAttendance[s._id] = {
                    totalSessions: s.attendance?.totalSessions || 0,
                    attendedSessions: s.attendance?.attendedSessions || 0,
                    percentage: s.attendance?.percentage || 0
                };
            });
            setAttendanceData(initialAttendance);
            setSelectedTUE(tue);
        } catch (error) {
            toast.error('Failed to load attendance data');
        } finally {
            setLoading(false);
        }
    };

    const handleAttendanceChange = (studentId, field, value) => {
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
            const updates = Object.keys(attendanceData).map(studentId => ({
                studentId,
                tueId: selectedTUE._id,
                ...attendanceData[studentId]
            }));

            await Promise.all(updates.map(update => submitAttendance(update)));
            toast.success('Attendance saved successfully');
        } catch (error) {
            toast.error('Failed to save attendance');
        } finally {
            setSaving(false);
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
                    <Button
                        onClick={handleSave}
                        isLoading={saving}
                        className="flex items-center"
                    >
                        <FaSave className="mr-2" /> Save Changes
                    </Button>
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
