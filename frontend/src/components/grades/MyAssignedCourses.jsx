import { useState, useEffect } from 'react';
import { getMyTUEs } from '../../services/gradeService';
import Table from '../common/Table';
import { toast } from 'react-toastify';
import { FaArrowRight } from 'react-icons/fa';
import PropTypes from 'prop-types';

const MyAssignedCourses = ({ onSelectTUE }) => {
    const [tues, setTues] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTUEs = async () => {
            try {
                setIsLoading(true);
                const response = await getMyTUEs();
                setTues(response.data);
            } catch (error) {
                toast.error('Failed to fetch assigned TUEs');
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTUEs();
    }, []);

    const columns = [
        { key: 'code', label: 'Code' },
        { key: 'name', label: 'TUE Name' },
        {
            key: 'tuId',
            label: 'TU',
            render: (tu) => tu?.name || '-'
        },
        {
            key: 'tuId',
            label: 'Semester',
            render: (tu) => tu?.semesterId?.name || '-'
        },
        { key: 'credits', label: 'Credits' },
    ];

    const actions = (row) => (
        <button
            onClick={() => onSelectTUE(row)}
            className="text-blue-600 hover:text-blue-900 flex items-center font-medium"
        >
            Enter Grades <FaArrowRight className="ml-2" />
        </button>
    );

    if (isLoading) {
        return (
            <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">My Teaching Units</h2>
            <Table columns={columns} data={tues} actions={actions} />
        </div>
    );
};

MyAssignedCourses.propTypes = {
    onSelectTUE: PropTypes.func.isRequired,
};

export default MyAssignedCourses;
