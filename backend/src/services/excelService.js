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
