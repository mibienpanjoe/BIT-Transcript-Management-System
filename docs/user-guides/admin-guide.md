# Admin User Guide

Welcome to the BIT TMS Admin Guide! This comprehensive guide will help you manage the entire system.

## Table of Contents
1. [Getting Started](#getting-started)
2. [User Management](#user-management)
3. [Student Management](#student-management)
4. [Academic Structure Setup](#academic-structure-setup)
5. [Transcript Generation](#transcript-generation)
6. [Best Practices](#best-practices)

---

## Getting Started

### Logging In
1. Navigate to the BIT TMS login page
2. Enter your admin email and password
3. Click **Login**
4. You'll be redirected to the admin dashboard

### Admin Dashboard Overview
The admin dashboard provides:
- **Summary cards**: Total users, students, fields, and promotions
- **Quick actions**: Create user, add student, manage structure
- **Navigation menu**: Access all admin features

---

## User Management

As an admin, you can create and manage all system users.

### Creating a New User

1. Navigate to **Admin → User Management**
2. Click **Add New User**
3. Fill in the user form:
   - **Email**: User's email address (must be unique)
   - **Password**: Temporary password (user should change on first login)
   - **First Name**: User's first name
   - **Last Name**: User's last name
   - **Role**: Select from:
     - `Admin` - Full system access
     - `Teacher` - Can enter grades for assigned courses
     - `Schooling Manager` - Can enter attendance only
4. Click **Create User**

### Viewing All Users

1. Navigate to **Admin → User Management**
2. View the user list table showing:
   - Name
   - Email
   - Role
   - Status (Active/Inactive)
   - Actions

### Editing a User

1. In the user list, click the **Edit** icon next to the user
2. Update the user information
3. Click **Save Changes**

> **Note**: You cannot change a user's email after creation

### Deactivating a User

1. In the user list, click the **Deactivate** button
2. Confirm the action
3. The user will no longer be able to log in

> **Warning**: Deactivating a teacher will not remove their grade entries, but they won't be able to enter new grades

---

## Student Management

### Adding a Single Student

1. Navigate to **Admin → Student Management**
2. Click **Add Student**
3. Fill in the student form:
   - **Student ID (Matricule)**: Unique identifier
   - **First Name**: Student's first name
   - **Last Name**: Student's last name
   - **Date of Birth**: Select from calendar
   - **Place of Birth**: City/location
   - **Field**: Select the field of study
   - **Promotion**: Select the promotion/cohort
   - **Academic Year**: e.g., "2023-2024"
4. Click **Create Student**

### Importing Students from Excel

For bulk student creation, use the Excel import feature.

#### Step 1: Download the Template
1. Navigate to **Admin → Student Management**
2. Click **Import Students**
3. Click **Download Template**
4. Save the Excel template to your computer

#### Step 2: Fill the Template
Open the template and fill in the following columns:
- `studentId` - Unique matricule (required)
- `firstName` - Student's first name (required)
- `lastName` - Student's last name (required)
- `dateOfBirth` - Format: YYYY-MM-DD (required)
- `placeOfBirth` - City/location (required)
- `fieldCode` - Field code (e.g., "EE", "CS") (required)
- `promotionName` - Promotion name (required)
- `academicYear` - e.g., "2023-2024" (required)

**Example:**
```
studentId,firstName,lastName,dateOfBirth,placeOfBirth,fieldCode,promotionName,academicYear
BIT2023001,Jean,Ouedraogo,2002-05-15,Ouagadougou,EE,L3 EE 2023-2024,2023-2024
BIT2023002,Marie,Kaboré,2003-08-22,Bobo-Dioulasso,CS,L3 CS 2023-2024,2023-2024
```

#### Step 3: Upload the File
1. In the import dialog, click **Choose File** or drag and drop
2. Select your filled Excel file
3. Click **Upload**
4. Wait for the import to complete
5. Review the import results:
   - ✅ **Success**: Number of students imported
   - ❌ **Errors**: List of rows with errors and reasons

### Searching and Filtering Students

1. Use the **Search Bar** to search by:
   - Student name
   - Student ID
2. Use **Filters** to filter by:
   - Field
   - Promotion
   - Academic Year
3. Click **Apply Filters**

### Editing a Student

1. In the student list, click the **Edit** icon
2. Update student information
3. Click **Save Changes**

### Deleting a Student

1. In the student list, click the **Delete** icon
2. Confirm the deletion

> **Warning**: Deleting a student will remove all their grades and attendance records. This action cannot be undone!

---

## Academic Structure Setup

The academic structure follows this hierarchy:
**Field → Promotion → Semester → TU → TUE**

### Managing Fields

Fields represent programs or departments (e.g., Electrical Engineering, Computer Science).

#### Creating a Field
1. Navigate to **Admin → Academic Structure → Fields**
2. Click **Add Field**
3. Fill in:
   - **Name**: Full field name (e.g., "Electrical Engineering & Renewable Energies")
   - **Code**: Short code (e.g., "EE")
   - **Description**: Optional description
4. Click **Create Field**

### Managing Promotions

Promotions represent cohorts or year groups.

#### Creating a Promotion
1. Navigate to **Admin → Academic Structure → Promotions**
2. Click **Add Promotion**
3. Fill in:
   - **Name**: e.g., "L3 Electrical Engineering 2023-2024"
   - **Field**: Select the field
   - **Level**: Select (L1, L2, L3, M1, M2)
   - **Academic Year**: e.g., "2023-2024"
4. Click **Create Promotion**

### Managing Semesters

Semesters organize courses by academic period.

#### Creating a Semester
1. Navigate to **Admin → Academic Structure → Semesters**
2. Click **Add Semester**
3. Fill in:
   - **Name**: e.g., "Semester 5 (L3S5)"
   - **Code**: e.g., "S5"
   - **Field**: Select the field
   - **Level**: Select the level
   - **Semester Number**: 1-6 for Licence
   - **Total Credits**: Typically 30
4. Click **Create Semester**

### Managing Teaching Units (TUs)

TUs are groups of related courses.

#### Creating a TU
1. Navigate to **Admin → Academic Structure → TUs**
2. Click **Add TU**
3. Fill in:
   - **Name**: e.g., "Renewable Energy IV"
   - **Code**: e.g., "TU_L3S5_01"
   - **Semester**: Select the semester
   - **Credits**: Number of credits (2-4 typically)
4. Click **Create TU**

### Managing Teaching Unit Elements (TUEs)

TUEs are individual courses or modules.

#### Creating a TUE
1. Navigate to **Admin → Academic Structure → TUEs**
2. Click **Add TUE**
3. Fill in:
   - **Name**: e.g., "Solar Thermal Energy"
   - **Code**: e.g., "EE_L3_REN401"
   - **TU**: Select the parent TU
   - **Credits**: Number of credits (1-4)
   - **Teacher**: Assign a teacher
   - **Volume Hours**: Optional
4. Configure **Evaluation Structure**:
   - Click **Add Evaluation**
   - Enter evaluation name (e.g., "Devoir Surveillé 1")
   - Select type (DS, DM, Project, Final, CC, TP, Presentation)
   - Enter coefficient (percentage)
   - Repeat for all evaluations
   - **Important**: Total coefficients must equal 100%
5. Click **Create TUE**

**Example Evaluation Structure:**
- DS 1: 20%
- DS 2: 20%
- DM: 10%
- Final Exam: 50%
- **Total**: 100% ✅

---

## Transcript Generation

### Viewing a Student's Transcript

1. Navigate to **Admin → Transcript Management**
2. Search for the student by name or ID
3. Click **View Transcript**
4. Review the transcript data:
   - Student information
   - All semester results
   - TU and TUE grades
   - Validation statuses
   - Mentions
   - Credits earned

### Generating a Single PDF Transcript

1. After viewing a transcript, click **Generate PDF**
2. Wait for the PDF to be generated
3. The PDF will automatically download
4. Open and review the PDF

### Bulk PDF Generation

To generate transcripts for multiple students:

1. Navigate to **Admin → Transcript Management**
2. Click **Bulk Generate**
3. Select students:
   - Use checkboxes to select individual students, OR
   - Use filters to select by field/promotion, OR
   - Click **Select All**
4. Click **Generate PDFs**
5. Monitor the progress indicator
6. Once complete, click **Download ZIP**
7. Extract the ZIP file to access individual PDFs

> **Tip**: For large batches (100+ students), generation may take several minutes. Don't close the browser during generation.

### Understanding the Transcript PDF

The generated PDF includes:

**Header Section:**
- BIT logo and institution name
- Ministry authorizations

**Student Information:**
- Full name, Student ID
- Date and place of birth
- Field and specialization
- Academic year

**Academic Results (Per Semester):**
- Semester name
- Table of TUs with:
  - TU name and credits
  - List of TUEs with individual grades
  - TU average
  - Validation status (V/NV/V-C)
  - Credits earned
- Semester average
- Total credits for semester
- Semester decision

**Footer:**
- Validation rules
- Mention scale
- Issue date
- Signature line

---

## Best Practices

### User Management
- ✅ Create users with temporary passwords and instruct them to change on first login
- ✅ Regularly review and deactivate unused accounts
- ✅ Assign the minimum role necessary (principle of least privilege)

### Student Management
- ✅ Use Excel import for bulk student creation
- ✅ Verify student IDs are unique before importing
- ✅ Keep student records up to date

### Academic Structure
- ✅ Set up the complete structure before grade entry begins
- ✅ Ensure evaluation structures total 100% before saving
- ✅ Assign teachers to TUEs before the semester starts
- ✅ Double-check credit values

### Transcript Generation
- ✅ Verify all grades are entered before generating transcripts
- ✅ Review a sample transcript before bulk generation
- ✅ Store generated PDFs securely
- ✅ Generate transcripts at the end of each semester

### Data Integrity
- ✅ Regularly backup the database
- ✅ Test imports with small batches first
- ✅ Verify calculations are correct
- ✅ Keep audit trails of major changes

---

## Troubleshooting

### Common Issues

**Problem**: Excel import fails  
**Solution**: Verify the Excel file matches the template format exactly. Check for:
- Correct column names
- Valid date formats (YYYY-MM-DD)
- Existing field codes and promotion names
- No duplicate student IDs

**Problem**: Evaluation structure won't save  
**Solution**: Ensure the total coefficients equal exactly 100%

**Problem**: PDF generation is slow  
**Solution**: This is normal for bulk generation. For 100+ students, expect 5-10 minutes

**Problem**: Teacher can't see their TUEs  
**Solution**: Verify the teacher is assigned to the TUE in the academic structure

For more help, see the [Troubleshooting Guide](../troubleshooting.md) or contact technical support.

---

**Document Version**: 1.0  
**Last Updated**: November 22, 2025  
**For**: BIT TMS Administrators
