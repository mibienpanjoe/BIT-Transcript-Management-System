import React from 'react';

const AttendanceTable = ({ students, attendanceData, onAttendanceChange }) => {
    return (
        <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Presence Score (0-20)</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => {
                        const data = attendanceData[student._id] || { presence: 0, isEditable: true };
                        return (
                            <tr key={student._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {student.studentId}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {student.lastName} {student.firstName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <input
                                        type="number"
                                        min="0"
                                        max="20"
                                        step="0.01"
                                        value={data.presence}
                                        onChange={(e) => onAttendanceChange(student._id, 'presence', e.target.value)}
                                        disabled={!data.isEditable}
                                        className={`w-24 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${!data.isEditable ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default AttendanceTable;
