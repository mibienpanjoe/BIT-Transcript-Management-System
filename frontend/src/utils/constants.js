export const ROLES = {
    ADMIN: 'admin',
    TEACHER: 'teacher',
    SCHOOLING_MANAGER: 'schooling_manager'
};

export const EVALUATION_TYPES = [
    { value: 'DS', label: 'Devoir Surveillé' },
    { value: 'DM', label: 'Devoir Maison' },
    { value: 'Project', label: 'Project' },
    { value: 'Final', label: 'Final Exam' },
    { value: 'CC', label: 'Contrôle Continu' },
    { value: 'TP', label: 'Travaux Pratiques' },
    { value: 'Presentation', label: 'Presentation' }
];

export const MENTION_SCALE = [
    { min: 18.00, label: 'A++', description: 'Excellent' },
    { min: 17.00, label: 'A+', description: 'Very Good+' },
    { min: 16.00, label: 'A', description: 'Very Good' },
    { min: 15.00, label: 'B+', description: 'Good+' },
    { min: 14.00, label: 'B', description: 'Good' },
    { min: 13.00, label: 'C+', description: 'Fairly Good+' },
    { min: 12.00, label: 'C', description: 'Fairly Good' },
    { min: 11.00, label: 'D+', description: 'Passable+' },
    { min: 10.00, label: 'D', description: 'Passable' },
    { min: 0, label: 'F', description: 'Fail' }
];

export const VALIDATION_STATUS = {
    VALIDATED: 'V',
    NOT_VALIDATED: 'NV',
    VALIDATED_BY_COMPENSATION: 'V-C'
};

export const SEMESTER_DECISION = {
    VALIDATED: 'VALIDATED',
    NOT_VALIDATED: 'NOT_VALIDATED',
    ADJOURNED: 'ADJOURNED'
};
