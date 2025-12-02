const mongoose = require('mongoose');
const Grade = require('../models/Grade');
const TU = require('../models/TU');
const TUE = require('../models/TUE');
const Semester = require('../models/Semester');
const calculationService = require('./calculationService');

/**
 * Triggered when a grade is created or updated
 * Cascades calculations automatically: Grade → TU → Semester → Annual
 * @param {ObjectId} gradeId - The grade that was created/updated
 */
exports.onGradeChange = async (gradeId) => {
    try {
        console.log(`[AutoCalc] Grade changed: ${gradeId}`);

        const grade = await Grade.findById(gradeId).populate('tueId');
        if (!grade || !grade.tueId) {
            console.log('[AutoCalc] Grade or TUE not found, skipping');
            return;
        }

        const { studentId, academicYear } = grade;
        const tue = grade.tueId;
        const tuId = tue.tuId;

        console.log(`[AutoCalc] Checking TU completion for student ${studentId}, TU ${tuId}`);

        // Step 1: Check if all TUE grades in the TU are complete
        const isTUComplete = await checkTUCompletion(studentId, tuId, academicYear);

        if (isTUComplete) {
            console.log(`[AutoCalc] TU ${tuId} is complete, calculating average...`);

            // Auto-calculate TU average
            const tuResult = await calculationService.calculateTUAverage(
                studentId,
                tuId,
                academicYear
            );

            console.log(`[AutoCalc] TU calculated: avg=${tuResult.average}, status=${tuResult.status}`);

            // Step 2: Get semester for this TU
            const tu = await TU.findById(tuId);
            const semesterId = tu.semesterId;

            console.log(`[AutoCalc] Checking semester completion for semester ${semesterId}`);

            // Check if all TUs in the semester are calculated
            const isSemesterComplete = await checkSemesterCompletion(
                studentId,
                semesterId,
                academicYear
            );

            if (isSemesterComplete) {
                console.log(`[AutoCalc] Semester ${semesterId} is complete, calculating average...`);

                // Auto-calculate Semester average
                const semResult = await calculationService.calculateSemesterAverage(
                    studentId,
                    semesterId,
                    academicYear
                );

                console.log(`[AutoCalc] Semester calculated: avg=${semResult.average}, status=${semResult.status}`);

                // Step 3: Check if both semesters of the year are calculated
                const semester = await Semester.findById(semesterId).populate('promotionId');
                const level = semester.promotionId.level;

                console.log(`[AutoCalc] Checking year completion for level ${level}`);

                const isYearComplete = await checkYearCompletion(
                    studentId,
                    level,
                    academicYear
                );

                if (isYearComplete) {
                    console.log(`[AutoCalc] Year ${level} is complete, calculating annual average...`);

                    // Auto-calculate Annual average
                    const annualResult = await calculationService.calculateAnnualResult(
                        studentId,
                        level,
                        academicYear
                    );

                    console.log(`[AutoCalc] Annual calculated: avg=${annualResult.annualAverage}, status=${annualResult.status}`);
                } else {
                    console.log(`[AutoCalc] Year ${level} not yet complete, waiting for other semester`);
                }
            } else {
                console.log(`[AutoCalc] Semester ${semesterId} not yet complete, waiting for other TUs`);
            }
        } else {
            console.log(`[AutoCalc] TU ${tuId} not yet complete, waiting for other TUE grades`);
        }

    } catch (error) {
        console.error('[AutoCalc] Error in cascade calculation:', error);
        // Don't throw - we don't want to block grade save operations
    }
};

/**
 * Check if all TUE grades for a TU are complete
 */
async function checkTUCompletion(studentId, tuId, academicYear) {
    const tues = await TUE.find({ tuId, isActive: true });

    for (const tue of tues) {
        const grade = await Grade.findOne({
            studentId,
            tueId: tue._id,
            academicYear
        });

        // Check if grade exists and has all components
        if (!grade) {
            return false;
        }

        // Check if all grade components are filled
        if (grade.presence === null || grade.presence === undefined ||
            grade.participation === null || grade.participation === undefined ||
            grade.evaluation === null || grade.evaluation === undefined) {
            return false;
        }
    }

    return true;
}

/**
 * Check if all TUs in a semester are calculated
 */
async function checkSemesterCompletion(studentId, semesterId, academicYear) {
    const TUResult = require('../models/TUResult');

    const tus = await TU.find({ semesterId, isActive: true });

    for (const tu of tus) {
        const tuResult = await TUResult.findOne({
            studentId,
            tuId: tu._id,
            academicYear
        });

        if (!tuResult) {
            return false;
        }
    }

    return true;
}

/**
 * Check if both semesters of a year are calculated
 */
async function checkYearCompletion(studentId, level, academicYear) {
    const SemesterResult = require('../models/SemesterResult');
    const Student = require('../models/Student');

    // Get student's promotion to find semesters
    const student = await Student.findById(studentId).populate('promotionId');
    if (!student || !student.promotionId) {
        return false;
    }

    // Get both semesters for this promotion
    const semesters = await Semester.find({
        promotionId: student.promotionId._id
    }).sort({ order: 1 });

    if (semesters.length < 2) {
        return false;
    }

    const sem1 = semesters[0];
    const sem2 = semesters[1];

    // Check if both have results
    const sem1Result = await SemesterResult.findOne({
        studentId,
        semesterId: sem1._id,
        academicYear
    });

    const sem2Result = await SemesterResult.findOne({
        studentId,
        semesterId: sem2._id,
        academicYear
    });

    return !!(sem1Result && sem2Result);
}

/**
 * Update calculation status for a student/semester
 * (Optional - for future use with CalculationStatus model)
 */
exports.updateCalculationStatus = async (studentId, academicYear, semesterId) => {
    // TODO: Implement if we want to track detailed progress
    // For now, the cascade calculation is sufficient
};
