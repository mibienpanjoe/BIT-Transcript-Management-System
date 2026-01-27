import React, { useState } from 'react';
import { bulkGenerateTranscripts } from '../../services/transcriptService';
import Button from '../common/Button';
import { FaUsers, FaDownload } from 'react-icons/fa';
import { toast } from 'react-toastify';

const BulkTranscriptGenerator = ({ studentIds, semesterId, academicYear, lang = 'en' }) => {
    const [processing, setProcessing] = useState(false);

    const handleBulkGenerate = async () => {
        if (!studentIds || studentIds.length === 0) {
            toast.warning('No students selected');
            return;
        }

        if (!academicYear) {
            toast.warning('Select an academic year before generating transcripts');
            return;
        }

        if (!window.confirm(`Generate transcripts for ${studentIds.length} students? This may take a while.`)) {
            return;
        }

        try {
            setProcessing(true);
            const response = await bulkGenerateTranscripts({
                studentIds,
                semesterId,
                academicYear,
                lang
            });
            const blob = new Blob([response.data], { type: 'application/zip' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `transcripts_${academicYear}_${lang}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Bulk transcripts generated.');
        } catch (error) {
            toast.error('Failed to start bulk generation');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Button
            onClick={handleBulkGenerate}
            isLoading={processing}
            disabled={!studentIds || studentIds.length === 0}
            className="flex items-center"
        >
            <FaUsers className="mr-2" />
            Generate All ({studentIds?.length || 0})
        </Button>
    );
};

export default BulkTranscriptGenerator;
