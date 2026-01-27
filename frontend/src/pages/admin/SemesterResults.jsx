import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const generateAcademicYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = -2; i <= 1; i++) {
        const year = currentYear + i;
        years.push(`${year}-${year + 1}`);
    }
    return years;
};

const SemesterResults = () => {
    const [promotions, setPromotions] = useState([]);
    const [semesters, setSemesters] = useState([]);

    const [academicYears] = useState(generateAcademicYears());
    const [academicYear, setAcademicYear] = useState(academicYears[2]);
    const [selectedPromotion, setSelectedPromotion] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedFieldName, setSelectedFieldName] = useState('');

    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [downloadingExcel, setDownloadingExcel] = useState(false);

    useEffect(() => {
        const loadPromotions = async () => {
            setLoading(true);
            try {
                const response = await api.get('/promotions');
                const data = response.data.data || response.data;
                setPromotions(data);
            } catch (error) {
                console.error('Failed to load promotions:', error);
                toast.error('Failed to load promotions.');
            } finally {
                setLoading(false);
            }
        };

        loadPromotions();
    }, []);

    useEffect(() => {
        const loadSemesters = async () => {
            if (!selectedPromotion) {
                setSemesters([]);
                setSelectedSemester('');
                setSelectedFieldName('');
                return;
            }

            setLoading(true);
            try {
                const response = await api.get('/semesters', {
                    params: { promotionId: selectedPromotion }
                });
                const data = response.data.data || response.data;
                setSemesters(data);
            } catch (error) {
                console.error('Failed to load semesters:', error);
                toast.error('Failed to load semesters.');
            } finally {
                setLoading(false);
            }
        };

        loadSemesters();
    }, [selectedPromotion]);

    const handleDownloadPdf = async () => {
        if (!selectedPromotion || !selectedSemester || !academicYear) {
            toast.error('Select promotion, semester, and academic year first.');
            return;
        }

        setDownloading(true);
        try {
            const response = await api.post('/semesters/results/pdf', {
                promotionId: selectedPromotion,
                semesterId: selectedSemester,
                academicYear
            }, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `semester_results_${selectedPromotion}_${academicYear}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Semester results PDF downloaded.');
        } catch (error) {
            console.error('Semester results PDF error:', error);
            toast.error(error.response?.data?.message || 'Failed to generate PDF.');
        } finally {
            setDownloading(false);
        }
    };

    const handleDownloadExcel = async () => {
        if (!selectedPromotion || !selectedSemester || !academicYear) {
            toast.error('Select promotion, semester, and academic year first.');
            return;
        }

        setDownloadingExcel(true);
        try {
            const response = await api.post('/semesters/results/excel', {
                promotionId: selectedPromotion,
                semesterId: selectedSemester,
                academicYear
            }, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `semester_results_${selectedPromotion}_${academicYear}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Semester results Excel downloaded.');
        } catch (error) {
            console.error('Semester results Excel error:', error);
            toast.error(error.response?.data?.message || 'Failed to generate Excel.');
        } finally {
            setDownloadingExcel(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Semester Results</h1>

            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Promotion</label>
                        <select
                            value={selectedPromotion}
                            onChange={(e) => {
                                const promoId = e.target.value;
                                setSelectedPromotion(promoId);
                                setSelectedSemester('');
                                const selected = promotions.find((promo) => promo._id === promoId);
                                if (selected) {
                                    setAcademicYear(selected.academicYear || academicYear);
                                    setSelectedFieldName(selected.fieldId?.name || '');
                                }
                            }}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                            disabled={loading}
                        >
                            <option value="">Select Promotion</option>
                            {promotions.map((promo) => (
                                <option key={promo._id} value={promo._id}>
                                    {promo.name} ({promo.academicYear})
                                </option>
                            ))}
                        </select>
                        {selectedPromotion && (
                            <p className="mt-2 text-xs text-gray-500">
                                Field: {selectedFieldName || '—'} · Academic Year: {academicYear}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                        <select
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                            disabled={!selectedPromotion || loading}
                        >
                            <option value="">Select Semester</option>
                            {semesters.map((semester) => (
                                <option key={semester._id} value={semester._id}>{semester.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-4">
                <button
                    onClick={handleDownloadPdf}
                    disabled={downloading}
                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                >
                    {downloading ? 'Preparing PDF...' : 'Download PDF'}
                </button>
                <button
                    onClick={handleDownloadExcel}
                    disabled={downloadingExcel}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                    {downloadingExcel ? 'Preparing Excel...' : 'Download Excel'}
                </button>
                <span className="text-sm text-gray-500 self-center">PDF export is generated in English.</span>
            </div>
        </div>
    );
};

export default SemesterResults;
