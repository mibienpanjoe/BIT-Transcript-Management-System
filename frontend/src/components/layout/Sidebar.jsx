import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FaHome,
    FaUserGraduate,
    FaChalkboardTeacher,
    FaBook,
    FaClipboardList,
    FaChartBar,
    FaFileAlt,
    FaUsers,
    FaCog
} from 'react-icons/fa';
import PropTypes from 'prop-types';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { user } = useAuth();
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <FaHome />, roles: ['admin'] },
        { name: 'My Courses', path: '/teacher/my-courses', icon: <FaChalkboardTeacher />, roles: ['teacher'] },
        { name: 'Users', path: '/users', icon: <FaUsers />, roles: ['admin'] },
        { name: 'Students', path: '/students', icon: <FaUserGraduate />, roles: ['admin'] },
        { name: 'Academic Structure', path: '/academic', icon: <FaBook />, roles: ['admin'] },
        { name: 'Grades', path: '/grades', icon: <FaClipboardList />, roles: ['admin'] },
        { name: 'Attendance', path: '/attendance', icon: <FaChalkboardTeacher />, roles: ['admin', 'schooling_manager'] },
        { name: 'Results & Transcripts', path: '/transcripts', icon: <FaChartBar />, roles: ['admin'] },
        { name: 'Semester Results', path: '/semester-results', icon: <FaFileAlt />, roles: ['admin'] },
        { name: 'Settings', path: '/settings', icon: <FaCog />, roles: ['admin', 'teacher', 'schooling_manager'] },
    ];

    const filteredItems = menuItems.filter(item => item.roles.includes(user?.role));

    return (
        <>
            {/* Mobile overlay */}
            <div
                className={`fixed inset-0 z-20 transition-opacity bg-black opacity-50 lg:hidden ${isOpen ? 'block' : 'hidden'}`}
                onClick={() => setIsOpen(false)}
            ></div>

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto transition duration-300 transform bg-brand-ink text-white lg:translate-x-0 lg:static lg:inset-0 ${isOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in'
                    }`}
            >
                <div className="flex items-center justify-center mt-8">
                    <div className="flex items-center">
                        <span className="text-2xl font-bold text-brand-accent">BIT</span>
                        <span className="mx-2 text-2xl font-semibold text-white">TMS</span>
                    </div>
                </div>

                <nav className="mt-10">
                    {filteredItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center px-6 py-3 mt-2 transition-colors duration-200 transform ${location.pathname === item.path
                                ? 'bg-brand-ink-soft text-white border-l-4 border-brand-accent'
                                : 'text-slate-300 hover:bg-brand-ink-soft hover:text-white'
                                }`}
                        >
                            <span className="w-5 h-5">{item.icon}</span>
                            <span className="mx-4 font-medium">{item.name}</span>
                        </Link>
                    ))}
                </nav>
            </div>
        </>
    );
};

Sidebar.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    setIsOpen: PropTypes.func.isRequired,
};

export default Sidebar;
