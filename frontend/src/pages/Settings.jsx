import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import api from '../services/api'; // We might need a direct call or add to authService
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { toast } from 'react-toastify';

const Settings = () => {
    const { user } = useAuth();
    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
    const [isLoading, setIsLoading] = useState(false);

    const newPassword = watch('newPassword');

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            // Assuming we have an endpoint /auth/update-password or similar.
            // If not, we might need to use updateUser but that usually requires admin rights for other users.
            // Let's assume a self-update endpoint exists or we use the user update with current ID.
            // Checking backend: userController has updateUser. If user is updating themselves, it should be allowed.
            // But usually updateUser is admin protected.
            // Let's check authRoutes.js. It has /login, /register, /me.
            // We might need to add /update-password to authRoutes or allow updateUser to handle self.
            // For now, let's try to use api.put(`/users/${user.id}`, ...) and see if backend allows it.
            // If backend middleware restricts to admin, this will fail for non-admins.
            // Given the constraints, I will assume I can add a route or use existing.
            // Let's assume I'll add a specific route for self-password update in backend if needed, 
            // but for now let's try to hit a hypothetical /auth/change-password endpoint
            // OR better, let's just implement the UI and assume the backend supports it or I'll add it.
            // I'll add the backend route in a moment to be sure.

            await api.put('/auth/update-password', {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
            });

            toast.success('Password updated successfully');
            reset();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-500">First Name</label>
                        <p className="mt-1 text-sm text-gray-900">{user?.firstName}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Last Name</label>
                        <p className="mt-1 text-sm text-gray-900">{user?.lastName}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Email</label>
                        <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Role</label>
                        <p className="mt-1 text-sm text-gray-900 capitalize">{user?.role?.replace('_', ' ')}</p>
                    </div>
                </div>

                <hr className="my-6" />

                <h2 className="text-lg font-medium text-gray-900 mb-4">Change Password</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Current Password"
                        type="password"
                        {...register('currentPassword', { required: 'Current password is required' })}
                        error={errors.currentPassword}
                    />
                    <Input
                        label="New Password"
                        type="password"
                        {...register('newPassword', {
                            required: 'New password is required',
                            minLength: { value: 6, message: 'Password must be at least 6 characters' }
                        })}
                        error={errors.newPassword}
                    />
                    <Input
                        label="Confirm New Password"
                        type="password"
                        {...register('confirmPassword', {
                            required: 'Please confirm your password',
                            validate: value => value === newPassword || 'Passwords do not match'
                        })}
                        error={errors.confirmPassword}
                    />
                    <div className="flex justify-end">
                        <Button type="submit" isLoading={isLoading}>Update Password</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
