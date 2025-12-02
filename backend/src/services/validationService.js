const mongoose = require('mongoose');
const Grade = require('../models/Grade');
const TU = require('../models/TU');
const TUE = require('../models/TUE');
const TUResult = require('../models/TUResult');
const Semester = require('../models/Semester');
const SemesterResult = require('../models/SemesterResult');
const AnnualResult = require('../models/AnnualResult');

/**
 * Validate if a student is ready for transcript generation
 * @param {ObjectId} studentId - Student ID
 * @param {String} academicYear - Academic year
 * @param {String} level - Academic level (L1, L2, L3)
 * @returns {Object} Validation status with detailed missing data
 */
exports.validateTranscriptReadiness = async (studentId, academicYear, level) => {
    const validation = {
        readyForTranscript: false,
        status: 'incomplete',
        completionPercentage: 0,
        missing: {},
        messages: []
    };

    // Get semester pair for the level
    const [sem1, sem2] = await getSemesterPair(studentId, level);

    if (!sem1 || !sem2) {
        validation.messages.push('Cannot find both semesters for this level');
        return validation;
    }

    // Check Semester 1
    const sem1Status = await checkSemesterStatus(studentId, sem1._id, academicYear);
    validation.missing.semester1 = sem1Status;

    // Check Semester 2
    const sem2Status = await checkSemesterStatus(studentId, sem2._id, academicYear);
    validation.missing.semester2 = sem2Status;

    // Check annual calculation
    if (sem1Status.calculated && sem2Status.calculated) {
        const annualResult = await AnnualResult.findOne({
            studentId,
            academicYear,
            level
        });

        validation.missing.annualCalculation = {
            possible: true,
            calculated: !!annualResult,
            result: annualResult
        };

        validation.readyForTranscript = !!annualResult;
        validation.status = annualResult ? 'ready' : 'pending_annual_calculation';
    } else {
        validation.missing.annualCalculation = {
            possible: false,
            reason: buildMissingReason(sem1Status, sem2Status)
        };
    }

    // Build user-friendly messages
    validation.messages = buildValidationMessages(validation.missing);
    validation.completionPercentage = calculateCompletionPercentage(validation.missing);

    return validation;
};

/**
 * Get semester pair for a level
 */
async function getSemesterPair(studentId, level) {
    const Student = require('../models/Student');
    const student = await Student.findById(studentId).populate('promotionId');

    if (!student || !student.promotionId) {
        return [null, null];
    }

    const semesters = await Semester.find({
        promotionId: student.promotionId._id
    }).sort({ order: 1 });

    // Get first two semesters (order 1 and 2)
    const sem1 = semesters.find(s => s.order === 1);
    const sem2 = semesters.find(s => s.order === 2);

    return [sem1, sem2];
}

/**
 * Check status of a single semester
 */
async function checkSemesterStatus(studentId, semesterId, academicYear) {
    const semester = await Semester.findById(semesterId).populate('promotionId');

    // Get all TUs for this semester
    const tus = await TU.find({ semesterId, isActive: true });

    const status = {
        semesterId,
        name: semester.name,
        status: 'incomplete',
        calculated: false,
        missingTUEs: [],
        incompleteTUs: []
    };

    // Check semester result
    const semResult = await SemesterResult.findOne({
        studentId,
        semesterId,
        academicYear
    });

    if (semResult) {
        status.status = semResult.status;
        status.average = semResult.average;
        status.calculated = true;
        return status;
    }

    // Check each TU
    for (const tu of tus) {
        const tuResult = await TUResult.findOne({
            studentId,
            tuId: tu._id,
            academicYear
        });

        if (!tuResult) {
            // TU not calculated - check why
            const missingData = await findMissingTUEGrades(studentId, tu._id, academicYear);
            if (missingData.length > 0) {
                status.missingTUEs.push(...missingData);
            }
            status.incompleteTUs.push({
                tuId: tu._id,
                tuName: tu.name,
                calculated: false,
                reason: missingData.length > 0 ? 'Missing TUE grades' : 'Calculation pending'
            });
        }
    }

    return status;
}

/**
 * Find missing TUE grades for a TU
 */
async function findMissingTUEGrades(studentId, tuId, academicYear) {
    const tu = await TU.findById(tuId);
    const tues = await TUE.find({ tuId, isActive: true });
    const missing = [];

    for (const tue of tues) {
        const grade = await Grade.findOne({
            studentId,
            tueId: tue._id,
            academicYear
        });

        if (!grade) {
            missing.push({
                tuName: tu.name,
                tueId: tue._id,
                tueName: tue.name,
                missingComponents: ['all']
            });
        } else {
            const missingComps = [];
            if (grade.presence === null || grade.presence === undefined) missingComps.push('presence');
            if (grade.participation === null || grade.participation === undefined) missingComps.push('participation');
            if (grade.evaluation === null || grade.evaluation === undefined) missingComps.push('evaluation');

            if (missingComps.length > 0) {
                missing.push({
                    tuName: tu.name,
                    tueId: tue._id,
                    tueName: tue.name,
                    missingComponents: missingComps
                });
            }
        }
    }

    return missing;
}

/**
 * Build reason for why annual calculation is not possible
 */
function buildMissingReason(sem1Status, sem2Status) {
    const reasons = [];

    if (!sem1Status.calculated) {
        reasons.push(`${sem1Status.name} not calculated`);
    }
    if (!sem2Status.calculated) {
        reasons.push(`${sem2Status.name} not calculated`);
    }

    return reasons.join(', ');
}

/**
 * Build user-friendly validation messages
 */
function buildValidationMessages(missingData) {
    const messages = [];

    // Semester 1 messages
    if (missingData.semester1) {
        if (missingData.semester1.calculated) {
            messages.push(
                `✅ ${missingData.semester1.name} complete: ${missingData.semester1.average}/20 - ${missingData.semester1.status}`
            );
        } else {
            if (missingData.semester1.missingTUEs.length > 0) {
                messages.push(
                    `❌ ${missingData.semester1.name}: Missing ${missingData.semester1.missingTUEs.length} TUE grade(s)`
                );
            }
            if (missingData.semester1.incompleteTUs.length > 0) {
                messages.push(
                    `⚠️ ${missingData.semester1.name}: ${missingData.semester1.incompleteTUs.length} TU(s) not calculated`
                );
            }
        }
    }

    // Semester 2 messages
    if (missingData.semester2) {
        if (missingData.semester2.calculated) {
            messages.push(
                `✅ ${missingData.semester2.name} complete: ${missingData.semester2.average}/20 - ${missingData.semester2.status}`
            );
        } else {
            if (missingData.semester2.missingTUEs.length > 0) {
                messages.push(
                    `❌ ${missingData.semester2.name}: Missing ${missingData.semester2.missingTUEs.length} TUE grade(s)`
                );
            }
            if (missingData.semester2.incompleteTUs.length > 0) {
                messages.push(
                    `⚠️ ${missingData.semester2.name}: ${missingData.semester2.incompleteTUs.length} TU(s) not calculated`
                );
            }
        }
    }

    // Annual calculation message
    if (missingData.annualCalculation) {
        if (missingData.annualCalculation.possible) {
            if (missingData.annualCalculation.calculated) {
                messages.push('✅ Annual calculation complete');
            } else {
                messages.push('⚠️ Annual calculation pending - click "Calculate Annual Results"');
            }
        } else {
            messages.push(`❌ Cannot calculate annual average: ${missingData.annualCalculation.reason}`);
        }
    }

    return messages;
}

/**
 * Calculate completion percentage
 */
function calculateCompletionPercentage(missingData) {
    let completed = 0;
    let total = 3; // 2 semesters + 1 annual

    if (missingData.semester1?.calculated) completed++;
    if (missingData.semester2?.calculated) completed++;
    if (missingData.annualCalculation?.calculated) completed++;

    return Math.round((completed / total) * 100);
}
