import React from 'react';
import AttendanceEntry from './AttendanceEntry';

const AttendanceTable = ({ students, attendanceData, onAttendanceChange }) => {
    return (
        <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions (Total / Attended)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                        <AttendanceEntry
                            key={student._id}
                            student={student}
                            attendance={attendanceData[student._id]}
                            onChange={onAttendanceChange}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AttendanceTable;
