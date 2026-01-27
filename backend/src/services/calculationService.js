const Grade = require('../models/Grade');
const TU = require('../models/TU');
const TUE = require('../models/TUE');
const TUResult = require('../models/TUResult');
const Semester = require('../models/Semester');
const SemesterResult = require('../models/SemesterResult');

// Calculate TU Average for a student
exports.calculateTUAverage = async (studentId, tuId, academicYear) => {
    const tu = await TU.findById(tuId);
    const tues = await TUE.find({ tuId: tu._id, isActive: true });

    let totalWeightedScore = 0;
    let totalCredits = 0;
    let missingGrades = false;

    for (const tue of tues) {
        const grade = await Grade.findOne({ studentId, tueId: tue._id, academicYear });

        if (!grade) {
            missingGrades = true;
            // Depending on policy, might treat as 0 or throw error. 
            // For now, treating as 0 if missing, but ideally should ensure all grades are present.
            // Assuming missing grade = 0 for calculation
            totalCredits += tue.credits;
            continue;
        }

        totalWeightedScore += grade.finalGrade * tue.credits;
        totalCredits += tue.credits;
    }

    if (totalCredits === 0) return { average: 0, status: 'NV', creditsEarned: 0 };

    const average = totalWeightedScore / totalCredits;
    const roundedAverage = Math.round(average * 100) / 100;

    // Determine status
    let status = 'NV';
    let creditsEarned = 0;

    if (roundedAverage >= 12) {
        status = 'V';
        creditsEarned = tu.credits; // Earns full TU credits
    } else if (roundedAverage >= 8) {
        // Potentially V-C (Validated by Compensation), but this depends on Semester average.
        // For now, mark as NV, will be updated to V-C during Semester calculation if applicable.
        status = 'NV';
        creditsEarned = 0;
    } else {
        status = 'NV';
        creditsEarned = 0;
    }

    // Save Result
    const tuData = await TU.findById(tuId);
    await TUResult.findOneAndUpdate(
        { studentId, tuId },
        {
            average: roundedAverage,
            status,
            creditsEarned,
            semesterId: tuData.semesterId, // Add semesterId for filtering
            academicYear
        },
        { upsert: true, new: true }
    );

    return { average: roundedAverage, status, creditsEarned };
};

// Calculate Semester Average
exports.calculateSemesterAverage = async (studentId, semesterId, academicYear) => {
    const semester = await Semester.findById(semesterId);
    const tus = await TU.find({ semesterId, isActive: true });

    let totalWeightedScore = 0;
    let totalCredits = 0;
    let allTUsValidatedOrCompensable = true;
    let tuResults = [];

    for (const tu of tus) {
        // Ensure TU result is up to date (re-calculate to be safe or fetch)
        // For efficiency, we might just fetch, but let's trigger calculation to ensure consistency
        const result = await exports.calculateTUAverage(studentId, tu._id, academicYear);
        tuResults.push({ tu, result });

        totalWeightedScore += result.average * tu.credits;
        totalCredits += tu.credits;

        if (result.average < 8) {
            allTUsValidatedOrCompensable = false; // < 6 is fatal for compensation
        }
    }

    if (totalCredits === 0) return { average: 0, status: 'NOT VALIDATED' };

    const average = totalWeightedScore / totalCredits;
    const roundedAverage = Math.round(average * 100) / 100;

    // Determine Semester Status
    let status = 'NOT VALIDATED';

    // Validation Rules:
    // 1. Semester Avg >= 12
    // 2. All TUs >= 12 OR (8 <= TU < 12 AND Compensated)

    // Check compensation eligibility
    // Max 1 V-C per semester
    let compensableCount = 0;
    let failedCount = 0;

    for (const item of tuResults) {
        if (item.result.average < 8) {
            failedCount++;
        } else if (item.result.average < 12) {
            compensableCount++;
        }
    }

    if (roundedAverage >= 12 && failedCount === 0) {
        if (compensableCount === 0) {
            status = 'VALIDATED';
        } else if (compensableCount === 1) {
            // Apply compensation
            status = 'VALIDATED';
            // We need to update the TU status to V-C
            for (const item of tuResults) {
                if (item.result.average >= 8 && item.result.average < 12) {
                    await TUResult.findOneAndUpdate(
                        { studentId, tuId: item.tu._id },
                        { status: 'V-C', creditsEarned: item.tu.credits }
                    );
                }
            }
        } else {
            status = 'NOT VALIDATED'; // Too many to compensate
        }
    } else {
        status = 'NOT VALIDATED';
    }

    // Determine Mention
    let mention = 'F';
    if (roundedAverage >= 18) mention = 'A++';
    else if (roundedAverage >= 17) mention = 'A+';
    else if (roundedAverage >= 16) mention = 'A';
    else if (roundedAverage >= 15) mention = 'B+';
    else if (roundedAverage >= 14) mention = 'B';
    else if (roundedAverage >= 13) mention = 'C+';
    else if (roundedAverage >= 12) mention = 'C';
    else if (roundedAverage >= 11) mention = 'D+';
    else if (roundedAverage >= 10) mention = 'D';

    if (status === 'NOT VALIDATED') mention = 'F';

    // Save Semester Result
    await SemesterResult.findOneAndUpdate(
        { studentId, semesterId },
        {
            average: roundedAverage,
            totalCredits: totalCredits, // Always store actual credits for calculation purposes
            status,
            mention,
            academicYear
        },
        { upsert: true, new: true }
    );

    // Trigger annual calculation check
    await checkAndCalculateAnnual(studentId, semesterId, academicYear);

    return { average: roundedAverage, status, mention };
};

// Calculate Annual Result
exports.calculateAnnualResult = async (studentId, level, academicYear) => {
    const mongoose = require('mongoose');
    const Semester = require('../models/Semester');
    const SemesterResult = require('../models/SemesterResult');
    const AnnualResult = require('../models/AnnualResult');

    // Get semester pair for this level
    const semesterMapping = {
        'L1': ['S1', 'S2'],
        'L2': ['S3', 'S4'],
        'L3': ['S5', 'S6'],
        'M1': ['S1', 'S2'],
        'M2': ['S3', 'S4']
    };

    const [sem1Name, sem2Name] = semesterMapping[level] || [];

    if (!sem1Name || !sem2Name) {
        throw new Error(`Invalid level: ${level}`);
    }

    // Find the student's semesters for this year
    const student = await mongoose.model('Student').findById(studentId)
        .populate('promotionId');

    if (!student || !student.promotionId) {
        throw new Error('Student or promotion not found');
    }

    // Get semesters for this promotion
    const semesters = await Semester.find({
        promotionId: student.promotionId._id
    });

    // Find S1 and S2 equivalents (by order)
    const sem1 = semesters.find(s => s.order === 1);
    const sem2 = semesters.find(s => s.order === 2);

    if (!sem1 || !sem2) {
        throw new Error(`Both semesters required for ${level}`);
    }

    // Fetch semester results
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

    // Validation
    if (!sem1Result || !sem2Result) {
        throw new Error('Both semester results must be calculated before annual calculation');
    }

    // Calculate weighted annual average (CORRECT FORMULA)
    const totalWeighted = (sem1Result.average * sem1Result.totalCredits)
        + (sem2Result.average * sem2Result.totalCredits);
    const totalCredits = sem1Result.totalCredits + sem2Result.totalCredits;

    // Handle division by zero (when both semesters have 0 credits due to NOT VALIDATED status)
    if (totalCredits === 0) {
        throw new Error('Cannot calculate annual average: Both semesters have 0 credits. At least one semester must be validated.');
    }

    const annualAverage = Math.round((totalWeighted / totalCredits) * 100) / 100;

    // Determine validation status
    const bothValidated = (sem1Result.status === 'VALIDATED' && sem2Result.status === 'VALIDATED');
    const meetsMinimumCredits = totalCredits >= 48; // 80% of 60
    const isComplete = true;


    const status = (bothValidated && meetsMinimumCredits)
        ? 'VALIDATED'
        : 'NOT VALIDATED';

    // Calculate annual mention
    let mention = 'F';
    if (status === 'VALIDATED') {
        if (annualAverage >= 18) mention = 'A++';
        else if (annualAverage >= 17) mention = 'A+';
        else if (annualAverage >= 16) mention = 'A';
        else if (annualAverage >= 15) mention = 'B+';
        else if (annualAverage >= 14) mention = 'B';
        else if (annualAverage >= 13) mention = 'C+';
        else if (annualAverage >= 12) mention = 'C';
        else if (annualAverage >= 11) mention = 'D+';
        else if (annualAverage >= 10) mention = 'D';
    }

    // Track missing data
    const missingData = [];
    if (!bothValidated) {
        if (sem1Result.status !== 'VALIDATED') {
            missingData.push({
                type: 'SEMESTER_NOT_VALIDATED',
                semesterId: sem1._id,
                description: `${sem1.name} not validated`
            });
        }
        if (sem2Result.status !== 'VALIDATED') {
            missingData.push({
                type: 'SEMESTER_NOT_VALIDATED',
                semesterId: sem2._id,
                description: `${sem2.name} not validated`
            });
        }
    }
    if (!meetsMinimumCredits) {
        missingData.push({
            type: 'INSUFFICIENT_CREDITS',
            description: `Only ${totalCredits}/60 credits earned (minimum 48 required)`
        });
    }

    // Save to AnnualResult
    const annualResult = await AnnualResult.findOneAndUpdate(
        { studentId, academicYear, level },
        {
            semester1: {
                semesterId: sem1._id,
                name: sem1.name,
                average: sem1Result.average,
                credits: sem1Result.totalCredits,
                status: sem1Result.status,
                mention: sem1Result.mention,
                resultId: sem1Result._id
            },
            semester2: {
                semesterId: sem2._id,
                name: sem2.name,
                average: sem2Result.average,
                credits: sem2Result.totalCredits,
                status: sem2Result.status,
                mention: sem2Result.mention,
                resultId: sem2Result._id
            },
            annualAverage,
            totalCredits,
            status,
            mention,
            meetsMinimumCredits,
            bothSemestersValidated: bothValidated,
            isComplete,
            missingData,
            completedAt: Date.now(),
            updatedAt: Date.now()
        },
        { upsert: true, new: true }
    );

    return {
        annualAverage,
        totalCredits,
        status,
        mention,
        bothSemestersValidated: bothValidated,
        meetsMinimumCredits,
        annualResultId: annualResult._id
    };
};

/**
 * Check if annual calculation is possible and trigger it
 * Called after a semester calculation completes
 */
async function checkAndCalculateAnnual(studentId, semesterId, academicYear) {
    try {
        const semester = await Semester.findById(semesterId).populate('promotionId');
        if (!semester || !semester.promotionId) {
            return;
        }

        const level = semester.promotionId.level;
        const Student = require('../models/Student');

        const student = await Student.findById(studentId).populate('promotionId');
        if (!student || !student.promotionId) {
            return;
        }

        const semesters = await Semester.find({
            promotionId: student.promotionId._id
        }).sort({ order: 1 });

        if (semesters.length < 2) {
            return;
        }

        const sem1 = semesters[0];
        const sem2 = semesters[1];

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

        if (sem1Result && sem2Result) {
            console.log(`[AutoCalc] Both semesters complete for student ${studentId}, checking annual...`);

            const AnnualResult = require('../models/AnnualResult');

            const existingAnnual = await AnnualResult.findOne({
                studentId,
                academicYear,
                level
            });

            if (!existingAnnual) {
                console.log(`[AutoCalc] Calculating annual result for student ${studentId}...`);
                await exports.calculateAnnualResult(studentId, level, academicYear);
                console.log(`[AutoCalc] Annual result calculated successfully for student ${studentId}`);
            } else {
                console.log(`[AutoCalc] Annual result already exists for student ${studentId}, skipping`);
            }
        }
    } catch (error) {
        console.error('[AutoCalc] Error in checkAndCalculateAnnual:', error);
    }
}

