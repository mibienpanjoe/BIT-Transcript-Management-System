const pdfService = require('../services/puppeteerPdfService');
const calculationService = require('../services/calculationService');
const Student = require('../models/Student');
const Semester = require('../models/Semester');
const Promotion = require('../models/Promotion');
const TU = require('../models/TU');
const TUE = require('../models/TUE');
const Grade = require('../models/Grade');
const TUResult = require('../models/TUResult');
const SemesterResult = require('../models/SemesterResult');
const ExcelJS = require('exceljs');

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

const getConversionLabel = (grade) => {
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

const getSemesterContext = async (promotionId, semesterId, academicYear) => {
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

    return { promotion, semester, students };
};

// @desc    Generate consolidated semester results PDF
// @route   POST /api/semesters/results/pdf
// @access  Private/Admin
exports.generateSemesterResultsPdf = async (req, res) => {
    try {
        const { promotionId, semesterId, academicYear } = req.body;

        if (!promotionId || !semesterId || !academicYear) {
            return res.status(400).json({
                success: false,
                message: 'promotionId, semesterId, and academicYear are required'
            });
        }

        const { students } = await getSemesterContext(promotionId, semesterId, academicYear);

        for (const student of students) {
            await calculationService.calculateSemesterAverage(
                student._id,
                semesterId,
                academicYear
            );
        }

        await pdfService.generateSemesterResultsPdf(promotionId, semesterId, academicYear, res);
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

// @desc    Generate consolidated semester results Excel
// @route   POST /api/semesters/results/excel
// @access  Private/Admin
exports.generateSemesterResultsExcel = async (req, res) => {
    try {
        const { promotionId, semesterId, academicYear } = req.body;

        if (!promotionId || !semesterId || !academicYear) {
            return res.status(400).json({
                success: false,
                message: 'promotionId, semesterId, and academicYear are required'
            });
        }

        const { promotion, semester, students } = await getSemesterContext(promotionId, semesterId, academicYear);

        for (const student of students) {
            await calculationService.calculateSemesterAverage(
                student._id,
                semesterId,
                academicYear
            );
        }

        const tus = await TU.find({ semesterId, isActive: true }).sort({ name: 1 });
        const tuesByTu = {};
        for (const tu of tus) {
            const tues = await TUE.find({ tuId: tu._id, isActive: true }).sort({ name: 1 });
            tuesByTu[tu._id.toString()] = tues;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Semester Results');

        const tuGroupBlue = 'C7D6EA';
        const subGroupBlue = 'D7E3F3';
        const creditsBlue = 'E6EDF7';
        const totalCreditsYellow = 'FEF9C3';
        const finalAverageBlue = 'DBEAFE';
        const passGreen = '00B050';
        const failRed = 'FF0000';

        const borderThin = { style: 'thin', color: { argb: '000000' } };
        const borderMedium = { style: 'medium', color: { argb: '000000' } };

        const headerRow1 = worksheet.getRow(1);
        const headerRow2 = worksheet.getRow(2);
        const headerRow3 = worksheet.getRow(3);

        const columns = [];
        columns.push({ key: 'no', width: 6 });
        columns.push({ key: 'id', width: 12 });
        columns.push({ key: 'surname', width: 18 });
        columns.push({ key: 'name', width: 22 });

        const tueColumns = [];
        tus.forEach((tu) => {
            const tues = tuesByTu[tu._id.toString()] || [];
            tues.forEach((tue) => {
                tueColumns.push({
                    key: `tue_${tue._id.toString()}`,
                    label: tue.name,
                    credit: tue.credits,
                    tuName: tu.name,
                    tuId: tu._id.toString()
                });
            });
            tueColumns.push({
                key: `tu_avg_${tu._id.toString()}`,
                label: `TU average (${tu.name})`,
                credit: 'avg',
                tuName: tu.name,
                tuId: tu._id.toString(),
                isAvg: true
            });
        });

        tueColumns.forEach((col) => {
            columns.push({ key: col.key, width: 8 });
        });

        const avgColumnIndexes = new Set();
        tueColumns.forEach((col, index) => {
            if (col.isAvg) {
                avgColumnIndexes.add(5 + index);
            }
        });

        columns.push({ key: 'totalCredits', width: 10 });
        columns.push({ key: 'finalAverage', width: 10 });
        columns.push({ key: 'intlGrade', width: 8 });
        columns.push({ key: 'conversion', width: 18 });
        columns.push({ key: 'passFail', width: 10 });
        columns.push({ key: 'redoExam', width: 14 });

        worksheet.columns = columns;

        const mergeHeaderCells = (startCol, endCol, row, value, fill) => {
            worksheet.mergeCells(row, startCol, row, endCol);
            const cell = worksheet.getCell(row, startCol);
            cell.value = value;
            cell.fill = fill;
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            cell.font = { bold: true, size: 9 };
            cell.border = {
                top: borderThin,
                left: borderThin,
                right: borderThin,
                bottom: borderThin
            };
        };

        headerRow1.height = 28;
        headerRow2.height = 120;
        headerRow3.height = 16;

        // Logo block (rows 1-2 across first 4 columns)
        worksheet.mergeCells(1, 1, 2, 4);
        const logoCell = worksheet.getCell(1, 1);
        logoCell.value = '';
        logoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } };
        logoCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        logoCell.border = {
            top: borderMedium,
            left: borderMedium,
            right: borderMedium,
            bottom: borderThin
        };

        // Student headers on credits row
        ['N°', 'ID', 'Surname', 'Name'].forEach((label, index) => {
            const col = index + 1;
            const cell = worksheet.getCell(3, col);
            cell.value = label;
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: creditsBlue } };
            cell.alignment = { vertical: 'middle', horizontal: index === 0 ? 'center' : 'left', wrapText: true };
            cell.font = { bold: true, size: 9 };
            cell.border = {
                top: borderThin,
                left: col === 1 ? borderMedium : borderThin,
                right: borderThin,
                bottom: borderMedium
            };
        });

        let currentCol = 5;
        tus.forEach((tu) => {
            const tues = tuesByTu[tu._id.toString()] || [];
            const span = tues.length + 1;
            mergeHeaderCells(currentCol, currentCol + span - 1, 1, `${tu.name}\n${tu.credits}`, {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: tuGroupBlue }
            });

            for (let i = 0; i < span; i++) {
                const cell = worksheet.getCell(2, currentCol + i);
                const colInfo = tueColumns[currentCol - 5 + i];
                cell.value = colInfo.isAvg ? 'TU average' : colInfo.label;
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: colInfo.isAvg ? tuGroupBlue : subGroupBlue }
                };
                cell.alignment = {
                    vertical: 'middle',
                    horizontal: 'center',
                    wrapText: true,
                    textRotation: colInfo.isAvg ? 0 : 90
                };
                cell.font = { bold: true, size: 7 };
                cell.border = {
                    top: borderThin,
                    left: borderThin,
                    right: borderThin,
                    bottom: borderThin
                };
            }

            for (let i = 0; i < span; i++) {
                const cell = worksheet.getCell(3, currentCol + i);
                const colInfo = tueColumns[currentCol - 5 + i];
                cell.value = colInfo.isAvg ? 'avg' : colInfo.credit;
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: creditsBlue } };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.font = { bold: true, size: 8 };
                cell.border = {
                    top: borderThin,
                    left: borderThin,
                    right: borderThin,
                    bottom: borderThin
                };
            }

            const groupEndCol = currentCol + span - 1;
            for (let r = 1; r <= 3; r++) {
                const cell = worksheet.getCell(r, groupEndCol);
                cell.border = {
                    top: borderThin,
                    left: borderThin,
                    right: borderMedium,
                    bottom: borderThin
                };
            }

            currentCol += span;
        });

        const summaryColumns = [
            { label: 'Total of Credits', fill: totalCreditsYellow },
            { label: 'Final Average', fill: finalAverageBlue },
            { label: 'International Grade', fill: 'FFFFFF', fontColor: 'B91C1C' },
            { label: 'Conversion', fill: 'FFFFFF' },
            { label: 'Pass/Fail?', fill: 'FFFFFF' },
            { label: 'Re-do exam', fill: 'FFFFFF' }
        ];

        summaryColumns.forEach((colInfo, idx) => {
            const col = currentCol + idx;
            worksheet.mergeCells(1, col, 3, col);
            const cell = worksheet.getCell(1, col);
            cell.value = colInfo.label;
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colInfo.fill } };
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true, textRotation: 90 };
            cell.font = { bold: true, size: 8, color: colInfo.fontColor ? { argb: colInfo.fontColor } : undefined };
            cell.border = {
                top: borderMedium,
                left: borderThin,
                right: borderMedium,
                bottom: borderMedium
            };
        });

        const totalTuCredits = tus.reduce((sum, tu) => sum + tu.credits, 0);
        const allTueIds = [].concat(...Object.values(tuesByTu).map((list) => list.map((tue) => tue._id)));

        for (const [index, student] of students.entries()) {
            const semResult = await SemesterResult.findOne({
                studentId: student._id,
                semesterId,
                academicYear
            });

            const tuResults = await TUResult.find({
                studentId: student._id,
                academicYear,
                tuId: { $in: tus.map((tu) => tu._id) }
            });
            const tuResultMap = new Map(tuResults.map((result) => [result.tuId.toString(), result]));

            const failedTus = tuResults
                .filter((result) => result.status === 'NV')
                .map((result) => {
                    const tu = tus.find((item) => item._id.equals(result.tuId));
                    return tu ? tu.name : null;
                })
                .filter(Boolean);

            const internationalGrade = semResult ? getInternationalGrade(semResult.average) : '-';
            const conversion = semResult ? getConversionLabel(internationalGrade) : '-';
            const passFail = semResult && semResult.status === 'VALIDATED' ? 'PASS' : 'FAIL';
            const redoExam = passFail === 'FAIL' && failedTus.length > 0 ? `${failedTus.join('; ')};` : '';

            const grades = await Grade.find({
                studentId: student._id,
                academicYear,
                tueId: { $in: allTueIds }
            });
            const gradeMap = new Map(grades.map((grade) => [grade.tueId.toString(), grade]));

            const rowValues = [];
            rowValues.push(index + 1);
            rowValues.push(student.studentId);
            rowValues.push(student.lastName.toUpperCase());
            rowValues.push(student.firstName);

            const gradeValueMap = new Map();
            tueColumns.forEach((col) => {
                if (col.isAvg) {
                    const tuResult = tuResultMap.get(col.tuId);
                    gradeValueMap.set(col.key, tuResult ? Number(tuResult.average.toFixed(2)) : null);
                } else {
                    const grade = gradeMap.get(col.key.replace('tue_', ''));
                    gradeValueMap.set(col.key, grade ? Number(grade.finalGrade.toFixed(2)) : 0);
                }
            });

            tueColumns.forEach((col) => {
                rowValues.push(gradeValueMap.get(col.key));
            });

            const weightedTotal = semResult ? Number((semResult.average * totalTuCredits).toFixed(2)) : null;
            rowValues.push(weightedTotal);
            rowValues.push(semResult ? Number(semResult.average.toFixed(2)) : null);
            rowValues.push(internationalGrade);
            rowValues.push(conversion);
            rowValues.push(passFail);
            rowValues.push(redoExam);

            const row = worksheet.addRow(rowValues);
            row.height = 20;

            // Apply base styling per cell
            row.eachCell((cell, colNumber) => {
                cell.border = {
                    top: borderThin,
                    left: borderThin,
                    right: borderThin,
                    bottom: borderThin
                };

                if (colNumber === 2 || colNumber === 3 || colNumber === 4) {
                    cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
                }

                const summaryStart = 5 + tueColumns.length;
                if (avgColumnIndexes.has(colNumber)) {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: tuGroupBlue } };
                    cell.font = { bold: true };
                }

                if (colNumber === summaryStart) {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: totalCreditsYellow } };
                    cell.font = { bold: true };
                }

                if (colNumber === summaryStart + 1) {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: finalAverageBlue } };
                    cell.font = { bold: true };
                }

                if (colNumber === summaryStart + 2) {
                    cell.font = { bold: true, color: { argb: 'B91C1C' } };
                }

                if (colNumber === summaryStart + 4) {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: passFail === 'PASS' ? passGreen : failRed } };
                    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                }

                if (colNumber === summaryStart + 3) {
                    cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
                }

                if (colNumber === summaryStart + 5) {
                    cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
                }
            });
        }

        const fileName = `semester_results_${promotion.name}_${semester.name}_${academicYear}.xlsx`
            .replace(/\s+/g, '_');
        const buffer = await workbook.xlsx.writeBuffer();

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-Length', buffer.length);
        res.end(buffer);
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};
