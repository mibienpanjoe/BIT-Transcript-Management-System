import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Button from '../common/Button';
import Input from '../common/Input';
import { getFields, getPromotions } from '../../services/academicService';
import PropTypes from 'prop-types';

const StudentForm = ({ student, onSubmit, onCancel, isLoading }) => {
    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
        defaultValues: {
            studentId: '',
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            placeOfBirth: '',
            fieldId: '',
            promotionId: '',
            academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
        }
    });

    const [fields, setFields] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const selectedField = watch('fieldId');

    useEffect(() => {
        const fetchFields = async () => {
            try {
                const data = await getFields();
                setFields(data.data || []);
            } catch (error) {
                console.error("Failed to fetch fields", error);
            }
        };
        fetchFields();
    }, []);

    useEffect(() => {
        const fetchPromotions = async () => {
            if (selectedField) {
                try {
                    const data = await getPromotions(selectedField);
                    setPromotions(data.data || []);
                } catch (error) {
                    console.error("Failed to fetch promotions", error);
                }
            } else {
                setPromotions([]);
            }
        };
        fetchPromotions();
    }, [selectedField]);

    useEffect(() => {
        if (student) {
            reset({
                studentId: student.studentId,
                firstName: student.firstName,
                lastName: student.lastName,
                dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
                placeOfBirth: student.placeOfBirth,
                fieldId: student.fieldId?._id || student.fieldId,
                promotionId: student.promotionId?._id || student.promotionId,
                academicYear: student.academicYear,
            });
        } else {
            reset({
                studentId: '',
                firstName: '',
                lastName: '',
                dateOfBirth: '',
                placeOfBirth: '',
                fieldId: '',
                promotionId: '',
                academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
            });
        }
    }, [student, reset]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
                label="Student ID (Matricule)"
                {...register('studentId', { required: 'Student ID is required' })}
                error={errors.studentId}
            />

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="First Name"
                    {...register('firstName', { required: 'First name is required' })}
                    error={errors.firstName}
                />
                <Input
                    label="Last Name"
                    {...register('lastName', { required: 'Last name is required' })}
                    error={errors.lastName}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Date of Birth"
                    type="date"
                    {...register('dateOfBirth', { required: 'Date of birth is required' })}
                    error={errors.dateOfBirth}
                />
                <Input
                    label="Place of Birth"
                    {...register('placeOfBirth', { required: 'Place of birth is required' })}
                    error={errors.placeOfBirth}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
                    <select
                        {...register('fieldId', { required: 'Field is required' })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        <option value="">Select Field</option>
                        {fields.map(field => (
                            <option key={field._id} value={field._id}>{field.name}</option>
                        ))}
                    </select>
                    {errors.fieldId && <p className="mt-1 text-sm text-red-600">{errors.fieldId.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Promotion</label>
                    <select
                        {...register('promotionId', { required: 'Promotion is required' })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        disabled={!selectedField}
                    >
                        <option value="">Select Promotion</option>
                        {promotions.map(promo => (
                            <option key={promo._id} value={promo._id}>{promo.name}</option>
                        ))}
                    </select>
                    {errors.promotionId && <p className="mt-1 text-sm text-red-600">{errors.promotionId.message}</p>}
                </div>
            </div>

            <Input
                label="Academic Year"
                {...register('academicYear', { required: 'Academic year is required' })}
                error={errors.academicYear}
            />

            <div className="flex justify-end space-x-3 mt-6">
                <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" isLoading={isLoading}>
                    {student ? 'Update Student' : 'Create Student'}
                </Button>
            </div>
        </form>
    );
};

StudentForm.propTypes = {
    student: PropTypes.object,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
};

export default StudentForm;
