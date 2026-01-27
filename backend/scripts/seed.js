const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Field = require('../src/models/Field');
const Promotion = require('../src/models/Promotion');
const Semester = require('../src/models/Semester');
const TU = require('../src/models/TU');
const TUE = require('../src/models/TUE');
const Student = require('../src/models/Student');
const User = require('../src/models/User');
const Grade = require('../src/models/Grade');
const TUResult = require('../src/models/TUResult');
const SemesterResult = require('../src/models/SemesterResult');
const AnnualResult = require('../src/models/AnnualResult');
const CalculationStatus = require('../src/models/CalculationStatus');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
const ACADEMIC_YEAR = '2023-2024';

const firstNames = [
    'Jean', 'Marie', 'Paul', 'Alice', 'David', 'Sophie', 'Michel', 'Emma', 'Francois', 'Fatima',
    'Ibrahim', 'Aicha', 'Moussa', 'Aminata', 'Brahima', 'Mariam', 'Abdoul', 'Rasmata', 'Boureima', 'Salimata',
    'Issa', 'Nadia', 'Adama', 'Clarisse', 'Hassan', 'Carine', 'Ousmane', 'Nene', 'Seydou', 'Lea',
    'Abdoulaye', 'Awa', 'Kader', 'Noelle', 'Souleymane', 'Mariam', 'Gael', 'Justine', 'Karim', 'Ariane'
];

const lastNames = [
    'Ouedraogo', 'Kabore', 'Sawadogo', 'Traore', 'Compaore', 'Zoungrana', 'Ouattara', 'Sankara', 'Zongo', 'Diallo',
    'Kone', 'Sow', 'Barro', 'Kinda', 'Yameogo', 'Nacanabo', 'Tiendrebeogo', 'Ouoba', 'Kabore', 'Toe',
    'Zerbo', 'Bationo', 'Ilboudo', 'Kouanda', 'Kafando', 'Yarga', 'Savadogo', 'Somda', 'Kagonde', 'Ganou'
];

const birthPlaces = ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Ouahigouya', "Fada N'gourma"];

function randBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(list) {
    return list[randBetween(0, list.length - 1)];
}

function randomDate(startYear, endYear) {
    const year = randBetween(startYear, endYear);
    const month = randBetween(0, 11);
    const day = randBetween(1, 28);
    return new Date(Date.UTC(year, month, day));
}

function buildStudents(count, startIndex, promotionId, fieldId) {
    const students = [];
    for (let i = 0; i < count; i++) {
        const firstName = firstNames[(startIndex + i) % firstNames.length];
        const lastName = lastNames[(startIndex + i) % lastNames.length];
        const studentId = `BIT2023${String(startIndex + i + 1).padStart(3, '0')}`;
        students.push({
            studentId,
            firstName,
            lastName,
            dateOfBirth: randomDate(1999, 2004),
            placeOfBirth: pick(birthPlaces),
            fieldId,
            promotionId,
            academicYear: ACADEMIC_YEAR,
            isActive: true,
        });
    }
    return students;
}

function splitCredits(credits) {
    if (credits >= 6) return [Math.floor(credits / 2), Math.ceil(credits / 2)];
    if (credits === 4) return [2, 2];
    if (credits === 3) return [2, 1];
    return [credits, 0];
}

async function resetCollections() {
    await Grade.deleteMany({});
    await TUResult.deleteMany({});
    await SemesterResult.deleteMany({});
    await AnnualResult.deleteMany({});
    await CalculationStatus.deleteMany({});
    await Student.deleteMany({});
    await TUE.deleteMany({});
    await TU.deleteMany({});
    await Semester.deleteMany({});
    await Promotion.deleteMany({});
    await Field.deleteMany({});

    await User.deleteMany({ email: { $ne: 'admin@bit.com' } });
}

async function ensureAdmin() {
    const existingAdmin = await User.findOne({ email: 'admin@bit.com' });
    if (!existingAdmin) {
        await User.create({
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@bit.com',
            password: 'admin123',
            role: 'admin',
            isActive: true,
        });
    }
}

async function createUsers() {
    const users = [
        {
            firstName: 'Dr. Ahmed',
            lastName: 'Ouedraogo',
            email: 'teacher1@bit.com',
            password: 'teacher123',
            role: 'teacher',
        },
        {
            firstName: 'Prof. Fatou',
            lastName: 'Diop',
            email: 'teacher2@bit.com',
            password: 'teacher123',
            role: 'teacher',
        },
        {
            firstName: 'Dr. Pierre',
            lastName: 'Zoungrana',
            email: 'teacher3@bit.com',
            password: 'teacher123',
            role: 'teacher',
        },
        {
            firstName: 'Mrs. Aminata',
            lastName: 'Kabore',
            email: 'manager@bit.com',
            password: 'manager123',
            role: 'schooling_manager',
        },
    ];

    const created = {};
    for (const user of users) {
        const existing = await User.findOne({ email: user.email });
        if (existing) {
            created[user.email] = existing;
        } else {
            created[user.email] = await User.create(user);
        }
    }
    return created;
}

async function seed() {
    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI is not set');
    }

    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await resetCollections();
    await ensureAdmin();
    const users = await createUsers();

    const fields = await Field.create([
        {
            name: 'Electrical Engineering & Renewable Energies',
            code: 'EE',
            description: 'Electrical systems and renewable energy technologies',
        },
        {
            name: 'Computer Science & Software Engineering',
            code: 'CS',
            description: 'Software development and computer systems',
        },
    ]);

    const fieldMap = {
        EE: fields.find((f) => f.code === 'EE'),
        CS: fields.find((f) => f.code === 'CS'),
    };

    const promotions = await Promotion.create([
        {
            name: 'L3 EE 2023-2024',
            fieldId: fieldMap.EE._id,
            level: 'L3',
            academicYear: ACADEMIC_YEAR,
        },
        {
            name: 'L3 CS 2023-2024',
            fieldId: fieldMap.CS._id,
            level: 'L3',
            academicYear: ACADEMIC_YEAR,
        },
    ]);

    const promoMap = {
        EE: promotions.find((p) => p.name.startsWith('L3 EE')),
        CS: promotions.find((p) => p.name.startsWith('L3 CS')),
    };

    const semesters = await Semester.create([
        { promotionId: promoMap.EE._id, level: 'L3', order: 1, name: 'S5' },
        { promotionId: promoMap.EE._id, level: 'L3', order: 2, name: 'S6' },
        { promotionId: promoMap.CS._id, level: 'L3', order: 1, name: 'S5' },
        { promotionId: promoMap.CS._id, level: 'L3', order: 2, name: 'S6' },
    ]);

    const semesterMap = {
        EE_S5: semesters.find((s) => s.promotionId.equals(promoMap.EE._id) && s.order === 1),
        EE_S6: semesters.find((s) => s.promotionId.equals(promoMap.EE._id) && s.order === 2),
        CS_S5: semesters.find((s) => s.promotionId.equals(promoMap.CS._id) && s.order === 1),
        CS_S6: semesters.find((s) => s.promotionId.equals(promoMap.CS._id) && s.order === 2),
    };

    const tuSeed = [
        { key: 'EE_S5', name: 'Renewable Energy IV', credits: 4 },
        { key: 'EE_S5', name: 'Power Systems III', credits: 4 },
        { key: 'EE_S5', name: 'Digital Electronics II', credits: 3 },
        { key: 'EE_S5', name: 'Energy Management', credits: 4 },
        { key: 'EE_S5', name: 'Smart Grids', credits: 4 },
        { key: 'EE_S5', name: 'Telecommunications', credits: 3 },
        { key: 'EE_S6', name: 'Research Methods', credits: 4 },
        { key: 'EE_S6', name: 'Control Systems', credits: 4 },
        { key: 'EE_S6', name: 'Power Electronics', credits: 3 },
        { key: 'EE_S6', name: 'Internship', credits: 8 },
        { key: 'EE_S6', name: 'Project Management', credits: 4 },
        { key: 'EE_S6', name: 'Entrepreneurship', credits: 3 },
        { key: 'CS_S5', name: 'Advanced Programming', credits: 4 },
        { key: 'CS_S5', name: 'Database Systems', credits: 4 },
        { key: 'CS_S5', name: 'Web Development', credits: 3 },
        { key: 'CS_S5', name: 'Operating Systems', credits: 4 },
        { key: 'CS_S5', name: 'Computer Networks', credits: 4 },
        { key: 'CS_S5', name: 'Software Engineering', credits: 3 },
        { key: 'CS_S6', name: 'AI Fundamentals', credits: 4 },
        { key: 'CS_S6', name: 'Mobile Development', credits: 4 },
        { key: 'CS_S6', name: 'Cloud Computing', credits: 3 },
        { key: 'CS_S6', name: 'Capstone Project', credits: 8 },
        { key: 'CS_S6', name: 'Security', credits: 4 },
        { key: 'CS_S6', name: 'Research Methods', credits: 3 },
    ];

    const tus = [];
    for (const seed of tuSeed) {
        const tu = await TU.create({
            name: seed.name,
            semesterId: semesterMap[seed.key]._id,
            credits: seed.credits,
        });
        tus.push(tu);
    }

    const tueNamesByTU = {
        'Renewable Energy IV': ['Solar Thermal Energy', 'Wind Energy Systems'],
        'Power Systems III': ['Electrical Machines', 'Power Distribution'],
        'Digital Electronics II': ['Microcontrollers', 'FPGA Design'],
        'Advanced Programming': ['Object-Oriented Programming', 'Data Structures & Algorithms'],
        'Database Systems': ['SQL & Relational Databases', 'NoSQL Databases'],
        'Web Development': ['Frontend Development', 'Backend Development'],
    };

    const teacherPoolEE = [users['teacher1@bit.com'], users['teacher3@bit.com']];
    const teacherPoolCS = [users['teacher2@bit.com'], users['teacher3@bit.com']];

    const tues = [];
    let teacherIndexEE = 0;
    let teacherIndexCS = 0;

    for (const tu of tus) {
        const names = tueNamesByTU[tu.name] || [
            `${tu.name} Fundamentals`,
            `${tu.name} Lab`,
        ];

        const [c1, c2] = splitCredits(tu.credits);
        const credits = [c1, c2].filter((c) => c > 0);

        const isEE = tu.semesterId.equals(semesterMap.EE_S5._id) || tu.semesterId.equals(semesterMap.EE_S6._id);
        const teacher = isEE ? teacherPoolEE[teacherIndexEE++ % teacherPoolEE.length] : teacherPoolCS[teacherIndexCS++ % teacherPoolCS.length];

        for (let i = 0; i < credits.length; i++) {
            const tue = await TUE.create({
                name: names[i] || `${tu.name} Part ${i + 1}`,
                tuId: tu._id,
                credits: credits[i],
                teacherId: teacher._id,
                volumeHours: randBetween(30, 60),
            });
            tues.push(tue);
        }
    }

    const studentsEE = buildStudents(20, 0, promoMap.EE._id, fieldMap.EE._id);
    const studentsCS = buildStudents(20, 20, promoMap.CS._id, fieldMap.CS._id);

    const students = await Student.create([...studentsEE, ...studentsCS]);

    const tuesByPromotion = {
        EE: tues.filter((tue) => {
            const tu = tus.find((item) => item._id.equals(tue.tuId));
            return tu.semesterId.equals(semesterMap.EE_S5._id) || tu.semesterId.equals(semesterMap.EE_S6._id);
        }),
        CS: tues.filter((tue) => {
            const tu = tus.find((item) => item._id.equals(tue.tuId));
            return tu.semesterId.equals(semesterMap.CS_S5._id) || tu.semesterId.equals(semesterMap.CS_S6._id);
        }),
    };

    let gradeCount = 0;
    for (const student of students) {
        const isEE = student.promotionId.equals(promoMap.EE._id);
        const studentTues = isEE ? tuesByPromotion.EE : tuesByPromotion.CS;

        for (const tue of studentTues) {
            const presence = randBetween(12, 20);
            const participation = randBetween(8, 18);
            const evaluation = randBetween(6, 19);

            await Grade.create({
                studentId: student._id,
                tueId: tue._id,
                presence,
                participation,
                evaluation,
                academicYear: ACADEMIC_YEAR,
            });
            gradeCount++;
        }
    }

    console.log('Seed complete');
    console.log(`Fields: ${fields.length}`);
    console.log(`Promotions: ${promotions.length}`);
    console.log(`Semesters: ${semesters.length}`);
    console.log(`TUs: ${tus.length}`);
    console.log(`TUEs: ${tues.length}`);
    console.log(`Students: ${students.length}`);
    console.log(`Grades: ${gradeCount}`);
}

seed()
    .catch((error) => {
        console.error('Seed error:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
