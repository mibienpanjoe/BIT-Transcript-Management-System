import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getFields, getPromotions, getSemesters, getTUs, getTUEs, createTUE, updateTUE, deleteTUE } from '../../services/academicService';
import { getUsers } from '../../services/userService';
import Table from '../common/Table';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Input from '../common/Input';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

const TUEForm = ({ tue, tus, teachers, onSubmit, onCancel, isLoading }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    useEffect(() => {
        if (tue) {
            reset({ ...tue, tuId: tue.tuId?._id || tue.tuId, teacherId: tue.teacherId?._id || tue.teacherId });
        } else {
            reset({ name: '', tuId: '', credits: 0, teacherId: '' });
        }
    }, [tue, reset]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
                label="TUE Name"
                {...register('name', { required: 'Name is required' })}
                error={errors.name}
            />
            {tue && tue.code && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                    <p className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md">{tue.code} (Auto-generated)</p>
                </div>
            )}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teaching Unit (TU)</label>
                <select
                    {...register('tuId', { required: 'TU is required' })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                    <option value="">Select TU</option>
                    {tus.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
                {errors.tuId && <p className="mt-1 text-sm text-red-600">{errors.tuId.message}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                <select
                    {...register('teacherId')}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                    <option value="">Select Teacher</option>
                    {teachers.map(t => <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>)}
                </select>
            </div>
            <Input
                label="Credits"
                type="number"
                {...register('credits', { required: 'Credits is required', min: 1 })}
                error={errors.credits}
            />
            <div className="flex justify-end space-x-3 mt-6">
                <Button variant="secondary" onClick={onCancel} disabled={isLoading}>Cancel</Button>
                <Button type="submit" isLoading={isLoading}>{tue ? 'Update' : 'Create'}</Button>
            </div>
        </form>
    );
};

TUEForm.propTypes = {
    tue: PropTypes.object,
    tus: PropTypes.array.isRequired,
    teachers: PropTypes.array.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
};

const TUEsManager = () => {
    const [tues, setTues] = useState([]);
    const [fields, setFields] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [tus, setTus] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTUE, setSelectedTUE] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [filterField, setFilterField] = useState('');
    const [filterPromotion, setFilterPromotion] = useState('');
    const [filterSemester, setFilterSemester] = useState('');
    const [filterTU, setFilterTU] = useState('');

    useEffect(() => {
        const loadFields = async () => {
            const res = await getFields();
            setFields(res.data);
        };
        const loadTeachers = async () => {
            const res = await getUsers();
            setTeachers(res.data.filter(u => u.role === 'teacher'));
        };
        loadFields();
        loadTeachers();
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

    useEffect(() => {
        const loadSemesters = async () => {
            if (filterPromotion) {
                const res = await getSemesters(filterPromotion);
                setSemesters(res.data);
            } else {
                setSemesters([]);
            }
        };
        loadSemesters();
    }, [filterPromotion]);

    useEffect(() => {
        const loadTUs = async () => {
            if (filterSemester) {
                const res = await getTUs(filterSemester);
                setTus(res.data);
            } else {
                setTus([]);
            }
        };
        loadTUs();
    }, [filterSemester]);

    const fetchTUEs = async () => {
        try {
            setIsLoading(true);
            const response = await getTUEs(filterTU);
            setTues(response.data);
        } catch (error) {
            toast.error('Failed to fetch TUEs');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTUEs();
    }, [filterTU]);

    const handleSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            if (selectedTUE) {
                await updateTUE(selectedTUE._id, data);
                toast.success('TUE updated successfully');
            } else {
                await createTUE(data);
                toast.success('TUE created successfully');
            }
            setIsModalOpen(false);
            fetchTUEs();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await deleteTUE(id);
                toast.success('TUE deleted successfully');
                fetchTUEs();
            } catch (error) {
                toast.error('Failed to delete TUE');
            }
        }
    };

    const columns = [
        { key: 'name', label: 'Name' },
        { key: 'code', label: 'Code' },
        { key: 'credits', label: 'Credits' },
        { key: 'teacherId', label: 'Teacher', render: (t) => t ? `${t.firstName} ${t.lastName}` : '-' },
    ];

    const actions = (row) => (
        <div className="flex space-x-2 justify-end">
            <button onClick={() => { setSelectedTUE(row); setIsModalOpen(true); }} className="text-blue-600 hover:text-blue-900"><FaEdit /></button>
            <button onClick={() => handleDelete(row._id)} className="text-red-600 hover:text-red-900"><FaTrash /></button>
        </div>
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <div className="flex items-center space-x-4 w-full md:w-auto overflow-x-auto">
                    <select value={filterField} onChange={(e) => { setFilterField(e.target.value); setFilterPromotion(''); setFilterSemester(''); setFilterTU(''); }} className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                        <option value="">Select Field</option>
                        {fields.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                    </select>
                    <select value={filterPromotion} onChange={(e) => { setFilterPromotion(e.target.value); setFilterSemester(''); setFilterTU(''); }} disabled={!filterField} className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                        <option value="">Select Promotion</option>
                        {promotions.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                    <select value={filterSemester} onChange={(e) => { setFilterSemester(e.target.value); setFilterTU(''); }} disabled={!filterPromotion} className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                        <option value="">Select Semester</option>
                        {semesters.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                    <select value={filterTU} onChange={(e) => setFilterTU(e.target.value)} disabled={!filterSemester} className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                        <option value="">Select TU</option>
                        {tus.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                </div>
                <Button onClick={() => { setSelectedTUE(null); setIsModalOpen(true); }} disabled={!filterTU}><FaPlus className="mr-2" /> Add TUE</Button>
            </div>
            {isLoading ? <div className="text-center">Loading...</div> : <Table columns={columns} data={tues} actions={actions} />}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedTUE ? 'Edit TUE' : 'Add TUE'}>
                <TUEForm tue={selectedTUE} tus={tus} teachers={teachers} onSubmit={handleSubmit} onCancel={() => setIsModalOpen(false)} isLoading={isSubmitting} />
            </Modal>
        </div>
    );
};

export default TUEsManager;
