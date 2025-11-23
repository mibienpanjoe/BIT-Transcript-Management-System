const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Student = require('../models/Student');
const Semester = require('../models/Semester');
const SemesterResult = require('../models/SemesterResult');
const TUResult = require('../models/TUResult');
const TU = require('../models/TU');
const TUE = require('../models/TUE');
const Grade = require('../models/Grade');

exports.generateTranscript = async (studentId, semesterId, academicYear, res) => {
    try {
        const student = await Student.findById(studentId)
            .populate('fieldId')
            .populate('promotionId');

        if (!student) throw new Error('Student not found');

        // Fetch all semesters for this promotion
        // We want to show the full year's transcript if possible
        const semesters = await Semester.find({
            promotionId: student.promotionId._id
        }).sort({ startDate: 1 });

        const doc = new PDFDocument({
            size: 'A4',
            margin: 30,
            bufferPages: true
        });

        doc.pipe(res);
        const col1X = 50;
        const col2X = 300;
        const labelWidth = 110;

        doc.fontSize(10).font('Helvetica');

        // Helper to draw info row
        const drawInfo = (label, value, x, y) => {
            doc.font('Helvetica-Bold').text(label, x, y);
            doc.font('Helvetica').text(value || '-', x + labelWidth, y);
        };

        drawInfo('Name:', student.lastName.toUpperCase(), col1X, startY);
        drawInfo('Field:', student.fieldId.name, col2X, startY);

        drawInfo('First Name(s):', student.firstName, col1X, startY + 15);
        drawInfo('Speciality:', student.fieldId.name, col2X, startY + 15);

        drawInfo('Student ID:', student.studentId, col1X, startY + 30);
        drawInfo('Mention:', student.fieldId.name, col2X, startY + 30);

        const dob = student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A';
        drawInfo('Date & Place of birth:', `${dob} at ${student.placeOfBirth}`, col1X, startY + 45);
        drawInfo('Academic year:', academicYear, col2X, startY + 45);

        doc.y = startY + 70;

        // --- SEMESTER TABLES ---
        let annualTotalCredits = 0;
        let annualWeightedScore = 0;
        let semesterCount = 0;
        let allSemestersValidated = true;

        // Helper to draw table row with borders
        const drawRow = (y, height, fillColor = null) => {
            if (fillColor) {
                doc.rect(30, y, 535, height).fill(fillColor);
            }
            doc.rect(30, y, 535, height).stroke();
            // Vertical lines
            doc.moveTo(colX.tue - 5, y).lineTo(colX.tue - 5, y + height).stroke(); // After TU
            doc.moveTo(colX.cred - 5, y).lineTo(colX.cred - 5, y + height).stroke(); // After TUE
            doc.moveTo(colX.grade - 5, y).lineTo(colX.grade - 5, y + height).stroke(); // After Credits
            doc.moveTo(colX.acq - 5, y).lineTo(colX.acq - 5, y + height).stroke(); // After Grade
            doc.moveTo(colX.val - 5, y).lineTo(colX.val - 5, y + height).stroke(); // After Acquired
        };

        for (const semester of semesters) {
            const semResult = await SemesterResult.findOne({
                studentId,
                semesterId: semester._id,
                academicYear
            });

            // Check if we need a new page
            if (doc.y > 650) doc.addPage();

            // Semester Title
            doc.rect(30, doc.y, 535, 20).fillAndStroke('#333333', '#000000');
            doc.fillColor('white').font('Helvetica-Bold').fontSize(11)
                .text(`${semester.name}`, 30, doc.y - 14, { align: 'center', width: 535 });
            doc.fillColor('black');

            // Table Header
            const tableTop = doc.y;
            drawRow(tableTop, 20, '#d0d0d0');

            doc.fillColor('black').fontSize(9);
            doc.text('TU', colX.tu, tableTop + 6);
            doc.text('TUE', colX.tue + 80, tableTop + 6);
            doc.text('Credits', colX.cred, tableTop + 6);
            doc.text('Grade/20', colX.grade, tableTop + 6);
            doc.text('Acquired', colX.acq, tableTop + 6);
            doc.text('Validation', colX.val, tableTop + 6);

            doc.y = tableTop + 20;

            // Fetch TUs
            const tuResults = await TUResult.find({
                studentId,
                academicYear
            }).populate('tuId');

            // Filter for this semester
            const semesterTUResults = tuResults.filter(r => r.tuId.semesterId.toString() === semester._id.toString());

            for (const tuRes of semesterTUResults) {
                const tu = tuRes.tuId;

                // TU Header Row
                const tuRowHeight = 15;
                drawRow(doc.y, tuRowHeight, '#e0e0e0');

                doc.fillColor('black').font('Helvetica-Bold');
                doc.text(tu.name, colX.tu, doc.y + 4, { width: 250, lineBreak: false, ellipsis: true });
                doc.text(tu.credits.toString(), colX.cred, doc.y + 4);
                doc.text(tuRes.average.toFixed(2), colX.grade, doc.y + 4);
                doc.text(tuRes.creditsEarned.toString(), colX.acq, doc.y + 4);
                doc.text(tuRes.status, colX.val, doc.y + 4);

                doc.y += tuRowHeight;

                // TUEs
                const tues = await TUE.find({ tuId: tu._id, isActive: true });
                doc.font('Helvetica');

                for (const tue of tues) {
                    const tueRowHeight = 15;
                    drawRow(doc.y, tueRowHeight);

                    const grade = await Grade.findOne({ studentId, tueId: tue._id, academicYear });
                    const gradeVal = grade ? grade.finalGrade.toFixed(2) : '-';

                    doc.text(tue.name, colX.tue, doc.y + 4, { width: 280, lineBreak: false, ellipsis: true });
                    doc.text(tue.credits.toString(), colX.cred, doc.y + 4);
                    doc.text(gradeVal, colX.grade, doc.y + 4);
                    doc.text('-', colX.acq, doc.y + 4);
                    doc.text('-', colX.val, doc.y + 4);

                    doc.y += tueRowHeight;
                }
            }

            // Semester Summary
            const summaryHeight = 20;
            drawRow(doc.y, summaryHeight, '#f0f0f0');
            doc.fillColor('black').font('Helvetica-Bold');
            doc.text('Semester average & Total credits acquired', colX.tu, doc.y + 6);

            const semAvg = semResult ? semResult.average.toFixed(2) : '-';
            const semCred = semResult ? semResult.totalCredits : '-';
            const semStatus = semResult ? semResult.status : '-';

            doc.text(semAvg, colX.grade, doc.y + 6);
            doc.text(semCred.toString(), colX.acq, doc.y + 6);

            doc.y += summaryHeight;

            drawRow(doc.y, summaryHeight, '#f0f0f0');
            doc.fillColor('black');
            doc.text('Decision for the semester', colX.tu, doc.y + 6);
            doc.text(semStatus, colX.grade, doc.y + 6); // Spanning across?

            doc.y += summaryHeight + 10;

            if (semResult) {
                semesterCount++;
                annualTotalCredits += semResult.totalCredits;
                annualWeightedScore += semResult.average;
                if (semResult.status !== 'VALIDATED') allSemestersValidated = false;
            }
        }

        // --- ANNUAL SUMMARY ---
        if (doc.y > 650) doc.addPage();

        const annualAvg = semesterCount > 0 ? (annualWeightedScore / semesterCount).toFixed(2) : '-';
        const annualResult = (semesterCount > 0 && allSemestersValidated) ? 'VALIDATED' : 'NOT VALIDATED';

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

        // Draw Annual Summary Table
        const summaryTableX = 30;
        const summaryTableWidth = 300;
        const rowH = 20;

        const drawSummaryRow = (label, value) => {
            doc.rect(summaryTableX, doc.y, summaryTableWidth, rowH).stroke();
            doc.font('Helvetica-Bold').text(label, summaryTableX + 10, doc.y + 6);
            doc.font('Helvetica').text(value, summaryTableX + 150, doc.y + 6);
            doc.y += rowH;
        };

        drawSummaryRow('Annual Average:', annualAvg);
        drawSummaryRow('Annual Result:', annualResult);
        drawSummaryRow('Rating:', rating);
        drawSummaryRow('Total credits acquired:', annualTotalCredits.toString());

        doc.moveDown(2);

        // --- NOTES ---
        // Draw box
        const noteHeight = 120;
        if (doc.y + noteHeight > 750) doc.addPage();

        doc.rect(30, doc.y, 535, noteHeight).fill('#f9f9f9').stroke('#333333');
        doc.fillColor('black').fontSize(8);
        const noteY = doc.y + 10;
        const noteX = 40;

        doc.text('N.B.:', noteX, noteY);
        doc.text('V: TU Validated; NV: TU Not Validated; V/C: TU Validated by Compensation.', noteX, noteY + 15);
        doc.text('A semester is validated if and only if the semester average >= 10 and the average of each TU >= 08', noteX, noteY + 30);
        doc.text('Rating according TU/semester average (Av):', noteX, noteY + 50);
        doc.text('Fail: F (<10); Passable: D (10-11), D+ (11-12); Fairly Good: C (12-13), C+ (13-14); Good: B (14-15), B+ (15-16); Very Good: A (16-17), A+ (17-18); Excellent: A++ (>=18)', noteX, noteY + 65, { width: 500 });

        doc.y = noteY + noteHeight + 20;

        // --- FOOTER ---
        doc.fontSize(10).text(`Koudougou, ${new Date().toLocaleDateString()}`, { align: 'right' });
        doc.moveDown();
        doc.text('Academic Director', { align: 'right' });
        doc.text('Dr XXXXXXXXXXXXXXXX', { align: 'right' });

        // Bottom authorization text
        const bottomY = doc.page.height - 50;
        doc.fontSize(8).fillColor('#666666');
        doc.text('Autorisation de création: N° 2018-00/01347/MESRSI/SG/DGESup/DIPES du 13 Septembre 2018', 30, bottomY, { align: 'center' });
        doc.text('Autorisation d\'ouverture: N° 2018-00001511/MESRSI/SG/DGESup/DIPES du 25 Septembre 2018', 30, bottomY + 12, { align: 'center' });

        doc.end();

    } catch (error) {
        if (!res.headersSent) res.status(500).send(error.message);
    }
};
