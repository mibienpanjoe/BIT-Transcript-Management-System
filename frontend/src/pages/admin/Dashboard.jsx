import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUsers } from '../../services/userService';
import { getStudents } from '../../services/studentService';
import { getFields } from '../../services/academicService';
import { FaUserGraduate, FaChalkboardTeacher, FaBook, FaUsers } from 'react-icons/fa';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
            <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${color}`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                    <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                        <dd>
                            <div className="text-lg font-medium text-gray-900">{value}</div>
                        </dd>
                    </dl>
                </div>
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        students: 0,
        teachers: 0,
        fields: 0,
        users: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Parallel fetch
                const [studentsRes, usersRes, fieldsRes] = await Promise.all([
                    getStudents(),
                    getUsers(),
                    getFields()
                ]);

                const teachers = usersRes.data.filter(u => u.role === 'teacher').length;

                setStats({
                    students: studentsRes.data.length,
                    teachers: teachers,
                    fields: fieldsRes.data.length,
                    users: usersRes.data.length
                });
            } catch (error) {
                console.error('Failed to fetch dashboard stats', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (isLoading) {
        return <div className="text-center py-10">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Students"
                    value={stats.students}
                    icon={FaUserGraduate}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Teachers"
                    value={stats.teachers}
                    icon={FaChalkboardTeacher}
                    color="bg-green-500"
                />
                <StatCard
                    title="Fields of Study"
                    value={stats.fields}
                    icon={FaBook}
                    color="bg-purple-500"
                />
                <StatCard
                    title="Total Users"
                    value={stats.users}
                    icon={FaUsers}
                    color="bg-yellow-500"
                />
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        to="/students"
                        className="border rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer hover:shadow-md block"
                    >
                        <h3 className="font-medium text-blue-600">Manage Students</h3>
                        <p className="text-sm text-gray-500 mt-1">Add, edit, or import students.</p>
                    </Link>
                    <Link
                        to="/academic"
                        className="border rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer hover:shadow-md block"
                    >
                        <h3 className="font-medium text-green-600">Academic Structure</h3>
                        <p className="text-sm text-gray-500 mt-1">Configure fields, promotions, and TUs.</p>
                    </Link>
                    <Link
                        to="/transcripts"
                        className="border rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer hover:shadow-md block"
                    >
                        <h3 className="font-medium text-purple-600">Generate Transcripts</h3>
                        <p className="text-sm text-gray-500 mt-1">Calculate averages and print transcripts.</p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
