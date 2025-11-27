import React, { useState, useEffect } from 'react';
import { getStudents } from '../../services/studentService';
import { getPromotions } from '../../services/academicService';
import TranscriptViewer from '../../components/transcripts/TranscriptViewer';
import TranscriptPDFGenerator from '../../components/transcripts/TranscriptPDFGenerator';
import BulkTranscriptGenerator from '../../components/transcripts/BulkTranscriptGenerator';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const TranscriptManagement = () => {
    const [promotions, setPromotions] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedPromotion, setSelectedPromotion] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadPromotions = async () => {
            try {
                const res = await getPromotions();
                setPromotions(res.data);
            } catch (error) {
                toast.error('Failed to load promotions');
            }
        };
        loadPromotions();
    }, []);

    useEffect(() => {
        const loadStudents = async () => {
            if (!selectedPromotion) {
                setStudents([]);
                return;
            }
            try {
                setLoading(true);
                const res = await getStudents({ promotion: selectedPromotion });
                setStudents(res.data);
            } catch (error) {
                toast.error('Failed to load students');
            } finally {
                setLoading(false);
            }
        };
        loadStudents();
    }, [selectedPromotion]);

    const handleStudentSelect = (e) => {
        setSelectedStudent(e.target.value);
    };

    const selectedStudentData = students.find(s => s._id === selectedStudent);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Transcript Management</h1>

            <div className="bg-white p-4 rounded-lg shadow space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                        label="Select Promotion"
                        name="promotion"
                        value={selectedPromotion}
                        onChange={(e) => setSelectedPromotion(e.target.value)}
                        options={promotions.map(p => ({ value: p._id, label: p.name }))}
                    />

                    <Select
                        label="Select Student"
                        name="student"
                        value={selectedStudent}
                        onChange={handleStudentSelect}
                        options={students.map(s => ({ value: s._id, label: `${s.lastName} ${s.firstName} (${s.studentId})` }))}
                        disabled={!selectedPromotion}
                    />
                </div>

                {selectedPromotion && students.length > 0 && (
                    <div className="pt-4 border-t">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Bulk Actions</h3>
                        <BulkTranscriptGenerator
                            studentIds={students.map(s => s._id)}
                        />
                    </div>
                )}
            </div>

            {loading && <LoadingSpinner />}

            {selectedStudent && selectedStudentData && (
                <div className="space-y-4">
                    <div className="flex justify-end space-x-4">
                        <TranscriptPDFGenerator
                            studentId={selectedStudent}
                            studentName={`${selectedStudentData.lastName} ${selectedStudentData.firstName}`}
                            type="full"
                        />
                    </div>
                    <TranscriptViewer studentId={selectedStudent} />
                </div>
            )}
        </div>
    );
};

export default TranscriptManagement;
