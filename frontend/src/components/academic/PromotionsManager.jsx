import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getFields, getPromotions, createPromotion, updatePromotion, deletePromotion } from '../../services/academicService';
import Table from '../common/Table';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Input from '../common/Input';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

const PromotionForm = ({ promotion, fields, onSubmit, onCancel, isLoading }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    useEffect(() => {
        if (promotion) {
            reset({ ...promotion, fieldId: promotion.fieldId?._id || promotion.fieldId });
        } else {
            reset({ name: '', fieldId: '', level: '', academicYear: '' });
        }
    }, [promotion, reset]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
                label="Promotion Name"
                {...register('name', { required: 'Name is required' })}
                error={errors.name}
            />
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
                <select
                    {...register('fieldId', { required: 'Field is required' })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                    <option value="">Select Field</option>
                    {fields.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                </select>
                {errors.fieldId && <p className="mt-1 text-sm text-red-600">{errors.fieldId.message}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <select
                    {...register('level', { required: 'Level is required' })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                    <option value="">Select Level</option>
                    <option value="L1">L1</option>
                    <option value="L2">L2</option>
                    <option value="L3">L3</option>
                    <option value="M1">M1</option>
                    <option value="M2">M2</option>
                </select>
                {errors.level && <p className="mt-1 text-sm text-red-600">{errors.level.message}</p>}
            </div>
            <Input
                label="Academic Year"
                placeholder="e.g., 2023-2024"
                {...register('academicYear', { required: 'Academic year is required' })}
                error={errors.academicYear}
            />
            <div className="flex justify-end space-x-3 mt-6">
                <Button variant="secondary" onClick={onCancel} disabled={isLoading}>Cancel</Button>
                <Button type="submit" isLoading={isLoading}>{promotion ? 'Update' : 'Create'}</Button>
            </div>
        </form>
    );
};

PromotionForm.propTypes = {
    promotion: PropTypes.object,
    fields: PropTypes.array.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
};

const PromotionsManager = () => {
    const [promotions, setPromotions] = useState([]);
    const [fields, setFields] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [filterField, setFilterField] = useState('');

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [fieldsRes, promotionsRes] = await Promise.all([
                getFields(),
                getPromotions(filterField)
            ]);
            setFields(fieldsRes.data);
            setPromotions(promotionsRes.data);
        } catch (error) {
            toast.error('Failed to fetch data');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filterField]);

    const handleSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            if (selectedPromotion) {
                await updatePromotion(selectedPromotion._id, data);
                toast.success('Promotion updated successfully');
            } else {
                await createPromotion(data);
                toast.success('Promotion created successfully');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure? This will delete all associated semesters.')) {
            try {
                await deletePromotion(id);
                toast.success('Promotion deleted successfully');
                fetchData();
            } catch (error) {
                toast.error('Failed to delete promotion');
            }
        }
    };

    const columns = [
        { key: 'name', label: 'Name' },
        { key: 'fieldId', label: 'Field', render: (field) => field?.name || '-' },
        { key: 'level', label: 'Level' },
        { key: 'academicYear', label: 'Academic Year' },
    ];

    const actions = (row) => (
        <div className="flex space-x-2 justify-end">
            <button onClick={() => { setSelectedPromotion(row); setIsModalOpen(true); }} className="text-blue-600 hover:text-blue-900"><FaEdit /></button>
            <button onClick={() => handleDelete(row._id)} className="text-red-600 hover:text-red-900"><FaTrash /></button>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-4">
                    <h2 className="text-xl font-semibold">Promotions</h2>
                    <select
                        value={filterField}
                        onChange={(e) => setFilterField(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                    >
                        <option value="">All Fields</option>
                        {fields.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                    </select>
                </div>
                <Button onClick={() => { setSelectedPromotion(null); setIsModalOpen(true); }}><FaPlus className="mr-2" /> Add Promotion</Button>
            </div>
            {isLoading ? <div className="text-center">Loading...</div> : <Table columns={columns} data={promotions} actions={actions} />}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedPromotion ? 'Edit Promotion' : 'Add Promotion'}>
                <PromotionForm promotion={selectedPromotion} fields={fields} onSubmit={handleSubmit} onCancel={() => setIsModalOpen(false)} isLoading={isSubmitting} />
            </Modal>
        </div>
    );
};

export default PromotionsManager;
