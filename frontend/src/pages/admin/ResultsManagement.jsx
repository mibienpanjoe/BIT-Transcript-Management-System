import { useState, useEffect } from 'react';
import { getFields, getPromotions, getSemesters } from '../../services/academicService';
import { getStudents } from '../../services/studentService';
import { calculateSemesterResults, calculateAnnualResults, generateTranscript } from '../../services/resultService';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import { toast } from 'react-toastify';
import { FaCalculator, FaFilePdf, FaDownload } from 'react-icons/fa';

const ResultsManagement = () => {
    const [fields, setFields] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [students, setStudents] = useState([]);

    const [selectedField, setSelectedField] = useState('');
    const [selectedPromotion, setSelectedPromotion] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);

    useEffect(() => {
        const loadFields = async () => {
            const res = await getFields();
            setFields(res.data);
        };
        loadFields();
    }, []);

    useEffect(() => {
        const loadPromotions = async () => {
            if (selectedField) {
                const res = await getPromotions(selectedField);
                setPromotions(res.data);
            } else {
                setPromotions([]);
            }
        };
        loadPromotions();
    }, [selectedField]);

    useEffect(() => {
        const loadSemesters = async () => {
            if (selectedPromotion) {
                const res = await getSemesters(selectedPromotion);
                setSemesters(res.data);
            } else {
                setSemesters([]);
            }
        };
        loadSemesters();
    }, [selectedPromotion]);

    const fetchStudents = async () => {
        if (!selectedPromotion) return;
        try {
            setIsLoading(true);
            // We fetch students for the promotion. 
            // Ideally we would fetch "results" but since we don't have a dedicated GET results endpoint that is lightweight,
            // we will list students and allow actions per student.
            const res = await getStudents({ promotionId: selectedPromotion });
            setStudents(res.data);
        } catch (error) {
            toast.error('Failed to fetch students');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [selectedPromotion]);

    const handleCalculateSemester = async () => {
        if (!selectedSemester) {
            toast.warning('Please select a semester');
            return;
        }
        if (window.confirm('This will recalculate averages for all students in the selected semester. Continue?')) {
            setIsCalculating(true);
            try {
                await calculateSemesterResults(selectedSemester);
                toast.success('Semester results calculated successfully');
            } catch (error) {
                toast.error('Calculation failed');
            } finally {
                setIsCalculating(false);
            }
        }
    };

    const handleCalculateAnnual = async () => {
        if (!selectedPromotion) {
            toast.warning('Please select a promotion');
            return;
        }
        if (window.confirm('This will recalculate annual averages for all students in the promotion. Continue?')) {
            setIsCalculating(true);
            try {
                await calculateAnnualResults(selectedPromotion);
                toast.success('Annual results calculated successfully');
            } catch (error) {
                toast.error('Calculation failed');
            } finally {
                setIsCalculating(false);
            }
        }
    };

    const handleDownloadTranscript = async (student, type) => {
        try {
            const semesterId = type === 'semester' ? selectedSemester : null;
            if (type === 'semester' && !semesterId) {
                toast.warning('Please select a semester for semester transcript');
                return;
            }

            const blob = await generateTranscript(student._id, semesterId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Transcript_${student.lastName}_${type}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error('Failed to generate transcript');
        }
    };

    const columns = [
        { key: 'studentId', label: 'ID' },
        { key: 'lastName', label: 'Last Name' },
        { key: 'firstName', label: 'First Name' },
        { key: 'status', label: 'Status' },
    ];

    const actions = (row) => (
        <div className="flex space-x-2 justify-end">
            <button
                onClick={() => handleDownloadTranscript(row, 'semester')}
                className="text-blue-600 hover:text-blue-900 flex items-center text-sm disabled:opacity-50"
                disabled={!selectedSemester}
                title="Download Semester Transcript"
            >
                <FaFilePdf className="mr-1" /> Sem
            </button>
            <button
                onClick={() => handleDownloadTranscript(row, 'annual')}
                className="text-green-600 hover:text-green-900 flex items-center text-sm"
                title="Download Annual Transcript"
            >
                <FaFilePdf className="mr-1" /> Ann
            </button>
        </div>
    );

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Results & Transcripts</h1>

            <div className="bg-white p-4 rounded-lg shadow space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                        value={selectedField}
                        onChange={(e) => { setSelectedField(e.target.value); setSelectedPromotion(''); setSelectedSemester(''); }}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        <option value="">Select Field</option>
                        {fields.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                    </select>
                    <select
                        value={selectedPromotion}
                        onChange={(e) => { setSelectedPromotion(e.target.value); setSelectedSemester(''); }}
                        disabled={!selectedField}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        <option value="">Select Promotion</option>
                        {promotions.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                    <select
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        disabled={!selectedPromotion}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        <option value="">Select Semester (Optional for Annual)</option>
                        {semesters.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                </div>

                <div className="flex flex-wrap gap-4 justify-end pt-4 border-t border-gray-100">
                    <Button
                        onClick={handleCalculateSemester}
                        disabled={!selectedSemester || isCalculating}
                        variant="secondary"
                    >
                        <FaCalculator className="mr-2" /> Calculate Semester Results
                    </Button>
                    <Button
                        onClick={handleCalculateAnnual}
                        disabled={!selectedPromotion || isCalculating}
                        variant="primary"
                    >
                        <FaCalculator className="mr-2" /> Calculate Annual Results
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-10">Loading students...</div>
            ) : (
                students.length > 0 && (
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">Students</h2>
                        <Table columns={columns} data={students} actions={actions} />
                    </div>
                )
            )}
        </div>
    );
};

export default ResultsManagement;
