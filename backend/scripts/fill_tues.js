const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const Field = require('../src/models/Field');
const Promotion = require('../src/models/Promotion');
const Semester = require('../src/models/Semester');
const TU = require('../src/models/TU');
const TUE = require('../src/models/TUE');

const fillTUEs = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');

        const tuesToInsert = [
            // EE - Power Systems III
            {
                name: 'Electrical Machines',
                code: 'EE_L3_PWR301',
                tuId: '6922469a8c8fc26b85e5a49e',
                credits: 2,
                teacherId: '69221f02c46c5f2bc55ae381', // Teacher 1
                volumeHours: 45,
                evaluationStructure: [
                    { name: 'TP 1', type: 'TP', coefficient: 15 },
                    { name: 'TP 2', type: 'TP', coefficient: 15 },
                    { name: 'DS', type: 'DS', coefficient: 20 },
                    { name: 'Final Exam', type: 'Final', coefficient: 50 }
                ]
            },
            {
                name: 'Power Distribution',
                code: 'EE_L3_PWR302',
                tuId: '6922469a8c8fc26b85e5a49e',
                credits: 2,
                teacherId: '69221fcfc46c5f2bc55ae3b1', // Teacher 3
                volumeHours: 45,
                evaluationStructure: [
                    { name: 'DS 1', type: 'DS', coefficient: 20 },
                    { name: 'DS 2', type: 'DS', coefficient: 20 },
                    { name: 'Project', type: 'Project', coefficient: 10 },
                    { name: 'Final Exam', type: 'Final', coefficient: 50 }
                ]
            },
            // EE - Digital Electronics II
            {
                name: 'Microcontrollers',
                code: 'EE_L3_DIG201',
                tuId: '6922469a8c8fc26b85e5a4a1',
                credits: 2,
                teacherId: '69221fcfc46c5f2bc55ae3b1', // Teacher 3
                volumeHours: 50,
                evaluationStructure: [
                    { name: 'TP 1', type: 'TP', coefficient: 20 },
                    { name: 'TP 2', type: 'TP', coefficient: 20 },
                    { name: 'Final Exam', type: 'Final', coefficient: 60 }
                ]
            },
            {
                name: 'FPGA Design',
                code: 'EE_L3_DIG202',
                tuId: '6922469a8c8fc26b85e5a4a1',
                credits: 1,
                teacherId: '69221fcfc46c5f2bc55ae3b1', // Teacher 3
                volumeHours: 30,
                evaluationStructure: [
                    { name: 'Project', type: 'Project', coefficient: 40 },
                    { name: 'Final Exam', type: 'Final', coefficient: 60 }
                ]
            },
            // CS - Database Systems
            {
                name: 'SQL & Relational Databases',
                code: 'CS_L3_DB301',
                tuId: '6922469b8c8fc26b85e5a4a7',
                credits: 2,
                teacherId: '69221f35c46c5f2bc55ae386', // Teacher 2
                volumeHours: 40,
                evaluationStructure: [
                    { name: 'TP 1', type: 'TP', coefficient: 20 },
                    { name: 'TP 2', type: 'TP', coefficient: 20 },
                    { name: 'Final Exam', type: 'Final', coefficient: 60 }
                ]
            },
            {
                name: 'NoSQL Databases',
                code: 'CS_L3_DB302',
                tuId: '6922469b8c8fc26b85e5a4a7',
                credits: 2,
                teacherId: '69221fcfc46c5f2bc55ae3b1', // Teacher 3
                volumeHours: 40,
                evaluationStructure: [
                    { name: 'DS', type: 'DS', coefficient: 20 },
                    { name: 'Project', type: 'Project', coefficient: 30 },
                    { name: 'Final Exam', type: 'Final', coefficient: 50 }
                ]
            },
            // CS - Web Development
            {
                name: 'Frontend Development',
                code: 'CS_L3_WEB201',
                tuId: '6922469b8c8fc26b85e5a4aa',
                credits: 2,
                teacherId: '69221f35c46c5f2bc55ae386', // Teacher 2
                volumeHours: 45,
                evaluationStructure: [
                    { name: 'TP 1', type: 'TP', coefficient: 15 },
                    { name: 'TP 2', type: 'TP', coefficient: 15 },
                    { name: 'Project', type: 'Project', coefficient: 20 },
                    { name: 'Final Exam', type: 'Final', coefficient: 50 }
                ]
            },
            {
                name: 'Backend Development',
                code: 'CS_L3_WEB202',
                tuId: '6922469b8c8fc26b85e5a4aa',
                credits: 1,
                teacherId: '69221fcfc46c5f2bc55ae3b1', // Teacher 3
                volumeHours: 30,
                evaluationStructure: [
                    { name: 'TP', type: 'TP', coefficient: 20 },
                    { name: 'Project', type: 'Project', coefficient: 30 },
                    { name: 'Final Exam', type: 'Final', coefficient: 50 }
                ]
            }
        ];

        for (const tueData of tuesToInsert) {
            const exists = await TUE.findOne({ code: tueData.code });
            if (exists) {
                console.log(`TUE ${tueData.code} already exists. Skipping.`);
            } else {
                await TUE.create(tueData);
                console.log(`Created TUE: ${tueData.name} (${tueData.code})`);
            }
        }

        console.log('\nAll TUEs processed.');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fillTUEs();
