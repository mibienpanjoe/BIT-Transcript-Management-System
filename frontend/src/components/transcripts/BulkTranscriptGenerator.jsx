import React, { useState } from 'react';
import { bulkGenerateTranscripts } from '../../services/transcriptService';
import Button from '../common/Button';
import { FaUsers, FaDownload } from 'react-icons/fa';
import { toast } from 'react-toastify';

const BulkTranscriptGenerator = ({ studentIds, semesterId }) => {
    const [processing, setProcessing] = useState(false);

    const handleBulkGenerate = async () => {
        if (!studentIds || studentIds.length === 0) {
            toast.warning('No students selected');
            return;
        }

        if (!window.confirm(`Generate transcripts for ${studentIds.length} students? This may take a while.`)) {
            return;
        }

        try {
            setProcessing(true);
            await bulkGenerateTranscripts(studentIds, semesterId);
            toast.success('Bulk generation started. You will be notified when complete.');
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
