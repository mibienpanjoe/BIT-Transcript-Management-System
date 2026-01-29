const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const Student = require('../models/Student');
const Semester = require('../models/Semester');
const SemesterResult = require('../models/SemesterResult');
const TUResult = require('../models/TUResult');
//const TU = require('../models/TU');
const TUE = require('../models/TUE');
const Grade = require('../models/Grade');

let browser = null;
let compiledTemplate = null;
let cachedStyles = null;
let compiledSemesterTemplate = null;
let cachedSemesterStyles = null;

// Timeout helper
const withTimeout = (promise, ms, errorMsg) => {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error(errorMsg)), ms)
        )
    ]);
};

// Load and cache templates
const loadTemplates = async () => {
    const transcriptTemplatePath = path.join(__dirname, '../templates/transcript-template.html');
    const transcriptStylePath = path.join(__dirname, '../templates/transcript-styles.css');
    const semesterTemplatePath = path.join(__dirname, '../templates/semester-results-template.html');
    const semesterStylePath = path.join(__dirname, '../templates/semester-results-styles.css');

    const transcriptHtml = await fs.promises.readFile(transcriptTemplatePath, 'utf8');
    cachedStyles = await fs.promises.readFile(transcriptStylePath, 'utf8');
    compiledTemplate = handlebars.compile(transcriptHtml);

    try {
        const semesterHtml = await fs.promises.readFile(semesterTemplatePath, 'utf8');
        cachedSemesterStyles = await fs.promises.readFile(semesterStylePath, 'utf8');
        compiledSemesterTemplate = handlebars.compile(semesterHtml);
    } catch (err) {
        console.warn('Semester results templates not found:', err.message);
    }

    console.log('Templates loaded and cached');
};

const initBrowser = async () => {
    // Check if browser is connected, not just exists
    if (!browser || !browser.isConnected()) {
        if (browser) {
            try {
                await browser.close();
            } catch (err) {
                console.error('Error closing dead browser:', err);
            }
        }
        console.log('Launching Puppeteer browser...');
        browser = await puppeteer.launch({
            headless: true, // Changed from 'new' for better compatibility
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--font-render-hinting=none'
            ]
        });

        // Auto-recovery on disconnect
        browser.on('disconnected', () => {
            console.log('Browser disconnected, resetting...');
            browser = null;
        });
    }
    return browser;
};

const closeBrowser = async () => {
    if (browser) {
        console.log('Closing Puppeteer browser...');
        await browser.close();
        browser = null;
    }
};

exports.initBrowser = initBrowser;
exports.closeBrowser = closeBrowser;
exports.loadTemplates = loadTemplates;

const getI18n = (lang) => {
    const isFr = lang === 'fr';
    return {
        title: isFr ? 'Releve de Notes' : 'Grade Transcript',
        academicYear: isFr ? 'Annee academique' : 'Academic year',
        name: isFr ? 'Nom' : 'Name',
        firstName: isFr ? 'Prenom(s)' : 'First Name(s)',
        dateAndPlace: isFr ? 'Date & lieu de naissance' : 'Date & Place of birth',
        studentId: isFr ? 'Matricule' : 'Student ID',
        licence: isFr ? 'Licence' : 'Licence',
        field: isFr ? 'Filiere' : 'Field',
        mention: isFr ? 'Mention' : 'Mention',
        speciality: isFr ? 'Specialite' : 'Speciality',
        results: isFr ? 'Resultats' : 'Results',
        grade: isFr ? 'Note/20' : 'Grade/20',
        tuAverage: isFr ? 'Moyenne TU' : 'TU Average',
        acquiredCredits: isFr ? 'Credits acquis' : 'Acquired Credits',
        tuValidation: isFr ? 'Validation TU' : 'TU Validation',
        tueCredits: isFr ? 'Credits TUE' : 'TUE Credits',
        semesterSummary: isFr ? 'Moyenne du semestre & Total des credits acquis' : 'Semester average & Total credits acquired',
        annualAverage: isFr ? 'Moyenne annuelle' : 'Annual Average',
        annualResult: isFr ? 'Resultat annuel' : 'Annual Result',
        rating: isFr ? 'Mention' : 'Rating',
        totalCredits: isFr ? 'Total des credits acquis' : 'Total credits acquired',
        notesTitle: 'N. B.',
        description: isFr ? 'Description' : 'Description',
        noteV: isFr ? 'V: TU Validee;' : 'V: TU Validated;',
        noteNV: isFr ? 'NV: TU Non Validee;' : 'NV: TU Not Validated;',
        noteVC: isFr ? 'V/C: TU Validee par Compensation.' : 'V/C: TU Validated by Compensation.',
        semesterRule: isFr
            ? 'Un semestre est valide si et seulement si la moyenne du semestre ≥ 12 et la moyenne de chaque TU ≥ 12 (une TU entre 8 et 12 peut etre compensee);'
            : 'A semester is validated if and only if the semester average ≥ 12 and the average of each TU ≥ 12 (one TU between 8 and 12 can be compensated);',
        invalidNotice: isFr
            ? 'Toute suppression ou surcharge entraine la nullite de ce document;'
            : 'Any deletion or overload causes the invalidity of this document;',
        copiesNotice: isFr
            ? "Un seul releve est delivre. Il appartient a l'interesse de faire des copies certifiees conformes."
            : 'Only one transcript is issued. It is up to the interested party to make certified copies.',
        ratingScaleTitle: isFr
            ? 'Mention selon la moyenne TU/semestre (Av):'
            : 'Rating according TU/semester average (Av):',
        ratingFail: isFr ? 'Echec: F (Av < 10);' : 'Fail: F (Av < 10);',
        ratingPassable: isFr
            ? 'Passable: D (10 ≤ Av < 11), D+ (11 ≤ Av < 12);'
            : 'Passable: D (10 ≤ Av < 11), D+ (11 ≤ Av < 12);',
        ratingFairlyGood: isFr
            ? 'Assez bien: C (12 ≤ Av < 13), C+ (13 ≤ Av < 14);'
            : 'Fairly Good: C (12 ≤ Av < 13), C+ (13 ≤ Av < 14);',
        ratingGood: isFr
            ? 'Bien: B (14 ≤ Av < 15), B+ (15 ≤ Av < 16);'
            : 'Good: B (14 ≤ Av < 15), B+ (15 ≤ Av < 16);',
        ratingVeryGood: isFr
            ? 'Tres bien: A (16 ≤ Av < 17), A+ (17 ≤ Av < 18);'
            : 'Very Good: A (16 ≤ Av < 17), A+ (17 ≤ Av < 18);',
        ratingExcellent: isFr ? 'Excellent: A++ (Av ≥ 18)' : 'Excellent: A++ (Av ≥ 18)',
        academicDirector: isFr ? 'Directeur Academique' : 'Academic Director',
        defaultMention: isFr ? "Sciences de l'ingenieur" : 'Engineering Sciences',
        validated: isFr ? 'VALIDE' : 'VALIDATED',
        notValidated: isFr ? 'NON VALIDE' : 'NOT VALIDATED',
        adjourned: isFr ? 'AJOURNE' : 'ADJOURNED',
        pending: isFr ? 'EN ATTENTE' : 'PENDING'
    };
};

const translateStatus = (status, i18n) => {
    if (status === 'VALIDATED') return i18n.validated;
    if (status === 'NOT VALIDATED') return i18n.notValidated;
    if (status === 'ADJOURNED') return i18n.adjourned;
    if (status === 'PENDING') return i18n.pending;
    return status;
};

const getRatingLabel = (average, i18n, lang) => {
    if (average === '-') return '-';
    const avg = parseFloat(average);
    const isFr = lang === 'fr';
    if (avg >= 18) return isFr ? 'Excellent (A++)' : 'Excellent (A++)';
    if (avg >= 17) return isFr ? 'Tres bien (A+)' : 'Very Good (A+)';
    if (avg >= 16) return isFr ? 'Tres bien (A)' : 'Very Good (A)';
    if (avg >= 15) return isFr ? 'Bien (B+)' : 'Good (B+)';
    if (avg >= 14) return isFr ? 'Bien (B)' : 'Good (B)';
    if (avg >= 13) return isFr ? 'Assez bien (C+)' : 'Fairly Good (C+)';
    if (avg >= 12) return isFr ? 'Assez bien (C)' : 'Fairly Good (C)';
    if (avg >= 11) return isFr ? 'Passable (D+)' : 'Passable (D+)';
    if (avg >= 10) return isFr ? 'Passable (D)' : 'Passable (D)';
    return isFr ? 'Echec (F)' : 'Fail (F)';
};

const courseTranslationsFr = {
    'Renewable Energy IV': 'Energie renouvelable IV',
    'Power Systems III': 'Systemes de puissance III',
    'Digital Electronics II': 'Electronique numerique II',
    'Energy Management': "Gestion de l'energie",
    'Smart Grids': 'Reseaux intelligents',
    'Telecommunications': 'Telecommunications',
    'Research Methods': 'Methodes de recherche',
    'Control Systems': 'Systemes de commande',
    'Power Electronics': 'Electronique de puissance',
    'Internship': 'Stage',
    'Project Management': 'Gestion de projet',
    'Entrepreneurship': 'Entrepreneuriat',
    'Advanced Programming': 'Programmation avancee',
    'Database Systems': 'Systemes de bases de donnees',
    'Web Development': 'Developpement web',
    'Operating Systems': "Systemes d'exploitation",
    'Computer Networks': 'Reseaux informatiques',
    'Software Engineering': 'Genie logiciel',
    'AI Fundamentals': "Fondamentaux de l'IA",
    'Mobile Development': 'Developpement mobile',
    'Cloud Computing': 'Informatique en nuage',
    'Capstone Project': "Projet de fin d'etudes",
    'Security': 'Securite',
    'Solar Thermal Energy': 'Energie solaire thermique',
    'Wind Energy Systems': "Systemes d'energie eolienne",
    'Electrical Machines': 'Machines electriques',
    'Power Distribution': 'Distribution electrique',
    'Microcontrollers': 'Microcontroleurs',
    'FPGA Design': 'Conception FPGA',
    'Object-Oriented Programming': 'Programmation orientee objet',
    'Data Structures & Algorithms': 'Structures de donnees et algorithmes',
    'SQL & Relational Databases': 'SQL et bases de donnees relationnelles',
    'NoSQL Databases': 'Bases de donnees NoSQL',
    'Frontend Development': 'Developpement frontend',
    'Backend Development': 'Developpement backend'
};

const translateCourseName = (name, lang) => {
    if (lang !== 'fr') return name;
    if (courseTranslationsFr[name]) return courseTranslationsFr[name];

    if (name.endsWith(' Fundamentals')) {
        return name.replace(' Fundamentals', ' Fondamentaux');
    }
    if (name.endsWith(' Lab')) {
        return name.replace(' Lab', ' TP');
    }
    if (name.includes(' Part ')) {
        return name.replace(' Part ', ' Partie ');
    }

    return name;
};

const buildTranscriptPdfBuffer = async (studentId, semesterId, academicYear, lang = 'en', { debug } = {}) => {
    let page = null;
    try {
        const locale = lang === 'fr' ? 'fr-FR' : 'en-GB';
        const currentDateLocale = lang === 'fr' ? 'fr-FR' : 'en-US';
        const i18n = getI18n(lang);
        // Ensure templates are loaded
        if (!compiledTemplate || !cachedStyles) {
            console.log('Templates not cached, loading now...');
            await loadTemplates();
        }

        // 1. Fetch Data
        const student = await Student.findById(studentId)
            .populate('fieldId')
            .populate('promotionId');

        if (!student) throw new Error('Student not found');

        const semesters = await Semester.find({
            promotionId: student.promotionId._id
        }).sort({ order: 1 });

        // Load Logo
        let logoBase64 = '';
        try {
            const logoPath = path.join(__dirname, '../templates/logo.jpg');
            const logoBuffer = await fs.promises.readFile(logoPath);
            logoBase64 = logoBuffer.toString('base64');
        } catch (err) {
            console.warn('Logo not found or could not be loaded:', err.message);
        }

        // 2. Prepare Data Structure for Template
        const templateData = {
            student: {
                lastName: student.lastName.toUpperCase(),
                firstName: student.firstName,
                studentId: student.studentId,
                dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString(locale) : 'N/A',
                placeOfBirth: student.placeOfBirth || 'N/A',
                field: student.fieldId?.name || 'N/A',
                speciality: student.fieldId?.name || 'N/A', // Assuming speciality is same as field for now, or derive if available
                licence: student.promotionId?.level || 'L3',
                mention: i18n.defaultMention
            },
            academicYear,
            currentDate: new Date().toLocaleDateString(currentDateLocale, { year: 'numeric', month: 'long', day: 'numeric' }),
            semesters: [],
            annual: {
                average: '-',
                result: 'PENDING',
                rating: '-',
                totalCredits: 0,
                mention: '-',
                isValidated: false
            },
            logoBase64,
            i18n
        };

        let annualTotalCredits = 0;
        let annualWeightedScore = 0;
        let semesterCount = 0;
        let allSemestersValidated = true;

        for (const semester of semesters) {
            const semResult = await SemesterResult.findOne({
                studentId,
                semesterId: semester._id,
                academicYear
            });

            const semesterData = {
                name: semester.name,
                average: semResult ? semResult.average.toFixed(2) : '-',
                totalCredits: semResult ? semResult.totalCredits : 0,
                creditsEarned: (semResult && semResult.status === 'VALIDATED') ? semResult.totalCredits : 0,
                status: semResult ? translateStatus(semResult.status, i18n) : i18n.pending,
                isValidated: semResult ? semResult.status === 'VALIDATED' : false,
                tus: [],
                totalRows: 0 // For rowspan
            };

            const tuResults = await TUResult.find({
                studentId,
                semesterId: semester._id,
                academicYear
            }).populate('tuId');

            let semesterTotalRows = 0;

            for (const tuRes of tuResults) {
                const tu = tuRes.tuId;

                // Null check - skip if TU was deleted
                if (!tu) {
                    console.warn(`TU not found for TUResult ${tuRes._id}, skipping...`);
                    continue;
                }

                const tues = await TUE.find({ tuId: tu._id, isActive: true });
                const tuesData = [];

                for (let i = 0; i < tues.length; i++) {
                    const tue = tues[i];
                    const grade = await Grade.findOne({ studentId, tueId: tue._id, academicYear });
                    tuesData.push({
                        name: translateCourseName(tue.name, lang),
                        credits: tue.credits,
                        grade: grade ? grade.finalGrade.toFixed(2) : '-',
                        isFirst: i === 0
                    });
                }

                // If no TUEs, we still need one row to display the TU
                const tueCount = tuesData.length > 0 ? tuesData.length : 1;
                semesterTotalRows += tueCount;

                semesterData.tus.push({
                    name: translateCourseName(tu.name, lang),
                    totalCredits: tu.credits,
                    average: tuRes.average.toFixed(2),
                    creditsEarned: tuRes.creditsEarned,
                    validationStatus: tuRes.status,
                    tues: tuesData,
                    tueCount: tueCount,
                    isFirst: semesterData.tus.length === 0 // Check if this is the first TU in the list so far
                });
            }

            // Add 2 for summary rows (Average/Credits row + Decision row)
            // But wait, the semester name rowspan only covers the content rows, not summary rows usually?
            // Looking at the template: 
            // The semester cell rowspan covers all TU/TUE rows.
            // The summary rows are separate <tr>s at the bottom.
            // So totalRows should be just the sum of tueCounts.
            semesterData.totalRows = semesterTotalRows;

            templateData.semesters.push(semesterData);

            if (semResult) {
                semesterCount++;
                annualTotalCredits += semResult.totalCredits;
                annualWeightedScore += (semResult.average * semResult.totalCredits);
                if (semResult.status !== 'VALIDATED') allSemestersValidated = false;
            }
        }

        // Calculate Annual Summary
        const annualAvg = annualTotalCredits > 0 ? (annualWeightedScore / annualTotalCredits).toFixed(2) : '-';
        const bothSemestersCompleted = semesterCount === 2;
        const meetsMinimumCredits = annualTotalCredits >= 48;

        const annualResult = (bothSemestersCompleted && allSemestersValidated && meetsMinimumCredits)
            ? 'VALIDATED'
            : 'ADJOURNED';

        const rating = getRatingLabel(annualAvg, i18n, lang);

        templateData.annual = {
            average: annualAvg,
            result: translateStatus(annualResult, i18n),
            rating: rating,
            totalCredits: annualTotalCredits,
            mention: rating,
            isValidated: annualResult === 'VALIDATED'
        };

// ... (keep all your existing code until the HTML rendering section)

// 3. Render HTML - FIXED VERSION
if (!compiledTemplate || !cachedStyles) {
    throw new Error('Templates not loaded. Server may not have initialized properly.');
}

// Pass styles directly into the template via {{{styles}}}
const html = compiledTemplate({
    ...templateData,
    styles: cachedStyles  // ADD THIS - inject CSS into template
});

        if (debug) {
            try {
                fs.writeFileSync('debug_last_transcript.html', html);
                console.log('[PDF Debug] Saved debug_last_transcript.html');
            } catch (e) {
                console.error('Failed to save debug HTML:', e);
            }
        }

// 4. Generate PDF with timeout protection
const browserInstance = await initBrowser();

page = await withTimeout(
    browserInstance.newPage(),
    5000,
    'Page creation timeout (5s)'
);

// Set content with proper wait
await withTimeout(
    page.setContent(html, { 
        waitUntil: 'networkidle0',  // Changed from 'load' to 'networkidle0'
        timeout: 10000 
    }),
    12000,
    'Content loading timeout (12s)'
);

// REMOVED: page.addStyleTag() - No longer needed since CSS is in <style> tag

// Optional: Wait for fonts to load
await page.evaluateHandle('document.fonts.ready');

const pdfBuffer = await withTimeout(
    page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
            top: '0.5cm',
            bottom: '0.5cm',
            left: '0.5cm',
            right: '0.5cm'
        },
        preferCSSPageSize: false  // ADD THIS - use our format instead of CSS @page
    }),
    15000,
    'PDF generation timeout (15s)'
);

        if (debug) {
            try {
                fs.writeFileSync('debug_last_transcript.pdf', pdfBuffer);
                console.log('[PDF Debug] Saved debug_last_transcript.pdf');
            } catch (e) {
                console.error('Failed to save debug PDF:', e);
            }
        }

        return pdfBuffer;
    } catch (error) {
        console.error('Puppeteer PDF Generation Error:', error);
        throw error;
    } finally {
        // Always close page, even on error
        if (page) {
            try {
                await page.close();
            } catch (closeErr) {
                console.error('Error closing page:', closeErr);
            }
        }
    }
};

exports.generateTranscriptBuffer = async (studentId, semesterId, academicYear, lang = 'en') => (
    buildTranscriptPdfBuffer(studentId, semesterId, academicYear, lang, { debug: false })
);

exports.generateTranscript = async (studentId, semesterId, academicYear, res, lang = 'en') => {
    try {
        const pdfBuffer = await buildTranscriptPdfBuffer(studentId, semesterId, academicYear, lang, { debug: true });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=transcript_${studentId}.pdf`);
        res.setHeader('Content-Length', pdfBuffer.length);
        res.end(pdfBuffer);
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

const buildSemesterResultsPdfBuffer = async (promotionId, semesterId, academicYear, { debug } = {}) => {
    let page = null;
    try {
        if (!compiledSemesterTemplate || !cachedSemesterStyles) {
            console.log('Semester templates not cached, loading now...');
            await loadTemplates();
        }

        if (!compiledSemesterTemplate || !cachedSemesterStyles) {
            throw new Error('Semester results template not available');
        }

        const Promotion = require('../models/Promotion');
        const TU = require('../models/TU');

        const promotion = await Promotion.findById(promotionId).populate('fieldId');
        if (!promotion) {
            throw new Error('Promotion not found');
        }

        const semester = await Semester.findById(semesterId);
        if (!semester) {
            throw new Error('Semester not found');
        }

        if (semester.promotionId.toString() !== promotionId.toString()) {
            throw new Error('Semester does not belong to the selected promotion');
        }

        const students = await Student.find({
            promotionId,
            academicYear,
            isActive: true
        }).sort({ studentId: 1 });

        const formatNumber = (value) => {
            if (value === '-' || value === null || value === undefined) return '-';
            const num = Number(value);
            if (Number.isNaN(num)) return '-';
            return num.toFixed(2).replace('.', ',');
        };

        const getInternationalGrade = (average) => {
            if (average === null || average === undefined) return '-';
            const avg = Number(average);
            if (Number.isNaN(avg)) return '-';
            if (avg >= 18) return 'A++';
            if (avg >= 17) return 'A+';
            if (avg >= 16) return 'A';
            if (avg >= 15) return 'B+';
            if (avg >= 14) return 'B';
            if (avg >= 13) return 'C+';
            if (avg >= 12) return 'C';
            if (avg >= 11) return 'D+';
            if (avg >= 10) return 'D';
            return 'F';
        };

        const mapConversion = (grade) => {
            switch (grade) {
                case 'A++':
                case 'A+':
                case 'A':
                    return 'Very good (très bien)';
                case 'B+':
                case 'B':
                    return 'Good (bien)';
                case 'C+':
                case 'C':
                    return 'Fairly Good (assez bien)';
                case 'D+':
                case 'D':
                    return 'Passable';
                case 'F':
                    return 'Not passed';
                default:
                    return '-';
            }
        };

        const tus = await TU.find({ semesterId, isActive: true }).sort({ name: 1 });
        const tuIds = tus.map((tu) => tu._id);

        const tusHeader = [];
        const tuesByTu = {};
        for (const tu of tus) {
            const tues = await TUE.find({ tuId: tu._id, isActive: true }).sort({ name: 1 });
            tuesByTu[tu._id.toString()] = tues;
            tusHeader.push({
                name: tu.name,
                credits: tu.credits,
                tues: tues.map((tue) => ({
                    name: tue.name,
                    credits: tue.credits
                })),
                colspan: (tues.length || 1) + 1
            });
        }

        const totalCredits = tus.reduce((sum, tu) => sum + tu.credits, 0);

        let bestAverage = null;
        let lowestAverage = null;
        let averageSum = 0;
        let averageCount = 0;
        let passCount = 0;

        const studentsData = [];
        const allTueIds = [].concat(...Object.values(tuesByTu).map((list) => list.map((tue) => tue._id)));

        for (const [index, student] of students.entries()) {
            const tuResults = await TUResult.find({
                studentId: student._id,
                academicYear,
                tuId: { $in: tuIds }
            });
            const tuResultMap = new Map(tuResults.map((result) => [result.tuId.toString(), result]));

            const grades = await Grade.find({
                studentId: student._id,
                academicYear,
                tueId: { $in: allTueIds }
            });
            const gradeMap = new Map(grades.map((grade) => [grade.tueId.toString(), grade]));

            const semResult = await SemesterResult.findOne({
                studentId: student._id,
                semesterId,
                academicYear
            });

            const row = [];
            const failedTus = [];

            for (const tu of tus) {
                const result = tuResultMap.get(tu._id.toString());
                const tues = tuesByTu[tu._id.toString()] || [];

                if (tues.length === 0) {
                    row.push({ value: '-', className: 'tue-cell' });
                } else {
                    for (const tue of tues) {
                        const grade = gradeMap.get(tue._id.toString());
                        row.push({
                            value: grade ? formatNumber(grade.finalGrade) : formatNumber(0),
                            className: 'tue-cell'
                        });
                    }
                }

                const tuAverageValue = result ? formatNumber(result.average) : '-';
                row.push({ value: tuAverageValue, className: 'tu-avg' });

                if (!result || result.status === 'NV') {
                    failedTus.push(tu.name);
                }
            }

            const finalAverage = semResult ? semResult.average : null;
            const finalAverageFormatted = semResult ? formatNumber(semResult.average) : '-';
            const weightedTotal = semResult ? formatNumber(semResult.average * totalCredits) : '-';
            const internationalGrade = semResult ? getInternationalGrade(semResult.average) : '-';
            const conversion = semResult ? mapConversion(internationalGrade) : '-';
            const passFail = semResult && semResult.status === 'VALIDATED' ? 'PASS' : 'FAIL';
            const passFailClass = passFail === 'PASS' ? 'pass' : 'fail';

            if (typeof finalAverage === 'number') {
                bestAverage = bestAverage === null ? finalAverage : Math.max(bestAverage, finalAverage);
                lowestAverage = lowestAverage === null ? finalAverage : Math.min(lowestAverage, finalAverage);
                averageSum += finalAverage;
                averageCount += 1;
            }

            if (passFail === 'PASS') passCount += 1;

            studentsData.push({
                index: index + 1,
                studentId: student.studentId,
                lastName: student.lastName.toUpperCase(),
                firstName: student.firstName,
                row,
                weightedTotal,
                finalAverage: finalAverageFormatted,
                internationalGrade,
                conversion,
                passFail,
                passFailClass,
                redoExam: passFail === 'FAIL' && failedTus.length > 0 ? `${failedTus.join('; ')};` : ''
            });
        }

        const classAverage = averageCount > 0 ? averageSum / averageCount : 0;
        const totalStudents = students.length;
        const failCount = totalStudents - passCount;
        const successRate = totalStudents > 0 ? (passCount / totalStudents) * 100 : 0;
        const failureRate = totalStudents > 0 ? (failCount / totalStudents) * 100 : 0;

        const getSemesterLabel = (level, order) => {
            const baseByLevel = {
                L1: 1,
                L2: 3,
                L3: 5,
                M1: 7,
                M2: 9
            };
            const base = baseByLevel[level];
            if (!base || !order) return null;
            return `S${base + (order - 1)}`;
        };

        const semesterLabel = getSemesterLabel(promotion.level, semester.order) || semester.name;

        let logoBase64 = '';
        try {
            const logoPath = path.join(__dirname, '../templates/logo.jpg');
            const logoBuffer = await fs.promises.readFile(logoPath);
            logoBase64 = logoBuffer.toString('base64');
        } catch (err) {
            console.warn('Logo not found or could not be loaded:', err.message);
        }

        const templateData = {
            promotionName: promotion.name,
            fieldName: promotion.fieldId?.name || 'N/A',
            semesterTitle: semesterLabel,
            academicYear,
            totalCredits,
            generatedAt: new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }),
            tus: tusHeader,
            students: studentsData,
            stats: {
                bestAverage: formatNumber(bestAverage ?? 0),
                lowestAverage: formatNumber(lowestAverage ?? 0),
                classAverage: formatNumber(classAverage ?? 0),
                successRate: formatNumber(successRate ?? 0),
                failureRate: formatNumber(failureRate ?? 0),
                totalStudents,
                passCount,
                failCount
            },
            logoBase64,
            styles: cachedSemesterStyles
        };

        const html = compiledSemesterTemplate(templateData);

        if (debug) {
            try {
                fs.writeFileSync('debug_last_semester_results.html', html);
                console.log('[PDF Debug] Saved debug_last_semester_results.html');
            } catch (e) {
                console.error('Failed to save debug HTML:', e);
            }
        }

        const browserInstance = await initBrowser();
        page = await withTimeout(
            browserInstance.newPage(),
            5000,
            'Page creation timeout (5s)'
        );

        await withTimeout(
            page.setContent(html, {
                waitUntil: 'networkidle0',
                timeout: 10000
            }),
            12000,
            'Content loading timeout (12s)'
        );

        await page.evaluateHandle('document.fonts.ready');

        const pdfBuffer = await withTimeout(
            page.pdf({
                format: 'A4',
                landscape: true,
                printBackground: true,
                margin: {
                    top: '0.6cm',
                    bottom: '0.6cm',
                    left: '0.6cm',
                    right: '0.6cm'
                },
                preferCSSPageSize: false
            }),
            20000,
            'PDF generation timeout (20s)'
        );

        if (debug) {
            try {
                fs.writeFileSync('debug_last_semester_results.pdf', pdfBuffer);
                console.log('[PDF Debug] Saved debug_last_semester_results.pdf');
            } catch (e) {
                console.error('Failed to save debug PDF:', e);
            }
        }

        return pdfBuffer;
    } catch (error) {
        console.error('Semester Results PDF Error:', error);
        throw error;
    } finally {
        if (page) {
            try {
                await page.close();
            } catch (closeErr) {
                console.error('Error closing page:', closeErr);
            }
        }
    }
};

exports.generateSemesterResultsBuffer = async (promotionId, semesterId, academicYear) => (
    buildSemesterResultsPdfBuffer(promotionId, semesterId, academicYear, { debug: false })
);

exports.generateSemesterResultsPdf = async (promotionId, semesterId, academicYear, res) => {
    try {
        const pdfBuffer = await buildSemesterResultsPdfBuffer(promotionId, semesterId, academicYear, { debug: true });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=semester_results_${promotionId}_${semesterId}.pdf`);
        res.setHeader('Content-Length', pdfBuffer.length);
        res.end(pdfBuffer);
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};
