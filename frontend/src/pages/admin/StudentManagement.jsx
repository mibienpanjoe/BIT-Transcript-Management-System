import { useState, useEffect } from 'react';
import { getStudents, createStudent, updateStudent, deleteStudent, importStudents } from '../../services/studentService';
import { getFields, getPromotions } from '../../services/academicService';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StudentForm from '../../components/students/StudentForm';
import { FaEdit, FaTrash, FaPlus, FaFileImport, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';

const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filters
    const [fields, setFields] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [selectedField, setSelectedField] = useState('');
    const [selectedPromotion, setSelectedPromotion] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Import file
    const [importFile, setImportFile] = useState(null);
    const [importFieldId, setImportFieldId] = useState('');
    const [importPromotionId, setImportPromotionId] = useState('');
    const [importAcademicYear, setImportAcademicYear] = useState('2023-2024');
    const [importPromotions, setImportPromotions] = useState([]);

    const fetchStudents = async () => {
        try {
            setIsLoading(true);
            const params = {};
            if (selectedField) params.fieldId = selectedField;
            if (selectedPromotion) params.promotionId = selectedPromotion;
            if (searchQuery) params.search = searchQuery;

            const response = await getStudents(params);
            setStudents(response.data);
        } catch (error) {
            toast.error('Failed to fetch students');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const loadFilters = async () => {
            try {
                const fieldsData = await getFields();
                setFields(fieldsData.data || []);
            } catch (error) {
                console.error(error);
            }
        };
        loadFilters();
    }, []);

    useEffect(() => {
        const loadPromotions = async () => {
            if (selectedField) {
                try {
                    const promoData = await getPromotions(selectedField);
                    setPromotions(promoData.data || []);
                } catch (error) {
                    console.error(error);
                }
            } else {
                setPromotions([]);
            }
        };
        loadPromotions();
    }, [selectedField]);

    useEffect(() => {
        const loadImportPromotions = async () => {
            if (importFieldId) {
                try {
                    const promoData = await getPromotions(importFieldId);
                    setImportPromotions(promoData.data || []);
                } catch (error) {
                    console.error(error);
                }
            } else {
                setImportPromotions([]);
            }
        };
        loadImportPromotions();
    }, [importFieldId]);

    useEffect(() => {
        fetchStudents();
    }, [selectedField, selectedPromotion]); // Re-fetch when filters change

    const handleSearch = (e) => {
        e.preventDefault();
        fetchStudents();
    };

    const handleCreate = () => {
        setSelectedStudent(null);
        setIsModalOpen(true);
    };

    const handleEdit = (student) => {
        setSelectedStudent(student);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to deactivate this student?')) {
            try {
                await deleteStudent(id);
                toast.success('Student deactivated successfully');
                fetchStudents();
            } catch (error) {
                toast.error('Failed to deactivate student');
                console.error(error);
            }
        }
    };

    const handleSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            if (selectedStudent) {
                await updateStudent(selectedStudent._id, data);
                toast.success('Student updated successfully');
            } else {
                await createStudent(data);
                toast.success('Student created successfully');
            }
            setIsModalOpen(false);
            fetchStudents();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImport = async (e) => {
        e.preventDefault();
        if (!importFile || !importFieldId || !importPromotionId || !importAcademicYear) {
            toast.error("Please select a file and fill in all fields");
            return;
        }

        const formData = new FormData();
        formData.append('file', importFile);
        formData.append('fieldId', importFieldId);
        formData.append('promotionId', importPromotionId);
        formData.append('academicYear', importAcademicYear);

        setIsSubmitting(true);
        try {
            await importStudents(formData);
            toast.success('Students imported successfully');
            setIsImportModalOpen(false);
            fetchStudents();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Import failed');
            console.error(error);
        } finally {
            setIsSubmitting(false);
            setImportFile(null);
            // Reset form but keep academic year
            setImportFieldId('');
            setImportPromotionId('');
        }
    };

    const columns = [
        { key: 'studentId', label: 'ID' },
        { key: 'firstName', label: 'First Name' },
        { key: 'lastName', label: 'Last Name' },
        {
            key: 'fieldId',
            label: 'Field',
            render: (field) => field?.name || '-'
        },
        {
            key: 'promotionId',
            label: 'Promotion',
            render: (promo) => promo?.name || '-'
        },
        { key: 'academicYear', label: 'Year' },
        {
            key: 'isActive',
            label: 'Status',
            render: (isActive) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
            )
        }
    ];

    const actions = (row) => (
        <div className="flex space-x-2 justify-end">
            <button
                onClick={() => handleEdit(row)}
                className="text-blue-600 hover:text-blue-900"
                title="Edit"
            >
                <FaEdit />
            </button>
            {row.isActive && (
                <button
                    onClick={() => handleDelete(row._id)}
                    className="text-red-600 hover:text-red-900"
                    title="Deactivate"
                >
                    <FaTrash />
                </button>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
                <div className="flex space-x-2">
                    <Button variant="secondary" onClick={() => setIsImportModalOpen(true)}>
                        <FaFileImport className="mr-2" /> Import Excel
                    </Button>
                    <Button onClick={handleCreate}>
                        <FaPlus className="mr-2" /> Add Student
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col md:flex-row gap-4 items-end">
                <div className="w-full md:w-1/4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
                    <select
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={selectedField}
                        onChange={(e) => {
                            setSelectedField(e.target.value);
                            setSelectedPromotion('');
                        }}
                    >
                        <option value="">All Fields</option>
                        {fields.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                    </select>
                </div>
                <div className="w-full md:w-1/4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Promotion</label>
                    <select
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={selectedPromotion}
                        onChange={(e) => setSelectedPromotion(e.target.value)}
                        disabled={!selectedField}
                    >
                        <option value="">All Promotions</option>
                        {promotions.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                </div>
                <div className="w-full md:w-1/3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <form onSubmit={handleSearch} className="flex">
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            className="block w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700">
                            <FaSearch />
                        </button>
                    </form>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <Table
                    columns={columns}
                    data={students}
                    actions={actions}
                />
            )}

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedStudent ? 'Edit Student' : 'Create New Student'}
            >
                <StudentForm
                    student={selectedStudent}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsModalOpen(false)}
                    isLoading={isSubmitting}
                />
            </Modal>

            {/* Import Modal */}
            <Modal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                title="Import Students from Excel"
            >
                <form onSubmit={handleImport} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
                        <select
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={importFieldId}
                            onChange={(e) => {
                                setImportFieldId(e.target.value);
                                setImportPromotionId('');
                            }}
                            required
                        >
                            <option value="">Select Field</option>
                            {fields.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Promotion</label>
                        <select
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={importPromotionId}
                            onChange={(e) => setImportPromotionId(e.target.value)}
                            disabled={!importFieldId}
                            required
                        >
                            <option value="">Select Promotion</option>
                            {importPromotions.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                        <input
                            type="text"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={importAcademicYear}
                            onChange={(e) => setImportAcademicYear(e.target.value)}
                            placeholder="e.g. 2023-2024"
                            required
                        />
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                        <input
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            onChange={(e) => setImportFile(e.target.files[0])}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="text-xs text-gray-500 mt-2">Supported formats: .xlsx, .xls, .csv</p>
                    </div>
                    <div className="flex justify-end space-x-3">
                        <Button variant="secondary" onClick={() => setIsImportModalOpen(false)}>Cancel</Button>
                        <Button type="submit" isLoading={isSubmitting} disabled={!importFile}>Import</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default StudentManagement;
