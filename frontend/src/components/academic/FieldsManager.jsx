import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getFields, createField, updateField, deleteField } from '../../services/academicService';
import Table from '../common/Table';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Input from '../common/Input';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

const FieldForm = ({ field, onSubmit, onCancel, isLoading }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    useEffect(() => {
        if (field) {
            reset(field);
        } else {
            reset({ name: '', code: '', description: '' });
        }
    }, [field, reset]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
                label="Field Name"
                {...register('name', { required: 'Name is required' })}
                error={errors.name}
            />
            <Input
                label="Code"
                {...register('code', { required: 'Code is required' })}
                error={errors.code}
            />
            <Input
                label="Description"
                {...register('description')}
                error={errors.description}
            />
            <div className="flex justify-end space-x-3 mt-6">
                <Button variant="secondary" onClick={onCancel} disabled={isLoading}>Cancel</Button>
                <Button type="submit" isLoading={isLoading}>{field ? 'Update' : 'Create'}</Button>
            </div>
        </form>
    );
};

FieldForm.propTypes = {
    field: PropTypes.object,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
};

const FieldsManager = () => {
    const [fields, setFields] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedField, setSelectedField] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchFields = async () => {
        try {
            setIsLoading(true);
            const response = await getFields();
            setFields(response.data);
        } catch (error) {
            toast.error('Failed to fetch fields');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFields();
    }, []);

    const handleSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            if (selectedField) {
                await updateField(selectedField._id, data);
                toast.success('Field updated successfully');
            } else {
                await createField(data);
                toast.success('Field created successfully');
            }
            setIsModalOpen(false);
            fetchFields();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure? This will delete all associated promotions.')) {
            try {
                await deleteField(id);
                toast.success('Field deleted successfully');
                fetchFields();
            } catch (error) {
                toast.error('Failed to delete field');
            }
        }
    };

    const columns = [
        { key: 'name', label: 'Name' },
        { key: 'code', label: 'Code' },
        { key: 'description', label: 'Description' },
    ];

    const actions = (row) => (
        <div className="flex space-x-2 justify-end">
            <button onClick={() => { setSelectedField(row); setIsModalOpen(true); }} className="text-blue-600 hover:text-blue-900"><FaEdit /></button>
            <button onClick={() => handleDelete(row._id)} className="text-red-600 hover:text-red-900"><FaTrash /></button>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Fields</h2>
                <Button onClick={() => { setSelectedField(null); setIsModalOpen(true); }}><FaPlus className="mr-2" /> Add Field</Button>
            </div>
            {isLoading ? <div className="text-center">Loading...</div> : <Table columns={columns} data={fields} actions={actions} />}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedField ? 'Edit Field' : 'Add Field'}>
                <FieldForm field={selectedField} onSubmit={handleSubmit} onCancel={() => setIsModalOpen(false)} isLoading={isSubmitting} />
            </Modal>
        </div>
    );
};

export default FieldsManager;
