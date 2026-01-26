const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'BIT TMS API',
        version: '1.0.0',
        description: 'API documentation for the BIT Transcript Management System',
    },
    servers: [
        {
            url: process.env.API_BASE_URL || 'http://localhost:5000',
        },
    ],
    tags: [
        { name: 'Auth' },
        { name: 'Users' },
        { name: 'Students' },
        { name: 'Fields' },
        { name: 'Promotions' },
        { name: 'Semesters' },
        { name: 'TUs' },
        { name: 'TUEs' },
        { name: 'Grades' },
        { name: 'Calculations' },
        { name: 'PDF' },
        { name: 'Transcripts' },
        { name: 'Health' },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        schemas: {
            ApiResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                },
            },
            User: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    email: { type: 'string' },
                    role: { type: 'string', enum: ['admin', 'teacher', 'schooling_manager'] },
                    isActive: { type: 'boolean' },
                },
            },
            Field: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    code: { type: 'string' },
                    description: { type: 'string' },
                    isActive: { type: 'boolean' },
                },
            },
            Promotion: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    fieldId: { type: 'string' },
                    level: { type: 'string', enum: ['L1', 'L2', 'L3', 'M1', 'M2'] },
                    academicYear: { type: 'string', example: '2023-2024' },
                    isActive: { type: 'boolean' },
                },
            },
            Semester: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    promotionId: { type: 'string' },
                    level: { type: 'string', enum: ['L1', 'L2', 'L3', 'M1', 'M2'] },
                    order: { type: 'integer', example: 1 },
                    isActive: { type: 'boolean' },
                },
            },
            TU: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    code: { type: 'string' },
                    semesterId: { type: 'string' },
                    credits: { type: 'number' },
                    isActive: { type: 'boolean' },
                },
            },
            TUE: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    code: { type: 'string' },
                    tuId: { type: 'string' },
                    credits: { type: 'number' },
                    teacherId: { type: 'string' },
                    volumeHours: { type: 'number' },
                    isActive: { type: 'boolean' },
                },
            },
            Student: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    studentId: { type: 'string' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    dateOfBirth: { type: 'string', format: 'date' },
                    placeOfBirth: { type: 'string' },
                    fieldId: { type: 'string' },
                    promotionId: { type: 'string' },
                    academicYear: { type: 'string' },
                    isActive: { type: 'boolean' },
                },
            },
            Grade: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    studentId: { type: 'string' },
                    tueId: { type: 'string' },
                    presence: { type: 'number', minimum: 0, maximum: 20 },
                    participation: { type: 'number', minimum: 0, maximum: 20 },
                    evaluation: { type: 'number', minimum: 0, maximum: 20 },
                    finalGrade: { type: 'number', minimum: 0, maximum: 20 },
                    isValidated: { type: 'boolean' },
                    academicYear: { type: 'string' },
                },
            },
            AuthResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    token: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' },
                },
            },
            ErrorResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                },
            },
        },
    },
    security: [{ bearerAuth: [] }],
};

const swaggerOptions = {
    definition: swaggerDefinition,
    apis: [path.resolve(__dirname, '../routes/*.js')],
};

module.exports = swaggerJSDoc(swaggerOptions);
