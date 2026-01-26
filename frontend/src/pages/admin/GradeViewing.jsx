import React, { useState, useEffect } from 'react';
import { getFields, getPromotions, getSemesters, getTUs, getTUEs } from '../../services/academicService';
import { getGradesForTUE, submitGrade } from '../../services/gradeService';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import { formatGrade } from '../../utils/formatters';
import { toast } from 'react-toastify';
import { FaSave } from 'react-icons/fa';

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
                <div className="w-20 h-12 bg-gray-100 rounded"></div>
            </div>
        ))}
    </div>
);

const GradeViewing = () => {
    const [fields, setFields] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [tus, setTus] = useState([]);
    const [tues, setTues] = useState([]);
    const [gradeData, setGradeData] = useState(null);
    const [editedGrades, setEditedGrades] = useState({});
    const [recentlySaved, setRecentlySaved] = useState(new Set());

    const [selectedField, setSelectedField] = useState('');
    const [selectedPromotion, setSelectedPromotion] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedTU, setSelectedTU] = useState('');
    const [selectedTUE, setSelectedTUE] = useState('');

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

    // Auto-select single promotion
    useEffect(() => {
        if (promotions.length === 1 && !selectedPromotion) {
            setSelectedPromotion(promotions[0]._id);
        }
    }, [promotions]);

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

    // Auto-select single semester
    useEffect(() => {
        if (semesters.length === 1 && !selectedSemester) {
            setSelectedSemester(semesters[0]._id);
        }
    }, [semesters]);

    useEffect(() => {
        const loadTUs = async () => {
            if (!selectedSemester) {
                setTus([]);
                return;
            }
            try {
                const res = await getTUs(selectedSemester);
                setTus(res.data);
            } catch (error) {
                toast.error('Failed to load TUs');
            }
        };
        loadTUs();
    }, [selectedSemester]);

    // Auto-select single TU
    useEffect(() => {
        if (tus.length === 1 && !selectedTU) {
            setSelectedTU(tus[0]._id);
        }
    }, [tus]);

    useEffect(() => {
        const loadTUEs = async () => {
            if (!selectedTU) {
                setTues([]);
                return;
            }
            try {
                const res = await getTUEs(selectedTU);
                setTues(res.data);
            } catch (error) {
                toast.error('Failed to load TUEs');
            }
        };
        loadTUEs();
    }, [selectedTU]);

    // Auto-select single TUE
    useEffect(() => {
        if (tues.length === 1 && !selectedTUE) {
            setSelectedTUE(tues[0]._id);
        }
    }, [tues]);

    useEffect(() => {
        const loadGrades = async () => {
            if (!selectedTUE) {
                setGradeData(null);
                setEditedGrades({});
                return;
            }
            try {
                setLoading(true);
                const res = await getGradesForTUE(selectedTUE);
                setGradeData(res.data);
                setEditedGrades({});
            } catch (error) {
                toast.error('Failed to load grades');
            } finally {
                setLoading(false);
            }
        };
        loadGrades();
    }, [selectedTUE]);

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
        if (value === '' || value === null || value === undefined) return true;
        const num = parseFloat(value);
        return !isNaN(num) && num >= 0 && num <= 20;
    };

    const hasInvalidGrades = () => {
        return Object.values(editedGrades).some(grades =>
            (grades.presence !== undefined && !validateGrade(grades.presence)) ||
            (grades.participation !== undefined && !validateGrade(grades.participation)) ||
            (grades.evaluation !== undefined && !validateGrade(grades.evaluation))
        );
    };

    const getInputClassName = (value) => {
        const baseClasses = "w-20 rounded-md shadow-sm sm:text-sm";
        const parsedValue = parseFloat(value);

        if (value === '' || value === null || value === undefined) {
            return `${baseClasses} border-gray-300 focus:ring-blue-500 focus:border-blue-500`;
        }

        if (isNaN(parsedValue) || parsedValue < 0 || parsedValue > 20) {
            return `${baseClasses} border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50`;
        }

        return `${baseClasses} border-green-300 focus:ring-green-500 focus:border-green-500`;
    };

    const calculateStatistics = () => {
        if (!gradeData?.students?.length) return null;

        const validGrades = gradeData.students
            .map(s => s.grade?.finalGrade)
            .filter(g => g !== null && g !== undefined);

        if (validGrades.length === 0) return null;

        const average = validGrades.reduce((sum, g) => sum + g, 0) / validGrades.length;
        const passRate = (validGrades.filter(g => g >= 10).length / validGrades.length) * 100;
        const highest = Math.max(...validGrades);
        const lowest = Math.min(...validGrades);

        return { average, passRate, highest, lowest, total: validGrades.length };
    };

    const handleSaveAll = async () => {
        if (Object.keys(editedGrades).length === 0) {
            toast.info('No changes to save');
            return;
        }

        if (hasInvalidGrades()) {
            toast.error('Please fix invalid grades before saving (must be between 0 and 20)');
            return;
        }

        setSaving(true);
        try {
            const promises = Object.entries(editedGrades).map(([studentId, changes]) => {
                const student = gradeData.students.find(s => s.student._id === studentId);
                const payload = {
                    studentId,
                    tueId: selectedTUE,
                    presence: changes.presence !== undefined
                        ? changes.presence
                        : student?.grade?.presence || 0,
                    participation: changes.participation !== undefined
                        ? changes.participation
                        : student?.grade?.participation || 0,
                    evaluation: changes.evaluation !== undefined
                        ? changes.evaluation
                        : student?.grade?.evaluation || 0,
                    academicYear: new Date().getFullYear().toString()
                };
                return submitGrade(payload);
            });

            await Promise.all(promises);
            toast.success('All grades saved successfully');

            // Reload grades
            const res = await getGradesForTUE(selectedTUE);
            setGradeData(res.data);
            setEditedGrades({});

            // Highlight saved rows
            const savedIds = Object.keys(editedGrades);
            setRecentlySaved(new Set(savedIds));
            setTimeout(() => setRecentlySaved(new Set()), 3000);
        } catch (error) {
            toast.error('Failed to save some grades');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const hasChanges = Object.keys(editedGrades).length > 0;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Grade Management</h1>
                {hasChanges && (
                    <Button
                        onClick={handleSaveAll}
                        isLoading={saving}
                        className="flex items-center"
                    >
                        <FaSave className="mr-2" /> Save All Changes
                    </Button>
                )}
            </div>

            <div className="bg-white p-4 rounded-lg shadow space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Select
                        label="Field"
                        name="field"
                        value={selectedField}
                        onChange={(e) => {
                            setSelectedField(e.target.value);
                            setSelectedPromotion('');
                            setSelectedSemester('');
                            setSelectedTU('');
                            setSelectedTUE('');
                        }}
                        options={fields.map(f => ({ value: f._id, label: f.name }))}
                    />

                    <Select
                        label="Promotion"
                        name="promotion"
                        value={selectedPromotion}
                        onChange={(e) => {
                            setSelectedPromotion(e.target.value);
                            setSelectedSemester('');
                            setSelectedTU('');
                            setSelectedTUE('');
                        }}
                        options={promotions.map(p => ({ value: p._id, label: p.name }))}
                        disabled={!selectedField}
                    />

                    <Select
                        label="Semester"
                        name="semester"
                        value={selectedSemester}
                        onChange={(e) => {
                            setSelectedSemester(e.target.value);
                            setSelectedTU('');
                            setSelectedTUE('');
                        }}
                        options={semesters.map(s => ({ value: s._id, label: s.name }))}
                        disabled={!selectedPromotion}
                    />

                    <Select
                        label="Teaching Unit (TU)"
                        name="tu"
                        value={selectedTU}
                        onChange={(e) => {
                            setSelectedTU(e.target.value);
                            setSelectedTUE('');
                        }}
                        options={tus.map(tu => ({ value: tu._id, label: `${tu.code} - ${tu.name}` }))}
                        disabled={!selectedSemester}
                    />

                    <Select
                        label="Teaching Unit Element (TUE)"
                        name="tue"
                        value={selectedTUE}
                        onChange={(e) => setSelectedTUE(e.target.value)}
                        options={tues.map(tue => ({ value: tue._id, label: `${tue.code} - ${tue.name}` }))}
                        disabled={!selectedTU}
                    />
                </div>
            </div>

            {loading && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <GradeTableSkeleton />
                </div>
            )}

            {!loading && gradeData && (
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {gradeData.tue?.name} ({gradeData.tue?.code})
                                </h2>
                                <p className="text-sm text-gray-600">
                                    Credits: {gradeData.tue?.credits} | Coefficient: {gradeData.tue?.coefficient}
                                </p>
                            </div>

                            {/* Class Statistics Summary */}
                            {(() => {
                                const stats = calculateStatistics();
                                if (!stats) return null;
                                return (
                                    <div className="flex space-x-4 text-sm">
                                        <div className="bg-blue-50 px-3 py-1 rounded border border-blue-100">
                                            <span className="text-blue-600 font-medium">Avg:</span>
                                            <span className="ml-1 font-bold text-blue-800">{formatGrade(stats.average)}</span>
                                        </div>
                                        <div className="bg-green-50 px-3 py-1 rounded border border-green-100">
                                            <span className="text-green-600 font-medium">Pass:</span>
                                            <span className="ml-1 font-bold text-green-800">{stats.passRate.toFixed(0)}%</span>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    <div className="overflow-x-auto max-h-[600px]">
                        <table className="min-w-full divide-y divide-gray-200 relative">
                            <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Student ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
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
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {gradeData.students?.map((item) => (
                                    <tr
                                        key={item.student._id}
                                        className={`hover:bg-gray-50 ${recentlySaved.has(item.student._id) ? 'bg-green-50 transition-colors duration-500' : ''}`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {item.student.studentId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.student.lastName} {item.student.firstName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            <input
                                                type="number"
                                                min="0"
                                                max="20"
                                                step="0.01"
                                                className={getInputClassName(getDisplayValue(item.student._id, 'presence', item.grade?.presence))}
                                                value={getDisplayValue(item.student._id, 'presence', item.grade?.presence)}
                                                onChange={(e) => handleGradeChange(item.student._id, 'presence', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            <input
                                                type="number"
                                                min="0"
                                                max="20"
                                                step="0.01"
                                                className={getInputClassName(getDisplayValue(item.student._id, 'participation', item.grade?.participation))}
                                                value={getDisplayValue(item.student._id, 'participation', item.grade?.participation)}
                                                onChange={(e) => handleGradeChange(item.student._id, 'participation', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            <input
                                                type="number"
                                                min="0"
                                                max="20"
                                                step="0.01"
                                                className={getInputClassName(getDisplayValue(item.student._id, 'evaluation', item.grade?.evaluation))}
                                                value={getDisplayValue(item.student._id, 'evaluation', item.grade?.evaluation)}
                                                onChange={(e) => handleGradeChange(item.student._id, 'evaluation', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                            {formatGrade(item.grade?.finalGrade)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {gradeData.students?.length === 0 && (
                        <div className="px-6 py-8 text-center">
                            <Alert type="info" message="No students enrolled in this TUE" />
                        </div>
                    )}
                </div>
            )}

            {!loading && !gradeData && selectedTUE && (
                <Alert type="info" message="Select filters to view grades" />
            )}
        </div>
    );
};

export default GradeViewing;
