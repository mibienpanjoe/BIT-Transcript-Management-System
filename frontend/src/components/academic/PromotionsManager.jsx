import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { getFields, getPromotions, createPromotion, updatePromotion, deletePromotion } from '../../services/academicService';
import Table from '../common/Table';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Input from '../common/Input';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

const buildPromotionName = ({ fieldId, level, academicYear, fields }) => {
    const field = fields.find((item) => item._id === fieldId || item._id?.toString() === fieldId?.toString());
    const fieldLabel = field?.code || field?.name || '';
    const parts = [level, fieldLabel, academicYear].filter(Boolean);
    return parts.join(' ').trim();
};

const toAcademicYear = (startYear) => {
    if (!startYear) return '';
    const start = Number(startYear);
    if (Number.isNaN(start)) return '';
    return `${start}-${start + 1}`;
};

const PromotionForm = ({ promotion, fields, onSubmit, onCancel, isLoading }) => {
    const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm();
    const [nameTouched, setNameTouched] = useState(false);

    const watchedFieldId = watch('fieldId');
    const watchedLevel = watch('level');
    const watchedStartYear = watch('startYear');
    const watchedName = watch('name');

    const nameRegister = register('name', { required: 'Name is required' });
    const startYearRegister = register('startYear', {
        required: 'Start year is required',
        validate: (value) => /^\d{4}$/.test(String(value || '').trim()) || 'Use a 4-digit year'
    });
    const academicYearRegister = register('academicYear', { required: 'Academic year is required' });

    useEffect(() => {
        if (promotion) {
            const startYear = promotion.academicYear?.split('-')[0] || '';
            reset({
                ...promotion,
                startYear,
                fieldId: promotion.fieldId?._id || promotion.fieldId
            });
            setNameTouched(true);
        } else {
            reset({ name: '', fieldId: '', level: '', academicYear: '', startYear: '' });
            setNameTouched(false);
        }
    }, [promotion, reset]);

    useEffect(() => {
        if (nameTouched) return;
        const autoName = buildPromotionName({
            fieldId: watchedFieldId,
            level: watchedLevel,
            academicYear: toAcademicYear(watchedStartYear),
            fields
        });
        if (autoName && autoName !== watchedName) {
            setValue('name', autoName, { shouldValidate: true, shouldDirty: true });
        }
    }, [fields, nameTouched, setValue, watchedFieldId, watchedLevel, watchedName, watchedStartYear]);

    useEffect(() => {
        const computed = toAcademicYear(watchedStartYear);
        if (computed) {
            setValue('academicYear', computed, { shouldValidate: true, shouldDirty: true });
        } else {
            setValue('academicYear', '', { shouldValidate: true, shouldDirty: true });
        }
    }, [setValue, watchedStartYear]);

    const namePreview = buildPromotionName({
        fieldId: watchedFieldId,
        level: watchedLevel,
        academicYear: toAcademicYear(watchedStartYear),
        fields
    });


    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
                label="Promotion Name"
                {...nameRegister}
                onChange={(event) => {
                    nameRegister.onChange(event);
                    setNameTouched(true);
                }}
                error={errors.name}
            />
            <p className="text-xs text-gray-500">
                Preview: <span className="font-medium text-gray-700">{namePreview || '—'}</span>
            </p>
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
                label="Start Year"
                type="number"
                placeholder="e.g., 2023"
                {...startYearRegister}
                error={errors.startYear}
                min={2000}
                max={2100}
            />
            <Input
                label="Academic Year"
                placeholder="Auto-filled"
                {...academicYearRegister}
                value={toAcademicYear(watchedStartYear)}
                readOnly
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
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');

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
        {
            key: 'level',
            label: 'Level',
            render: (value) => (
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                    {value}
                </span>
            )
        },
        {
            key: 'academicYear',
            label: 'Academic Year',
            render: (value) => (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    {value}
                </span>
            )
        }
    ];

    const actions = (row) => (
        <div className="flex space-x-2 justify-end">
            <button
                onClick={() => { setSelectedPromotion(row); setIsModalOpen(true); }}
                className="text-blue-600 hover:text-blue-900"
                title="Edit promotion"
            >
                <FaEdit />
            </button>
            <button
                onClick={() => handleDelete(row._id)}
                className="text-red-600 hover:text-red-900"
                title="Delete promotion"
            >
                <FaTrash />
            </button>
        </div>
    );

    const filteredPromotions = useMemo(() => {
        const lowerSearch = searchTerm.trim().toLowerCase();
        const list = promotions.filter((promo) => {
            if (!lowerSearch) return true;
            const fieldName = promo.fieldId?.name || '';
            return [promo.name, fieldName, promo.level, promo.academicYear]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
                .includes(lowerSearch);
        });

        const sorted = [...list].sort((a, b) => {
            const direction = sortDirection === 'asc' ? 1 : -1;
            if (sortKey === 'academicYear') {
                return direction * a.academicYear.localeCompare(b.academicYear);
            }
            if (sortKey === 'level') {
                return direction * a.level.localeCompare(b.level);
            }
            if (sortKey === 'fieldId') {
                return direction * (a.fieldId?.name || '').localeCompare(b.fieldId?.name || '');
            }
            return direction * a.name.localeCompare(b.name);
        });

        return sorted;
    }, [promotions, searchTerm, sortDirection, sortKey]);

    const summaryFields = useMemo(() => (
        new Set(filteredPromotions.map((promo) => promo.fieldId?._id || promo.fieldId)).size
    ), [filteredPromotions]);

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
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                    <Input
                        label=""
                        placeholder="Search promotions"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        className="w-64"
                    />
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium text-gray-800">{filteredPromotions.length}</span>
                        <span>Promotions</span>
                        <span className="text-gray-300">•</span>
                        <span className="font-medium text-gray-800">{summaryFields}</span>
                        <span>Fields</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={sortKey}
                        onChange={(event) => setSortKey(event.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                    >
                        <option value="name">Sort by Name</option>
                        <option value="fieldId">Sort by Field</option>
                        <option value="level">Sort by Level</option>
                        <option value="academicYear">Sort by Academic Year</option>
                    </select>
                    <button
                        type="button"
                        onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                        className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                    >
                        {sortDirection === 'asc' ? 'Asc' : 'Desc'}
                    </button>
                </div>
            </div>
            {isLoading ? <div className="text-center">Loading...</div> : <Table columns={columns} data={filteredPromotions} actions={actions} />}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedPromotion ? 'Edit Promotion' : 'Add Promotion'}>
                <PromotionForm promotion={selectedPromotion} fields={fields} onSubmit={handleSubmit} onCancel={() => setIsModalOpen(false)} isLoading={isSubmitting} />
            </Modal>
        </div>
    );
};

export default PromotionsManager;
