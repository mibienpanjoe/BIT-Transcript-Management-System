const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const Student = require('../models/Student');
const Semester = require('../models/Semester');
const SemesterResult = require('../models/SemesterResult');
const TUResult = require('../models/TUResult');
const TU = require('../models/TU');
const TUE = require('../models/TUE');
const Grade = require('../models/Grade');

let browser = null;
let compiledTemplate = null;
let cachedStyles = null;

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
    const templatePath = path.join(__dirname, '../templates/transcript-template.html');
    const stylePath = path.join(__dirname, '../templates/transcript-styles.css');

    const templateHtml = await fs.promises.readFile(templatePath, 'utf8');
    cachedStyles = await fs.promises.readFile(stylePath, 'utf8');
    compiledTemplate = handlebars.compile(templateHtml);

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

exports.generateTranscript = async (studentId, semesterId, academicYear, res) => {
    let page = null;
    try {
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
                dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-GB') : 'N/A', // DD/MM/YYYY
                placeOfBirth: student.placeOfBirth || 'N/A',
                field: student.fieldId?.name || 'N/A',
                speciality: student.fieldId?.name || 'N/A', // Assuming speciality is same as field for now, or derive if available
                licence: 'L3', // TODO: Derive dynamically if possible, hardcoded for now based on template
                mention: 'Engineering Sciences' // Hardcoded based on template, or derive
            },
            academicYear,
            currentDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            semesters: [],
            annual: {
                average: '-',
                result: 'PENDING',
                rating: '-',
                totalCredits: 0,
                mention: '-',
                isValidated: false
            },
            logoBase64
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
                status: semResult ? semResult.status : 'PENDING',
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
                        name: tue.name,
                        credits: tue.credits,
                        grade: grade ? grade.finalGrade.toFixed(2) : '-',
                        isFirst: i === 0
                    });
                }

                // If no TUEs, we still need one row to display the TU
                const tueCount = tuesData.length > 0 ? tuesData.length : 1;
                semesterTotalRows += tueCount;

                semesterData.tus.push({
                    name: tu.name,
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
            : 'ADJOURNED'; // Changed from NOT VALIDATED to match template style

        let rating = '-';
        if (annualAvg !== '-') {
            const avg = parseFloat(annualAvg);
            if (avg >= 18) rating = 'Excellent (A++)';
            else if (avg >= 17) rating = 'Very Good (A+)';
            else if (avg >= 16) rating = 'Very Good (A)';
            else if (avg >= 15) rating = 'Good (B+)';
            else if (avg >= 14) rating = 'Good (B)';
            else if (avg >= 13) rating = 'Fairly Good (C+)';
            else if (avg >= 12) rating = 'Fairly Good (C)';
            else if (avg >= 11) rating = 'Passable (D+)';
            else if (avg >= 10) rating = 'Passable (D)';
            else rating = 'Fail (F)';
        }

        templateData.annual = {
            average: annualAvg,
            result: annualResult,
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

// DEBUG: Save HTML to disk
try {
    fs.writeFileSync('debug_last_transcript.html', html);
    console.log('[PDF Debug] Saved debug_last_transcript.html');
} catch (e) { 
    console.error('Failed to save debug HTML:', e); 
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

        // DEBUG: Save PDF to disk
        try {
            fs.writeFileSync('debug_last_transcript.pdf', pdfBuffer);
            console.log('[PDF Debug] Saved debug_last_transcript.pdf');
        } catch (e) { console.error('Failed to save debug PDF:', e); }

        // 5. Send Response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=transcript_${studentId}.pdf`);
        res.setHeader('Content-Length', pdfBuffer.length);
        res.end(pdfBuffer);

    } catch (error) {
        console.error('Puppeteer PDF Generation Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: error.message });
        }
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
