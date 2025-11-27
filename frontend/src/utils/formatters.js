import { format } from 'date-fns';

export const formatDate = (date) => {
    if (!date) return '';
    return format(new Date(date), 'dd/MM/yyyy');
};

export const formatDateTime = (date) => {
    if (!date) return '';
    return format(new Date(date), 'dd/MM/yyyy HH:mm');
};

export const formatGrade = (grade) => {
    if (grade === undefined || grade === null) return '-';
    return Number(grade).toFixed(2);
};

export const formatPercentage = (value) => {
    if (value === undefined || value === null) return '-';
    return `${Number(value).toFixed(1)}%`;
};
