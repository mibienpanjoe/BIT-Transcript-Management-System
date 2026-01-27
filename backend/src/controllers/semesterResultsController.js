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
const xlsx = require('xlsx');

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

        const rows = [];
        rows.push([
            'Student ID',
            'Student Name',
            'Semester Average',
            'Semester Status',
            'TU',
            'TU Average',
            'TU Status',
            'TUE',
            'TUE Grade'
        ]);

        for (const student of students) {
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

            const tueIds = [].concat(...Object.values(tuesByTu).map((list) => list.map((tue) => tue._id)));
            const grades = await Grade.find({
                studentId: student._id,
                academicYear,
                tueId: { $in: tueIds }
            });
            const gradeMap = new Map(grades.map((grade) => [grade.tueId.toString(), grade]));

            for (const tu of tus) {
                const tuResult = tuResultMap.get(tu._id.toString());
                const tues = tuesByTu[tu._id.toString()] || [];
                if (tues.length === 0) {
                    rows.push([
                        student.studentId,
                        `${student.firstName} ${student.lastName}`,
                        semResult ? semResult.average.toFixed(2) : '-',
                        semResult ? semResult.status : 'PENDING',
                        tu.name,
                        tuResult ? tuResult.average.toFixed(2) : '-',
                        tuResult ? tuResult.status : 'PENDING',
                        '-',
                        '-'
                    ]);
                } else {
                    for (const tue of tues) {
                        const grade = gradeMap.get(tue._id.toString());
                        rows.push([
                            student.studentId,
                            `${student.firstName} ${student.lastName}`,
                            semResult ? semResult.average.toFixed(2) : '-',
                            semResult ? semResult.status : 'PENDING',
                            tu.name,
                            tuResult ? tuResult.average.toFixed(2) : '-',
                            tuResult ? tuResult.status : 'PENDING',
                            tue.name,
                            grade ? grade.finalGrade.toFixed(2) : '-'
                        ]);
                    }
                }
            }
        }

        const workbook = xlsx.utils.book_new();
        const sheet = xlsx.utils.aoa_to_sheet(rows);
        xlsx.utils.book_append_sheet(workbook, sheet, 'Semester Results');

        const fileName = `semester_results_${promotion.name}_${semester.name}_${academicYear}.xlsx`
            .replace(/\s+/g, '_');
        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

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
