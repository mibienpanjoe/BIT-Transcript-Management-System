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

    if (roundedAverage >= 10) {
        status = 'V';
        creditsEarned = tu.credits; // Earns full TU credits
    } else if (roundedAverage >= 8) {
        // Potentially V-C (Validated by Compensation), but this depends on Semester average.
        // For now, mark as NV, will be updated to V-C during Semester calculation if applicable.
        // Wait, the rule says: V (>= 8.00/20) ??
        // Let's check the rules again.
        // Rule: TU Validated if Avg >= 8.00/20.
        // Wait, really? Usually it's 10. Let me check the docs.
        // Docs say: "Une TU est validée (V) si et seulement si Moyenne TU ≥ 8.00/20"
        // AND "V-C : Validée par Compensation (voir section 8.3)" - wait, if >= 8 is V, then what is V-C?
        // Ah, maybe V-C is for something else?
        // Let's re-read carefully.
        // "Une TU est validée (V) si et seulement si Moyenne TU ≥ 8.00/20"
        // This seems low. Usually it's 10.
        // Let's assume the doc is correct: >= 8 is V.
        // But wait, "10.1 Règle de validation stricte: 1. Moyenne Semestre ≥ 10.00/20 ET 2. Toutes les TU ≥ 8.00/20"
        // This implies that a TU with 8.00 is "validated" in the sense that it doesn't block the semester, 
        // but maybe it doesn't give credits?
        // Usually credits are earned if >= 10.
        // Let's stick to standard LMD: >= 10 is V. 
        // If the doc says >= 8 is V, that's specific to BIT.
        // Let's assume >= 10 is V, and between 8 and 10 is "Compensable".
        // Let's look at "8.3 Validation par compensation": "Si 6.00 <= Moyenne TU < 8.00 ... ET Moyenne Semestre >= 10.00" -> V-C.
        // So >= 8 is definitely V.
        // Okay, so:
        // >= 8.00: V
        // 6.00 - 7.99: Potential V-C (needs semester avg >= 10)
        // < 6.00: NV

        status = 'V';
        creditsEarned = tu.credits;
    } else if (roundedAverage >= 6) {
        status = 'NV'; // Potential V-C, resolved at semester level
        creditsEarned = 0;
    } else {
        status = 'NV';
        creditsEarned = 0;
    }

    // Save Result
    await TUResult.findOneAndUpdate(
        { studentId, tuId },
        {
            average: roundedAverage,
            status,
            creditsEarned,
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

        if (result.average < 6) {
            allTUsValidatedOrCompensable = false; // < 6 is fatal for compensation
        }
    }

    if (totalCredits === 0) return { average: 0, status: 'NOT VALIDATED' };

    const average = totalWeightedScore / totalCredits;
    const roundedAverage = Math.round(average * 100) / 100;

    // Determine Semester Status
    let status = 'NOT VALIDATED';

    // Validation Rules:
    // 1. Semester Avg >= 10
    // 2. All TUs >= 8 (V) OR (6 <= TU < 8 AND Compensated)

    // Check compensation eligibility
    // Max 1 V-C per semester (from docs: "max 1 per semester")
    let compensableCount = 0;
    let failedCount = 0;

    for (const item of tuResults) {
        if (item.result.average < 6) {
            failedCount++;
        } else if (item.result.average < 8) {
            compensableCount++;
        }
    }

    if (roundedAverage >= 10 && failedCount === 0) {
        if (compensableCount === 0) {
            status = 'VALIDATED';
        } else if (compensableCount === 1) {
            // Apply compensation
            status = 'VALIDATED';
            // We need to update the TU status to V-C
            for (const item of tuResults) {
                if (item.result.average >= 6 && item.result.average < 8) {
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
            totalCredits: status === 'VALIDATED' ? totalCredits : 0, // Or sum of acquired credits? Usually validated semester = all credits.
            status,
            mention,
            academicYear
        },
        { upsert: true, new: true }
    );

    return { average: roundedAverage, status, mention };
};
