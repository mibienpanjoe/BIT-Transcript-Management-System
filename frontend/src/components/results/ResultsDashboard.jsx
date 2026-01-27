import React, { useState, useEffect } from 'react';
import { FaFilePdf, FaList, FaTable } from 'react-icons/fa';
import api from '../../services/api';
import TranscriptGenerationDialog from './TranscriptGenerationDialog';
import AnnualResultsTable from './AnnualResultsTable';
import { toast } from 'react-toastify';
import { bulkGenerateTranscripts } from '../../services/transcriptService';

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

    const [academicYears, setAcademicYears] = useState(generateAcademicYears());
    const [academicYear, setAcademicYear] = useState(academicYears[2]); // Default to current year

    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);

    const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());
    const [selectAllPromotion, setSelectAllPromotion] = useState(false);
    const [bulkGenerating, setBulkGenerating] = useState(false);
    const [language, setLanguage] = useState('en');

    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('students'); // 'students' or 'results'

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const selectedPromotionName = promotions.find((promo) => promo._id === selectedPromotion)?.name || 'None';
    const selectedSummary = selectAllPromotion
        ? 'All in promotion'
        : selectedStudentIds.size;
    const languageLabel = language === 'fr' ? 'French' : 'English';
    const searchLabel = search ? `Filtered: "${search}"` : null;

    useEffect(() => {
        fetchPromotions();
    }, []);

    useEffect(() => {
        if (selectedPromotion) {
            fetchStudents(selectedPromotion);
        }
    }, [selectedPromotion, academicYear, search, page]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchInput]);

    useEffect(() => {
        setPage(1);
        setSelectedStudentIds(new Set());
        setSelectAllPromotion(false);
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
            const response = await api.get('/students', {
                params: {
                    promotionId,
                    academicYear,
                    search: search || undefined,
                    page,
                    limit
                }
            });
            const payload = response.data;
            setStudents(payload.data || []);
            setTotal(payload.total || payload.count || 0);
            setPages(payload.pages || 1);
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Failed to load students for this promotion.');
        } finally {
            setLoading(false);
        }
    };

    const toggleStudentSelection = (studentId) => {
        setSelectedStudentIds((prev) => {
            const next = new Set(prev);
            if (next.has(studentId)) {
                next.delete(studentId);
            } else {
                next.add(studentId);
            }
            return next;
        });
        setSelectAllPromotion(false);
    };

    const toggleSelectAllPage = () => {
        setSelectedStudentIds((prev) => {
            const next = new Set(prev);
            const allSelected = students.length > 0 && students.every((student) => next.has(student._id));
            if (allSelected) {
                students.forEach((student) => next.delete(student._id));
            } else {
                students.forEach((student) => next.add(student._id));
            }
            return next;
        });
        setSelectAllPromotion(false);
    };

    const handleSelectAllPromotion = () => {
        setSelectAllPromotion((prev) => {
            const next = !prev;
            if (next) {
                setSelectedStudentIds(new Set());
            }
            return next;
        });
    };

    const handleBulkGenerate = async () => {
        if (!selectedPromotion || !academicYear) {
            toast.error('Select a promotion and academic year first.');
            return;
        }

        if (!selectAllPromotion && selectedStudentIds.size === 0) {
            toast.info('Select at least one student.');
            return;
        }

        const confirmMessage = selectAllPromotion
            ? `Generate transcripts for all ${total || 'selected'} students in this promotion?`
            : `Generate transcripts for ${selectedStudentIds.size} selected students?`;

        if (!window.confirm(confirmMessage)) {
            return;
        }

        setBulkGenerating(true);
        try {
            const payload = selectAllPromotion
                ? { promotionId: selectedPromotion, academicYear, lang: language }
                : { studentIds: Array.from(selectedStudentIds), academicYear, lang: language };

            const response = await bulkGenerateTranscripts(payload);
            const blob = new Blob([response.data], { type: 'application/zip' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `transcripts_${selectedPromotion}_${academicYear}_${language}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Bulk transcripts generated.');
        } catch (error) {
            console.error('Bulk transcript error:', error);
            toast.error(error.response?.data?.message || 'Failed to generate transcripts.');
        } finally {
            setBulkGenerating(false);
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

            <div
                className="sticky top-0 z-20 mb-6 rounded-lg border border-gray-200 bg-white/95 px-4 py-3 text-sm text-gray-700 shadow-sm backdrop-blur"
                aria-live="polite"
            >
                <div className="flex flex-wrap items-center gap-3">
                    <span className="font-medium">Promotion:</span>
                    <span>{selectedPromotion ? selectedPromotionName : 'Select promotion'}</span>
                    <span className="text-gray-300">|</span>
                    <span className="font-medium">Year:</span>
                    <span>{academicYear}</span>
                    <span className="text-gray-300">|</span>
                    <span className="font-medium">Selected:</span>
                    <span>{selectedPromotion ? selectedSummary : '—'}</span>
                    <span className="text-gray-300">|</span>
                    <span className="font-medium">Language:</span>
                    <span>{languageLabel}</span>
                    {searchLabel && (
                        <>
                            <span className="text-gray-300">|</span>
                            <span className="font-medium">{searchLabel}</span>
                        </>
                    )}
                    {bulkGenerating && (
                        <>
                            <span className="text-gray-300">|</span>
                            <span className="font-medium text-blue-700">Generating…</span>
                        </>
                    )}
                </div>
            </div>

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
                            onChange={(e) => {
                                const promoId = e.target.value;
                                setSelectedPromotion(promoId);
                                setPage(1);
                                const selected = promotions.find((promo) => promo._id === promoId);
                                if (selected?.academicYear) {
                                    setAcademicYears((prev) => (
                                        prev.includes(selected.academicYear)
                                            ? prev
                                            : [...prev, selected.academicYear]
                                    ));
                                    setAcademicYear(selected.academicYear);
                                }
                            }}
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
                    <div className="flex flex-col gap-4 border-b border-gray-200 p-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by name or ID"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="w-64 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={toggleSelectAllPage}
                                    className="rounded-md border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                    disabled={students.length === 0 || selectAllPromotion}
                                >
                                    {students.length > 0 && students.every((student) => selectedStudentIds.has(student._id))
                                        ? 'Unselect page'
                                        : 'Select page'}
                                </button>
                                <button
                                    onClick={handleSelectAllPromotion}
                                    className={`rounded-md border px-3 py-2 text-xs font-medium ${selectAllPromotion ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                    disabled={!selectedPromotion}
                                >
                                    {selectAllPromotion ? 'All promotion selected' : 'Select all in promotion'}
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="text-sm text-gray-600">
                                {selectAllPromotion
                                    ? 'Selected: all in promotion'
                                    : `Selected: ${selectedStudentIds.size}`}
                            </div>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700"
                            >
                                <option value="en">English</option>
                                <option value="fr">French</option>
                            </select>
                            <button
                                onClick={handleBulkGenerate}
                                disabled={bulkGenerating || (!selectAllPromotion && selectedStudentIds.size === 0)}
                                className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {bulkGenerating ? 'Generating...' : 'Generate ZIP'}
                            </button>
                        </div>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <input
                                        type="checkbox"
                                        checked={students.length > 0 && students.every((student) => selectedStudentIds.has(student._id))}
                                        onChange={toggleSelectAllPage}
                                        disabled={students.length === 0 || selectAllPromotion}
                                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration No.</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {students.map((student) => (
                                <tr key={student._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <input
                                            type="checkbox"
                                            checked={selectedStudentIds.has(student._id)}
                                            onChange={() => toggleStudentSelection(student._id)}
                                            disabled={selectAllPromotion}
                                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </td>
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
                                    <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500">
                                        {selectedPromotion ? 'No students found' : 'Select a promotion to view students'}
                                    </td>
                                </tr>
                            )}
                            {loading && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500">
                                        Loading...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {selectedPromotion && pages > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 text-sm text-gray-600">
                            <span>
                                Page {page} of {pages} • {total} students
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={page === 1}
                                    className="rounded-md border border-gray-300 px-3 py-1 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage((prev) => Math.min(prev + 1, pages))}
                                    disabled={page === pages}
                                    className="rounded-md border border-gray-300 px-3 py-1 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
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
                language={language}
                onLanguageChange={setLanguage}
            />
        </div>
    );
};

export default ResultsDashboard;
