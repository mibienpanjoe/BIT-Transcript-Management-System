import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getFields, getPromotions, getSemesters, getTUs, createTU, updateTU, deleteTU } from '../../services/academicService';
import Table from '../common/Table';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Input from '../common/Input';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

const TUForm = ({ tu, semesters, onSubmit, onCancel, isLoading }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    useEffect(() => {
        if (tu) {
            reset({ ...tu, semesterId: tu.semesterId?._id || tu.semesterId });
        } else {
            reset({ name: '', semesterId: '', credits: 0 });
        }
    }, [tu, reset]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
                label="TU Name"
                {...register('name', { required: 'Name is required' })}
                error={errors.name}
            />
            {tu && tu.code && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                    <p className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md">{tu.code} (Auto-generated)</p>
                </div>
            )}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <select
                    {...register('semesterId', { required: 'Semester is required' })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                    <option value="">Select Semester</option>
                    {semesters.map(s => (
                        <option key={s._id} value={s._id}>
                            {s.name} - {s.promotionId?.fieldId?.name || '?'} ({s.promotionId?.name || '?'})
                        </option>
                    ))}
                </select>
                {errors.semesterId && <p className="mt-1 text-sm text-red-600">{errors.semesterId.message}</p>}
            </div>
            <Input
                label="Credits"
                type="number"
                {...register('credits', { required: 'Credits is required', min: 1 })}
                error={errors.credits}
            />
            <div className="flex justify-end space-x-3 mt-6">
                <Button variant="secondary" onClick={onCancel} disabled={isLoading}>Cancel</Button>
                <Button type="submit" isLoading={isLoading}>{tu ? 'Update' : 'Create'}</Button>
            </div>
        </form>
    );
};

TUForm.propTypes = {
    tu: PropTypes.object,
    semesters: PropTypes.array.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
};

const TUsManager = () => {
    const [tus, setTus] = useState([]);
    const [fields, setFields] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [modalSemesters, setModalSemesters] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTU, setSelectedTU] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [filterField, setFilterField] = useState('');
    const [filterPromotion, setFilterPromotion] = useState('');
    const [filterSemester, setFilterSemester] = useState('');

    useEffect(() => {
        const loadFields = async () => {
            const res = await getFields();
            setFields(res.data);
        };
        loadFields();
    }, []);

    useEffect(() => {
        const loadPromotions = async () => {
            if (filterField) {
                const res = await getPromotions(filterField);
                setPromotions(res.data);
                // Smart default
                if (res.data.length === 1) {
                    setFilterPromotion(res.data[0]._id);
                }
            } else {
                setPromotions([]);
            }
        };
        loadPromotions();
    }, [filterField]);

    useEffect(() => {
        const loadSemesters = async () => {
            if (filterPromotion) {
                const res = await getSemesters(filterPromotion);
                setSemesters(res.data);
                // Smart default
                if (res.data.length === 1) {
                    setFilterSemester(res.data[0]._id);
                }
            } else {
                setSemesters([]);
            }
        };
        loadSemesters();
    }, [filterPromotion]);

    const fetchTUs = async () => {
        try {
            setIsLoading(true);
            const filters = {};
            if (filterSemester) filters.semesterId = filterSemester;
            else if (filterPromotion) filters.promotionId = filterPromotion;
            else if (filterField) filters.fieldId = filterField;

            const response = await getTUs(filters);
            setTus(response.data);
        } catch (error) {
            toast.error('Failed to fetch TUs');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTUs();
    }, [filterField, filterPromotion, filterSemester]);

    // Load semesters for the modal based on context
    const loadSemestersForModal = async (tu) => {
        try {
            let fieldContext = null;

            // Parse TU code to extract field
            if (tu?.code) {
                const codeMatch = tu.code.match(/TU_L\d+S\d+_([A-Z]+)_\d+/);
                if (codeMatch) {
                    const fieldCode = codeMatch[1];

                    // Fetch all fields
                    const fieldsRes = await getFields();
                    fieldContext = fieldsRes.data.find(f => f.code === fieldCode);

                    if (fieldContext) {
                        // Fetch promotions for this field
                        const promotionsRes = await getPromotions(fieldContext._id);

                        // Fetch semesters for all promotions in this field
                        const semesterPromises = promotionsRes.data.map(promo =>
                            getSemesters({ promotionId: promo._id })
                        );

                        const semesterResults = await Promise.all(semesterPromises);
                        const allFieldSemesters = semesterResults.flatMap(r => r.data);

                        setModalSemesters(allFieldSemesters);

                        toast.info(
                            `Loaded semesters for ${fieldContext.name} only (from TU code)`,
                            { autoClose: 2000 }
                        );
                        return;
                    }
                }
            }

            // Fallback: use filter context
            let res;
            if (filterPromotion) {
                res = await getSemesters({ promotionId: filterPromotion });
            } else if (filterField) {
                const promotionsRes = await getPromotions(filterField);
                const semesterPromises = promotionsRes.data.map(p =>
                    getSemesters({ promotionId: p._id })
                );
                const semesterResults = await Promise.all(semesterPromises);
                res = { data: semesterResults.flatMap(r => r.data) };
            } else {
                res = await getSemesters({});
            }

            setModalSemesters(res.data);
        } catch (error) {
            console.error('Failed to load semesters for modal:', error);
            toast.error('Failed to load semesters');
        }
    };

    const handleEditClick = async (row) => {
        setSelectedTU(row);
        await loadSemestersForModal(row);
        setIsModalOpen(true);
    };

    const handleAddClick = async () => {
        setSelectedTU(null);
        await loadSemestersForModal(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            if (selectedTU) {
                await updateTU(selectedTU._id, data);
                toast.success('TU updated successfully');
            } else {
                await createTU(data);
                toast.success('TU created successfully');
            }
            setIsModalOpen(false);
            fetchTUs();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure? This will delete all associated TUEs.')) {
            try {
                await deleteTU(id);
                toast.success('TU deleted successfully');
                fetchTUs();
            } catch (error) {
                toast.error('Failed to delete TU');
            }
        }
    };

    const columns = [
        { key: 'name', label: 'Name' },
        { key: 'code', label: 'Code' },
        { key: 'credits', label: 'Credits' },
        { key: 'semesterId', label: 'Semester', render: (s) => s?.name || '-' },
    ];

    const actions = (row) => (
        <div className="flex space-x-2 justify-end">
            <button onClick={() => handleEditClick(row)} className="text-blue-600 hover:text-blue-900"><FaEdit /></button>
            <button onClick={() => handleDelete(row._id)} className="text-red-600 hover:text-red-900"><FaTrash /></button>
        </div>
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <div className="flex items-center space-x-4 w-full md:w-auto overflow-x-auto">
                    <select value={filterField} onChange={(e) => { setFilterField(e.target.value); setFilterPromotion(''); setFilterSemester(''); }} className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                        <option value="">Select Field</option>
                        {fields.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                    </select>
                    <select value={filterPromotion} onChange={(e) => { setFilterPromotion(e.target.value); setFilterSemester(''); }} disabled={!filterField} className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                        <option value="">Select Promotion</option>
                        {promotions.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                    <select value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)} disabled={!filterPromotion} className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                        <option value="">Select Semester</option>
                        {semesters.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                </div>
                <Button onClick={handleAddClick} disabled={!filterPromotion && !filterField}><FaPlus className="mr-2" /> Add TU</Button>
            </div>
            {isLoading ? <div className="text-center">Loading...</div> : <Table columns={columns} data={tus} actions={actions} />}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedTU ? 'Edit TU' : 'Add TU'}>
                <TUForm tu={selectedTU} semesters={modalSemesters} onSubmit={handleSubmit} onCancel={() => setIsModalOpen(false)} isLoading={isSubmitting} />
            </Modal>
        </div>
    );
};

export default TUsManager;
