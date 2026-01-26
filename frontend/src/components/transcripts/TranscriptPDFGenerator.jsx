import React, { useState } from 'react';
import { generateTranscriptPDF } from '../../services/transcriptService';
import Button from '../common/Button';
import { FaFilePdf, FaDownload } from 'react-icons/fa';
import { toast } from 'react-toastify';

const TranscriptPDFGenerator = ({ studentId, semesterId, studentName, type = 'full', language = 'en' }) => {
    const [generating, setGenerating] = useState(false);

    const handleGenerate = async () => {
        try {
            setGenerating(true);
            const blob = await generateTranscriptPDF(studentId, semesterId, language);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const filename = `Transcript_${studentName.replace(/\s+/g, '_')}_${type}.pdf`;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Transcript downloaded successfully');
        } catch (error) {
            toast.error('Failed to generate transcript');
            console.error(error);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <Button
            onClick={handleGenerate}
            isLoading={generating}
            variant="secondary"
            className="flex items-center"
        >
            <FaFilePdf className="mr-2" />
            {type === 'semester' ? 'Semester Transcript' : 'Full Transcript'}
        </Button>
    );
};

export default TranscriptPDFGenerator;
