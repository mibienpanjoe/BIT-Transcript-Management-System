import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            switch (user.role) {
                case 'admin':
                    navigate('/dashboard');
                    break;
                case 'teacher':
                    navigate('/teacher/my-courses');
                    break;
                case 'schooling_manager':
                    navigate('/attendance');
                    break;
                default:
                    navigate('/dashboard');
            }
        }
    }, [user, navigate]);

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
    );
};

export default Home;
