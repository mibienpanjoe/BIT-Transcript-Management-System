import { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/userService';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import UserForm from '../../components/users/UserForm';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const response = await getUsers();
            setUsers(response.data);
        } catch (error) {
            toast.error('Failed to fetch users');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreate = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to deactivate this user?')) {
            try {
                await deleteUser(id);
                toast.success('User deactivated successfully');
                fetchUsers();
            } catch (error) {
                toast.error('Failed to deactivate user');
                console.error(error);
            }
        }
    };

    const handleSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            if (selectedUser) {
                // Remove password if empty during update
                if (!data.password) delete data.password;
                await updateUser(selectedUser._id, data);
                toast.success('User updated successfully');
            } else {
                await createUser(data);
                toast.success('User created successfully');
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns = [
        { key: 'firstName', label: 'First Name' },
        { key: 'lastName', label: 'Last Name' },
        { key: 'email', label: 'Email' },
        {
            key: 'role',
            label: 'Role',
            render: (role) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        role === 'teacher' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                    }`}>
                    {role.replace('_', ' ').toUpperCase()}
                </span>
            )
        },
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
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <Button onClick={handleCreate}>
                    <FaPlus className="mr-2" /> Add User
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <Table
                    columns={columns}
                    data={users}
                    actions={actions}
                />
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedUser ? 'Edit User' : 'Create New User'}
            >
                <UserForm
                    user={selectedUser}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsModalOpen(false)}
                    isLoading={isSubmitting}
                />
            </Modal>
        </div>
    );
};

export default UserManagement;
