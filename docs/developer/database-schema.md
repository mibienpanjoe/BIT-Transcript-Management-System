# Database Schema Documentation

This document provides comprehensive documentation of the BIT TMS database schema.

## Table of Contents
1. [Overview](#overview)
2. [Collections](#collections)
3. [Relationships](#relationships)
4. [Indexes](#indexes)
5. [Data Validation](#data-validation)

---

## Overview

### Database Technology
- **Database**: MongoDB (NoSQL)
- **ODM**: Mongoose
- **Hosting**: MongoDB Atlas (recommended for production)

### Design Principles
- **Normalization**: Collections are normalized to reduce redundancy
- **References**: ObjectId references for relationships
- **Embedded Documents**: Used for tightly coupled data (e.g., evaluation structures)
- **Calculated Fields**: Some fields are computed and stored for performance

---

## Collections

### 1. Users Collection

Stores all system users (admins, teachers, schooling managers).

```javascript
{
  _id: ObjectId,
  email: String,              // Unique, required
  password: String,           // Hashed with bcrypt, required
  role: String,               // Enum: ['admin', 'teacher', 'schooling_manager']
  firstName: String,          // Required
  lastName: String,           // Required
  isActive: Boolean,          // Default: true
  createdAt: Date,           // Auto-generated
  updatedAt: Date            // Auto-generated
}
```

**Indexes:**
- `email`: Unique index
- `role`: Non-unique index for filtering

**Validation:**
- Email must be valid format
- Password minimum 8 characters (enforced at application level)
- Role must be one of the enum values

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "jean.ouedraogo@bit.edu.bf",
  "password": "$2b$10$abcdefghijklmnopqrstuvwxyz",
  "role": "teacher",
  "firstName": "Jean",
  "lastName": "Ouedraogo",
  "isActive": true,
  "createdAt": "2024-01-15T08:00:00.000Z",
  "updatedAt": "2024-01-15T08:00:00.000Z"
}
```

---

### 2. Students Collection

Stores student information.

```javascript
{
  _id: ObjectId,
  studentId: String,          // Unique matricule, required
  firstName: String,          // Required
  lastName: String,           // Required
  dateOfBirth: Date,         // Required
  placeOfBirth: String,      // Required
  fieldId: ObjectId,         // Ref: 'Field', required
  promotionId: ObjectId,     // Ref: 'Promotion', required
  academicYear: String,      // e.g., "2023-2024"
  isActive: Boolean,         // Default: true
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `studentId`: Unique index
- `fieldId`: Non-unique index
- `promotionId`: Non-unique index
- Compound index: `[fieldId, promotionId, academicYear]`

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "studentId": "BIT2023001",
  "firstName": "Marie",
  "lastName": "Kaboré",
  "dateOfBirth": "2003-08-22T00:00:00.000Z",
  "placeOfBirth": "Bobo-Dioulasso",
  "fieldId": "507f1f77bcf86cd799439013",
  "promotionId": "507f1f77bcf86cd799439014",
  "academicYear": "2023-2024",
  "isActive": true,
  "createdAt": "2024-01-15T08:00:00.000Z",
  "updatedAt": "2024-01-15T08:00:00.000Z"
}
```

---

### 3. Fields Collection

Represents academic programs or departments.

```javascript
{
  _id: ObjectId,
  name: String,              // Required, e.g., "Electrical Engineering & Renewable Energies"
  code: String,              // Unique, required, e.g., "EE"
  description: String,       // Optional
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `code`: Unique index

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "name": "Electrical Engineering & Renewable Energies",
  "code": "EE",
  "description": "Focus on electrical systems and renewable energy technologies",
  "createdAt": "2024-01-15T08:00:00.000Z",
  "updatedAt": "2024-01-15T08:00:00.000Z"
}
```

---

### 4. Promotions Collection

Represents cohorts or year groups.

```javascript
{
  _id: ObjectId,
  name: String,              // Required, e.g., "L3 Electrical Engineering 2023-2024"
  fieldId: ObjectId,         // Ref: 'Field', required
  academicYear: String,      // Required, e.g., "2023-2024"
  level: String,             // Enum: ['L1', 'L2', 'L3', 'M1', 'M2'], required
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `fieldId`: Non-unique index
- Compound index: `[fieldId, level, academicYear]`

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "name": "L3 Electrical Engineering 2023-2024",
  "fieldId": "507f1f77bcf86cd799439013",
  "academicYear": "2023-2024",
  "level": "L3",
  "createdAt": "2024-01-15T08:00:00.000Z",
  "updatedAt": "2024-01-15T08:00:00.000Z"
}
```

---

### 5. Semesters Collection

Organizes courses by academic period.

```javascript
{
  _id: ObjectId,
  name: String,              // Required, e.g., "Semester 5 (L3S5)"
  code: String,              // Required, e.g., "S5"
  fieldId: ObjectId,         // Ref: 'Field', required
  level: String,             // Enum: ['L1', 'L2', 'L3', 'M1', 'M2']
  semesterNumber: Number,    // 1-6 for Licence, 1-4 for Master
  totalCredits: Number,      // Typically 30
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `fieldId`: Non-unique index
- Compound index: `[fieldId, level, semesterNumber]`

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "name": "Semester 5 (L3S5)",
  "code": "S5",
  "fieldId": "507f1f77bcf86cd799439013",
  "level": "L3",
  "semesterNumber": 5,
  "totalCredits": 30,
  "createdAt": "2024-01-15T08:00:00.000Z",
  "updatedAt": "2024-01-15T08:00:00.000Z"
}
```

---

### 6. Teaching Units (TUs) Collection

Groups of related courses.

```javascript
{
  _id: ObjectId,
  name: String,              // Required, e.g., "Renewable Energy IV"
  code: String,              // Unique, required, e.g., "TU_L3S5_01"
  semesterId: ObjectId,      // Ref: 'Semester', required
  credits: Number,           // Required, typically 2-4
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `code`: Unique index
- `semesterId`: Non-unique index

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439016",
  "name": "Renewable Energy IV",
  "code": "TU_L3S5_01",
  "semesterId": "507f1f77bcf86cd799439015",
  "credits": 3,
  "createdAt": "2024-01-15T08:00:00.000Z",
  "updatedAt": "2024-01-15T08:00:00.000Z"
}
```

---

### 7. Teaching Unit Elements (TUEs) Collection

Individual courses or modules.

```javascript
{
  _id: ObjectId,
  name: String,              // Required, e.g., "Solar Thermal Energy"
  code: String,              // Unique, required, e.g., "EE_L3_REN401"
  tuId: ObjectId,            // Ref: 'TU', required
  credits: Number,           // Required, 1-4
  teacherId: ObjectId,       // Ref: 'User', required
  volumeHours: Number,       // Optional
  evaluationStructure: [{
    name: String,            // e.g., "Devoir Surveillé 1"
    type: String,            // Enum: ['DS', 'DM', 'Project', 'Final', 'CC', 'TP', 'Presentation']
    coefficient: Number      // Percentage, sum must equal 100
  }],
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `code`: Unique index
- `tuId`: Non-unique index
- `teacherId`: Non-unique index

**Validation:**
- Evaluation structure coefficients must sum to 100

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439017",
  "name": "Solar Thermal Energy",
  "code": "EE_L3_REN401",
  "tuId": "507f1f77bcf86cd799439016",
  "credits": 2,
  "teacherId": "507f1f77bcf86cd799439011",
  "volumeHours": 40,
  "evaluationStructure": [
    { "name": "DS 1", "type": "DS", "coefficient": 20 },
    { "name": "DS 2", "type": "DS", "coefficient": 20 },
    { "name": "DM", "type": "DM", "coefficient": 10 },
    { "name": "Final Exam", "type": "Final", "coefficient": 50 }
  ],
  "createdAt": "2024-01-15T08:00:00.000Z",
  "updatedAt": "2024-01-15T08:00:00.000Z"
}
```

---

### 8. Grades Collection

Stores student grades for each TUE.

```javascript
{
  _id: ObjectId,
  studentId: ObjectId,       // Ref: 'Student', required
  tueId: ObjectId,           // Ref: 'TUE', required
  
  // Component Grades
  presenceGrade: Number,     // 0-20, calculated from attendance
  participationGrade: Number, // 0-20, default: 10
  
  // Evaluation Grades
  evaluationGrades: [{
    evaluationName: String,
    grade: Number,           // 0-20
    coefficient: Number
  }],
  
  // Calculated Fields
  evaluationsAverage: Number, // Weighted average of evaluations
  finalGrade: Number,        // Calculated: presence*5% + participation*5% + evaluations*90%
  
  // Metadata
  enteredBy: ObjectId,       // Ref: 'User'
  lastModifiedBy: ObjectId,  // Ref: 'User'
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- Compound index: `[studentId, tueId]` (unique)
- `tueId`: Non-unique index
- `enteredBy`: Non-unique index

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439018",
  "studentId": "507f1f77bcf86cd799439012",
  "tueId": "507f1f77bcf86cd799439017",
  "presenceGrade": 18.00,
  "participationGrade": 12.00,
  "evaluationGrades": [
    { "evaluationName": "DS 1", "grade": 14.00, "coefficient": 20 },
    { "evaluationName": "DS 2", "grade": 16.00, "coefficient": 20 },
    { "evaluationName": "DM", "grade": 15.00, "coefficient": 10 },
    { "evaluationName": "Final Exam", "grade": 17.00, "coefficient": 50 }
  ],
  "evaluationsAverage": 16.00,
  "finalGrade": 15.90,
  "enteredBy": "507f1f77bcf86cd799439011",
  "lastModifiedBy": "507f1f77bcf86cd799439011",
  "createdAt": "2024-01-15T08:00:00.000Z",
  "updatedAt": "2024-01-15T08:00:00.000Z"
}
```

---

### 9. Attendance Collection

Tracks student attendance.

```javascript
{
  _id: ObjectId,
  studentId: ObjectId,       // Ref: 'Student', required
  tueId: ObjectId,           // Ref: 'TUE', required
  totalSessions: Number,     // Required
  attendedSessions: Number,  // Required
  attendancePercentage: Number, // Calculated
  attendanceGrade: Number,   // Calculated: percentage * 20/100
  enteredBy: ObjectId,       // Ref: 'User', Schooling Manager
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- Compound index: `[studentId, tueId]` (unique)
- `tueId`: Non-unique index

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439019",
  "studentId": "507f1f77bcf86cd799439012",
  "tueId": "507f1f77bcf86cd799439017",
  "totalSessions": 20,
  "attendedSessions": 18,
  "attendancePercentage": 90.00,
  "attendanceGrade": 18.00,
  "enteredBy": "507f1f77bcf86cd799439020",
  "createdAt": "2024-01-15T08:00:00.000Z",
  "updatedAt": "2024-01-15T08:00:00.000Z"
}
```

---

### 10. TU Results Collection

Calculated results for each TU.

```javascript
{
  _id: ObjectId,
  studentId: ObjectId,       // Ref: 'Student', required
  tuId: ObjectId,            // Ref: 'TU', required
  semesterId: ObjectId,      // Ref: 'Semester', required
  
  // TU Grades from all TUEs
  tueGrades: [{
    tueId: ObjectId,
    tueName: String,
    grade: Number,
    credits: Number
  }],
  
  // Calculated Fields
  tuAverage: Number,         // Weighted average based on TUE credits
  creditsAttempted: Number,
  creditsEarned: Number,     // 0 if not validated, full if validated
  validationStatus: String,  // Enum: ['V', 'NV', 'V-C']
  
  calculatedAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- Compound index: `[studentId, tuId]` (unique)
- `semesterId`: Non-unique index

---

### 11. Semester Results Collection

Calculated results for each semester.

```javascript
{
  _id: ObjectId,
  studentId: ObjectId,       // Ref: 'Student', required
  semesterId: ObjectId,      // Ref: 'Semester', required
  promotionId: ObjectId,     // Ref: 'Promotion', required
  academicYear: String,
  
  // TU Results for this semester
  tuResults: [{
    tuId: ObjectId,
    tuName: String,
    tuAverage: Number,
    tuCredits: Number,
    validationStatus: String, // 'V', 'NV', 'V-C'
    creditsEarned: Number
  }],
  
  // Calculated Fields
  semesterAverage: Number,   // Weighted average of TUs
  totalCreditsAttempted: Number,
  totalCreditsEarned: Number,
  semesterValidation: String, // Enum: ['VALIDATED', 'NOT_VALIDATED', 'ADJOURNED']
  mention: String,           // A++, A+, A, B+, B, C+, C, D+, D, F
  
  calculatedAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- Compound index: `[studentId, semesterId]` (unique)
- `promotionId`: Non-unique index

---

## Relationships

### Entity Relationship Diagram

```
User (Teacher) ──< TUE
                   │
Field ──< Promotion ──< Student ──< Grade
  │                       │          │
  └──< Semester ──< TU ──<┘          │
                     │               │
                     └──< TUE ──<────┘
                          │
                          └──< Attendance
```

### Relationship Details

1. **Field → Promotion**: One-to-Many
2. **Field → Semester**: One-to-Many
3. **Promotion → Student**: One-to-Many
4. **Semester → TU**: One-to-Many
5. **TU → TUE**: One-to-Many
6. **User (Teacher) → TUE**: One-to-Many
7. **Student → Grade**: One-to-Many
8. **TUE → Grade**: One-to-Many
9. **Student → Attendance**: One-to-Many
10. **TUE → Attendance**: One-to-Many

---

## Indexes

### Performance Indexes

```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

// Students
db.students.createIndex({ studentId: 1 }, { unique: true });
db.students.createIndex({ fieldId: 1 });
db.students.createIndex({ promotionId: 1 });
db.students.createIndex({ fieldId: 1, promotionId: 1, academicYear: 1 });

// Fields
db.fields.createIndex({ code: 1 }, { unique: true });

// Promotions
db.promotions.createIndex({ fieldId: 1 });
db.promotions.createIndex({ fieldId: 1, level: 1, academicYear: 1 });

// Semesters
db.semesters.createIndex({ fieldId: 1 });
db.semesters.createIndex({ fieldId: 1, level: 1, semesterNumber: 1 });

// TUs
db.tus.createIndex({ code: 1 }, { unique: true });
db.tus.createIndex({ semesterId: 1 });

// TUEs
db.tues.createIndex({ code: 1 }, { unique: true });
db.tues.createIndex({ tuId: 1 });
db.tues.createIndex({ teacherId: 1 });

// Grades
db.grades.createIndex({ studentId: 1, tueId: 1 }, { unique: true });
db.grades.createIndex({ tueId: 1 });
db.grades.createIndex({ enteredBy: 1 });

// Attendance
db.attendance.createIndex({ studentId: 1, tueId: 1 }, { unique: true });
db.attendance.createIndex({ tueId: 1 });

// TU Results
db.turesults.createIndex({ studentId: 1, tuId: 1 }, { unique: true });
db.turesults.createIndex({ semesterId: 1 });

// Semester Results
db.semesterresults.createIndex({ studentId: 1, semesterId: 1 }, { unique: true });
db.semesterresults.createIndex({ promotionId: 1 });
```

---

## Data Validation

### Mongoose Schema Validation

All collections use Mongoose schemas with built-in validation:

- **Required Fields**: Enforced at schema level
- **Unique Constraints**: Enforced via unique indexes
- **Enum Validation**: For fields with fixed values
- **Range Validation**: For numeric fields (e.g., grades 0-20)
- **Custom Validators**: For complex validation (e.g., coefficient sum = 100)

### Application-Level Validation

Additional validation in controllers:
- Email format validation
- Password strength requirements
- Grade range checks (0-20)
- Date validation
- File upload validation (Excel imports)

---

**Document Version**: 1.0  
**Last Updated**: November 22, 2025  
**For**: BIT TMS Developers
