import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import GradeEntry from '../../components/grades/GradeEntry';
import { FaArrowLeft } from 'react-icons/fa';

const GradeSubmission = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { tueId } = useParams();

    // Fallback if state is lost (e.g. direct link), ideally fetch TUE details by ID
    const tue = state?.tue || { _id: tueId, name: 'Loading...', code: '' };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/teacher/my-courses')}
                    className="text-gray-600 hover:text-gray-900"
                >
                    <FaArrowLeft />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Grade Submission</h1>
                    <p className="text-gray-500">{tue.name} ({tue.code})</p>
                </div>
            </div>

            <GradeEntry tueId={tueId} />
        </div>
    );
};

export default GradeSubmission;
