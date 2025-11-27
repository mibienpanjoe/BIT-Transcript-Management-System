import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Button from '../common/Button';
import Input from '../common/Input';
import PropTypes from 'prop-types';

const UserForm = ({ user, onSubmit, onCancel, isLoading }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            role: 'teacher',
            password: '',
        }
    });

    useEffect(() => {
        if (user) {
            reset({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                password: '', // Don't populate password
            });
        } else {
            reset({
                firstName: '',
                lastName: '',
                email: '',
                role: 'teacher',
                password: '',
            });
        }
    }, [user, reset]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            <Input
                label="Email"
                type="email"
                {...register('email', {
                    required: 'Email is required',
                    pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                    }
                })}
                error={errors.email}
            />

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                    {...register('role', { required: 'Role is required' })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                    <option value="admin">Admin</option>
                    <option value="teacher">Teacher</option>
                    <option value="schooling_manager">Schooling Manager</option>
                </select>
                {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
            </div>

            <Input
                label={user ? "Password (leave blank to keep current)" : "Password"}
                type="password"
                {...register('password', {
                    required: !user && 'Password is required',
                    minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters"
                    }
                })}
                error={errors.password}
            />

            <div className="flex justify-end space-x-3 mt-6">
                <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" isLoading={isLoading}>
                    {user ? 'Update User' : 'Create User'}
                </Button>
            </div>
        </form>
    );
};

UserForm.propTypes = {
    user: PropTypes.object,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
};

export default UserForm;
