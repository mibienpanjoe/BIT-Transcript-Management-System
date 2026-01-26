const xlsx = require('xlsx');
const Student = require('../models/Student');
const Field = require('../models/Field');
const Promotion = require('../models/Promotion');

exports.parseStudentExcel = async (buffer) => {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    return data;
};

exports.validateAndImportStudents = async (data, fieldId, promotionId, academicYear) => {
    const results = {
        success: 0,
        errors: [],
        imported: []
    };

    // Verify field and promotion exist
    const field = await Field.findById(fieldId);
    const promotion = await Promotion.findById(promotionId);

    if (!field || !promotion) {
        throw new Error('Invalid Field or Promotion ID');
    }

    for (const [index, row] of data.entries()) {
        try {
            // Map Excel columns to Student model fields
            // Assuming Excel has columns: Matricule, FirstName, LastName, DateOfBirth, PlaceOfBirth
            const studentData = {
                studentId: row['Matricule'] || row['Student ID'] || row['ID'],
                firstName: row['FirstName'] || row['First Name'] || row['Prenom'],
                lastName: row['LastName'] || row['Last Name'] || row['Nom'],
                dateOfBirth: row['DateOfBirth'] || row['Date of Birth'] || row['Date Naissance'],
                placeOfBirth: row['PlaceOfBirth'] || row['Place of Birth'] || row['Lieu Naissance'],
                fieldId,
                promotionId,
                academicYear,
            };

            // Basic validation
            if (!studentData.studentId || !studentData.firstName || !studentData.lastName) {
                results.errors.push({ row: index + 2, message: 'Missing required fields' });
                continue;
            }

            // Check if student already exists
            const existingStudent = await Student.findOne({ studentId: studentData.studentId });
            if (existingStudent) {
                results.errors.push({ row: index + 2, message: `Student with ID ${studentData.studentId} already exists` });
                continue;
            }

            // Create student
            const student = await Student.create(studentData);
            results.success++;
            results.imported.push(student);

        } catch (error) {
            results.errors.push({ row: index + 2, message: error.message });
        }
    }

    return results;
};

// @desc    Parse grade Excel file
exports.parseGradeExcel = async (buffer) => {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    return data;
};

// @desc    Validate and structure grade data from Excel
exports.validateGradeData = async (data, tueId) => {
    const results = {
        success: 0,
        errors: [],
        grades: []
    };

    for (const [index, row] of data.entries()) {
        try {
            const studentId = row['Student ID'] || row['Matricule'] || row['ID'];
            const participation = parseFloat(row['Participation']) || 10;
            const evaluation = parseFloat(row['Evaluation']) || 0;

            // Validate student ID
            if (!studentId) {
                results.errors.push({ row: index + 2, message: 'Missing Student ID' });
                continue;
            }

            // Find student
            const student = await Student.findOne({ studentId: studentId });
            if (!student) {
                results.errors.push({ row: index + 2, message: `Student ${studentId} not found` });
                continue;
            }

            // Validate grade values (0-20)
            if (participation < 0 || participation > 20) {
                results.errors.push({ row: index + 2, message: 'Participation must be between 0 and 20' });
                continue;
            }
            if (evaluation < 0 || evaluation > 20) {
                results.errors.push({ row: index + 2, message: 'Evaluation must be between 0 and 20' });
                continue;
            }

            results.grades.push({
                studentId: student._id,
                tueId,
                participation,
                evaluation
            });

            results.success++;

        } catch (error) {
            results.errors.push({ row: index + 2, message: error.message });
        }
    }

    return results;
};

// @desc    Generate grade template Excel for a TUE
exports.generateGradeTemplate = async (tue, students) => {
    // Create workbook
    const wb = xlsx.utils.book_new();

    // Prepare data rows
    const data = students.map(s => ({
        'Student ID': s.studentId,
        'Last Name': s.lastName,
        'First Name': s.firstName,
        'Participation': '', // Empty for teacher to fill
        'Evaluation': '' // Empty for teacher to fill
    }));

    // Add header row with instructions
    const ws = xlsx.utils.json_to_sheet(data);

    // Set column widths
    ws['!cols'] = [
        { wch: 15 }, // Student ID
        { wch: 20 }, // Last Name
        { wch: 20 }, // First Name
        { wch: 15 }, // Participation
        { wch: 15 }  // Evaluation
    ];

    // Add worksheet to workbook
    xlsx.utils.book_append_sheet(wb, ws, 'Grades');

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
};

// @desc    Generate attendance template Excel for a TUE
exports.generateAttendanceTemplate = async (tue, students) => {
    // Create workbook
    const wb = xlsx.utils.book_new();

    // Prepare data rows
    const data = students.map(s => ({
        'Student ID': s.studentId,
        'Last Name': s.lastName,
        'First Name': s.firstName,
        'Presence': '' // Empty for manager to fill (0-20)
    }));

    // Add header row with instructions
    const ws = xlsx.utils.json_to_sheet(data);

    // Set column widths
    ws['!cols'] = [
        { wch: 15 }, // Student ID
        { wch: 20 }, // Last Name
        { wch: 20 }, // First Name
        { wch: 15 }  // Presence
    ];

    // Add worksheet to workbook
    xlsx.utils.book_append_sheet(wb, ws, 'Attendance');

    // Generate buffer
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
};

// @desc    Validate and structure attendance data from Excel
exports.validateAttendanceData = async (data, tueId) => {
    const results = {
        success: 0,
        errors: [],
        grades: []
    };

    for (const [index, row] of data.entries()) {
        try {
            const studentId = row['Student ID'] || row['Matricule'] || row['ID'];
            const presence = parseFloat(row['Presence']);

            // Validate student ID
            if (!studentId) {
                results.errors.push({ row: index + 2, message: 'Missing Student ID' });
                continue;
            }

            // Find student
            const student = await Student.findOne({ studentId: studentId });
            if (!student) {
                results.errors.push({ row: index + 2, message: `Student ${studentId} not found` });
                continue;
            }

            // Validate presence values (0-20)
            if (isNaN(presence)) {
                // Skip if empty, or handle as error? Let's skip empty rows but error on invalid numbers
                // If it's undefined/null/empty string, maybe we just skip updating this student
                continue;
            }

            if (presence < 0 || presence > 20) {
                results.errors.push({ row: index + 2, message: 'Presence must be between 0 and 20' });
                continue;
            }

            results.grades.push({
                studentId: student._id,
                tueId,
                presence
            });

            results.success++;

        } catch (error) {
            results.errors.push({ row: index + 2, message: error.message });
        }
    }

    return results;
};
