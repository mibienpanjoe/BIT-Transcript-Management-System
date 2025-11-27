import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getFields, getPromotions, getSemesters, createSemester, updateSemester, deleteSemester } from '../../services/academicService';
import Table from '../common/Table';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Input from '../common/Input';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

const SemesterForm = ({ semester, promotions, onSubmit, onCancel, isLoading }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    useEffect(() => {
        if (semester) {
            reset({ ...semester, promotionId: semester.promotionId?._id || semester.promotionId });
        } else {
            reset({ name: '', promotionId: '', level: 'L1', order: 1 });
        }
    }, [semester, reset]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
                label="Semester Name (e.g., S1, S2)"
                {...register('name', { required: 'Name is required' })}
                error={errors.name}
            />
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Promotion</label>
                <select
                    {...register('promotionId', { required: 'Promotion is required' })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                    <option value="">Select Promotion</option>
                    {promotions.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
                {errors.promotionId && <p className="mt-1 text-sm text-red-600">{errors.promotionId.message}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <select
                    {...register('level', { required: 'Level is required' })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                    <option value="L1">Licence 1</option>
                    <option value="L2">Licence 2</option>
                    <option value="L3">Licence 3</option>
                    <option value="M1">Master 1</option>
                    <option value="M2">Master 2</option>
                </select>
            </div>
            <Input
                label="Order (1-6)"
                type="number"
                placeholder="e.g., 1 for S1, 2 for S2"
                {...register('order', {
                    required: 'Order is required',
                    min: { value: 1, message: 'Order must be between 1 and 6' },
                    max: { value: 6, message: 'Order must be between 1 and 6' },
                    valueAsNumber: true
                })}
                error={errors.order}
            />
            <div className="flex justify-end space-x-3 mt-6">
                <Button variant="secondary" onClick={onCancel} disabled={isLoading}>Cancel</Button>
                <Button type="submit" isLoading={isLoading}>{semester ? 'Update' : 'Create'}</Button>
            </div>
        </form>
    );
};

SemesterForm.propTypes = {
    semester: PropTypes.object,
    promotions: PropTypes.array.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
};

const SemestersManager = () => {
    const [semesters, setSemesters] = useState([]);
    const [fields, setFields] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [filterField, setFilterField] = useState('');
    const [filterPromotion, setFilterPromotion] = useState('');

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
            } else {
                setPromotions([]);
            }
        };
        loadPromotions();
    }, [filterField]);

    const fetchSemesters = async () => {
        try {
            setIsLoading(true);
            const response = await getSemesters(filterPromotion);
            setSemesters(response.data);
        } catch (error) {
            toast.error('Failed to fetch semesters');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSemesters();
    }, [filterPromotion]);

    const handleSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            if (selectedSemester) {
                await updateSemester(selectedSemester._id, data);
                toast.success('Semester updated successfully');
            } else {
                await createSemester(data);
                toast.success('Semester created successfully');
            }
            setIsModalOpen(false);
            fetchSemesters();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure? This will delete all associated TUs.')) {
            try {
                await deleteSemester(id);
                toast.success('Semester deleted successfully');
                fetchSemesters();
            } catch (error) {
                toast.error('Failed to delete semester');
            }
        }
    };

    const columns = [
        { key: 'name', label: 'Name' },
        { key: 'promotionId', label: 'Promotion', render: (p) => p?.name || '-' },
        { key: 'level', label: 'Level' },
        { key: 'order', label: 'Order' },
    ];

    const actions = (row) => (
        <div className="flex space-x-2 justify-end">
            <button onClick={() => { setSelectedSemester(row); setIsModalOpen(true); }} className="text-blue-600 hover:text-blue-900"><FaEdit /></button>
            <button onClick={() => handleDelete(row._id)} className="text-red-600 hover:text-red-900"><FaTrash /></button>
        </div>
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <div className="flex items-center space-x-4 w-full md:w-auto">
                    <select
                        value={filterField}
                        onChange={(e) => { setFilterField(e.target.value); setFilterPromotion(''); }}
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                    >
                        <option value="">Select Field</option>
                        {fields.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                    </select>
                    <select
                        value={filterPromotion}
                        onChange={(e) => setFilterPromotion(e.target.value)}
                        disabled={!filterField}
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                    >
                        <option value="">Select Promotion</option>
                        {promotions.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                </div>
                <Button onClick={() => { setSelectedSemester(null); setIsModalOpen(true); }} disabled={!filterPromotion}><FaPlus className="mr-2" /> Add Semester</Button>
            </div>
            {isLoading ? <div className="text-center">Loading...</div> : <Table columns={columns} data={semesters} actions={actions} />}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedSemester ? 'Edit Semester' : 'Add Semester'}>
                <SemesterForm semester={selectedSemester} promotions={promotions} onSubmit={handleSubmit} onCancel={() => setIsModalOpen(false)} isLoading={isSubmitting} />
            </Modal>
        </div>
    );
};

export default SemestersManager;
