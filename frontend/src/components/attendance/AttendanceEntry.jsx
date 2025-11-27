import React, { useState } from 'react';
import { submitAttendance } from '../../services/attendanceService';
import Button from '../common/Button';
import { toast } from 'react-toastify';

const AttendanceEntry = ({ student, tueId, initialPresence, onUpdate }) => {
    const [presence, setPresence] = useState(initialPresence || 0);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await submitAttendance({
                studentId: student._id,
                tueId,
                presence: parseFloat(presence)
            });
            toast.success('Attendance updated');
            if (onUpdate) onUpdate();
        } catch (error) {
            toast.error('Failed to update attendance');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <input
                type="number"
                min="0"
                max="20"
                step="0.01"
                value={presence}
                onChange={(e) => setPresence(e.target.value)}
                className="w-20 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <Button type="submit" isLoading={loading} size="sm">
                Save
            </Button>
        </form>
    );
};

export default AttendanceEntry;
