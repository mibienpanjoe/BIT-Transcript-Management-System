import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MyAssignedCourses from '../../components/grades/MyAssignedCourses';

const MyCourses = () => {
    const navigate = useNavigate();

    const handleSelectCourse = (tue) => {
        navigate(`/teacher/grades/enter/${tue._id}`, { state: { tue } });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
            <MyAssignedCourses onSelectTUE={handleSelectCourse} />
        </div>
    );
};

export default MyCourses;
