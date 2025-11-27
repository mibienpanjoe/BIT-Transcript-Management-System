# BIT TMS - Comprehensive Testing Guide

This guide will walk you through testing all features of the BIT Transcript Management System using the provided sample data.

> **📝 Important Update (Nov 22, 2025):** The Semester model has been simplified! Semesters no longer require `startDate` and `endDate` fields. Instead, they use a simple `order` field (1-6) to sequence semesters within a promotion. This makes data entry simpler and aligns better with the transcript management purpose of the system.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Phase 1: Initial Setup](#phase-1-initial-setup)
3. [Phase 2: User Management](#phase-2-user-management)
4. [Phase 3: Academic Structure](#phase-3-academic-structure)
5. [Phase 4: Student Management](#phase-4-student-management)
6. [Phase 5: Attendance Entry](#phase-5-attendance-entry)
7. [Phase 6: Grade Entry](#phase-6-grade-entry)
8. [Phase 7: Transcript Generation](#phase-7-transcript-generation)
9. [Testing Checklist](#testing-checklist)

---

## Prerequisites

### 1. Start the Application

**Backend:**
```bash
cd backend
npm start
```
Server runs on: `http://localhost:5000`

**Frontend:**
```bash
cd frontend
npm run dev
```
Application runs on: `http://localhost:5173`

### 2. Verify Login

- Navigate to `http://localhost:5173`
- Use the default admin credentials:
  - **Email**: admin@bit.com
  - **Password**: admin123
- You should see the Admin Dashboard

### 3. Sample Data Files

All sample data is located in the `testing/sample-data/` directory:
- `students-import-template.csv` - 20 student records (10 EE, 10 CS)
- `grades-import-template-solar-thermal.csv` - Grades for EE students
- `grades-import-template-programming.csv` - Grades for CS students
- `test-users.md` - User accounts to create
- `academic-structure-data.md` - Complete academic structure
- `attendance-data.md` - Attendance records

---

## Phase 1: Initial Setup

### Expected Results
✅ Backend server running without errors  
✅ Frontend accessible at localhost:5173  
✅ Admin login successful  
✅ Dashboard displays with statistics (initially zeros)

---

## Phase 2: User Management

**Objective**: Create all test user accounts

### Step 2.1: Create Teacher Accounts

1. Navigate to **Admin → User Management**
2. Click **Add New User**
3. Create Teacher 1:
   - Email: `teacher1@bit.com`
   - Password: `teacher123`
   - First Name: `Dr. Ahmed`
   - Last Name: `Ouédraogo`
   - Role: `Teacher`
   - Click **Create User**

4. Repeat for Teacher 2:
   - Email: `teacher2@bit.com`
   - Password: `teacher123`
   - First Name: `Prof. Fatou`
   - Last Name: `Diop`
   - Role: `Teacher`

5. Repeat for Teacher 3:
   - Email: `teacher3@bit.com`
   - Password: `teacher123`
   - First Name: `Dr. Pierre`
   - Last Name: `Zoungrana`
   - Role: `Teacher`

### Step 2.2: Create Schooling Manager Account

1. Click **Add New User**
2. Fill in:
   - Email: `manager@bit.com`
   - Password: `manager123`
   - First Name: `Mrs. Aminata`
   - Last Name: `Kaboré`
   - Role: `Schooling Manager`
3. Click **Create User**

### Expected Results
✅ 4 new users created (3 Teachers, 1 Manager)  
✅ User list shows all 5 users (including admin)  
✅ All users show status "Active"

### Test Login for Each User
- Logout from admin account
- Login with each teacher account and manager account
- Verify appropriate dashboard appears for each role
- Logout and login back as admin

---

## Phase 3: Academic Structure

**Objective**: Set up the complete academic hierarchy

Reference: `sample-data/academic-structure-data.md`

### Step 3.1: Create Fields

1. Navigate to **Admin → Academic Structure → Fields**
2. Click **Add Field**

**Field 1:**
- Name: `Electrical Engineering & Renewable Energies`
- Code: `EE`
- Description: `Program focusing on electrical systems and renewable energy technologies`
- Click **Create Field**

**Field 2:**
- Name: `Computer Science & Software Engineering`
- Code: `CS`
- Description: `Program focusing on software development and computer systems`
- Click **Create Field**

### Step 3.2: Create Promotions

1. Navigate to **Admin → Academic Structure → Promotions**
2. Click **Add Promotion**

**Promotion 1:**
- Name: `L3 EE 2023-2024`
- Field: `Electrical Engineering & Renewable Energies`
- Level: `L3`
- Academic Year: `2023-2024`
- Click **Create Promotion**

**Promotion 2:**
- Name: `L3 CS 2023-2024`
- Field: `Computer Science & Software Engineering`
- Level: `L3`
- Academic Year: `2023-2024`
- Click **Create Promotion**

### Step 3.3: Create Semesters

1. Navigate to **Admin → Academic Structure → Semesters**
2. **Important**: You must first select a Field, then select a Promotion before the "Add Semester" button becomes enabled
3. Create the following semesters:

**Semester 1 (EE S1):**
- Select Filter: Field = `Electrical Engineering & Renewable Energies`
- Select Filter: Promotion = `L3 EE 2023-2024`
- Click **Add Semester**
- Name: `S1`
- Promotion: `L3 EE 2023-2024` (should be pre-selected from filter)
- Level: `Licence 3`
- Order: `1`
- Click **Create Semester**

**Semester 2 (CS S1):**
- Select Filter: Field = `Computer Science & Software Engineering`
- Select Filter: Promotion = `L3 CS 2023-2024`
- Click **Add Semester**
- Name: `S1`
- Promotion: `L3 CS 2023-2024` (should be pre-selected from filter)
- Level: `Licence 3`
- Order: `1`
- Click **Create Semester**

> **Note**: The `order` field (1-6) helps sequence semesters within a promotion. It's simpler than dates and more aligned with transcript management needs.

### Step 3.4: Create Teaching Units (TUs)

1. Navigate to **Admin → Academic Structure → TUs**
2. Create the following TUs:

**For EE:**

**TU 1:**
- Name: `Renewable Energy IV`
- Code: `TU_L3S1_EE_01`
- Semester: `S1` - EE
- Credits: `4`

**TU 2:**
- Name: `Power Systems III`
- Code: `TU_L3S1_EE_02`
- Semester: `S1` - EE
- Credits: `4`

**TU 3:**
- Name: `Digital Electronics II`
- Code: `TU_L3S1_EE_03`
- Semester: `S1` - EE
- Credits: `3`

**For CS:**

**TU 4:**
- Name: `Advanced Programming`
- Code: `TU_L3S1_CS_01`
- Semester: `S1` - CS
- Credits: `4`

**TU 5:**
- Name: `Database Systems`
- Code: `TU_L3S1_CS_02`
- Semester: `S1` - CS
- Credits: `4`

**TU 6:**
- Name: `Web Development`
- Code: `TU_L3S1_CS_03`
- Semester: `S1` - CS
- Credits: `3`

### Step 3.5: Create Teaching Unit Elements (TUEs)

1. Navigate to **Admin → Academic Structure → TUEs**
2. Create at least 4 TUEs (2 for EE, 2 for CS) for testing:

**TUE 1 - Solar Thermal Energy (EE):**
- Name: `Solar Thermal Energy`
- Code: `EE_L3_REN401`
- TU: `Renewable Energy IV`
- Credits: `2`
- Teacher: `Dr. Ahmed Ouédraogo` (teacher1@bit.com)
- Volume Hours: `40`
- **Evaluation Structure** (must total 100%):
  - Click **Add Evaluation**
    - Name: `DS 1`, Type: `DS`, Coefficient: `20`
  - Click **Add Evaluation**
    - Name: `DS 2`, Type: `DS`, Coefficient: `20`
  - Click **Add Evaluation**
    - Name: `DM`, Type: `DM`, Coefficient: `10`
  - Click **Add Evaluation**
    - Name: `Final Exam`, Type: `Final`, Coefficient: `50`
  - **Total: 100%** ✅
- Click **Create TUE**

**TUE 2 - Wind Energy Systems (EE):**
- Name: `Wind Energy Systems`
- Code: `EE_L3_REN402`
- TU: `Renewable Energy IV`
- Credits: `2`
- Teacher: `Dr. Ahmed Ouédraogo`
- Volume Hours: `40`
- **Evaluation Structure**:
  - DS 1: 25%
  - DS 2: 25%
  - Final Exam: 50%
  - **Total: 100%** ✅

**TUE 3 - Object-Oriented Programming (CS):**
- Name: `Object-Oriented Programming`
- Code: `CS_L3_PRG401`
- TU: `Advanced Programming`
- Credits: `2`
- Teacher: `Prof. Fatou Diop` (teacher2@bit.com)
- Volume Hours: `45`
- **Evaluation Structure**:
  - TP 1: 15%
  - TP 2: 15%
  - Project: 20%
  - Final Exam: 50%
  - **Total: 100%** ✅

**TUE 4 - Data Structures & Algorithms (CS):**
- Name: `Data Structures & Algorithms`
- Code: `CS_L3_PRG402`
- TU: `Advanced Programming`
- Credits: `2`
- Teacher: `Prof. Fatou Diop`
- Volume Hours: `45`
- **Evaluation Structure**:
  - DS 1: 20%
  - DS 2: 20%
  - CC: 10%
  - Final Exam: 50%
  - **Total: 100%** ✅

### Expected Results
✅ 2 Fields created  
✅ 2 Promotions created  
✅ 2 Semesters created  
✅ 6 TUs created (3 EE, 3 CS)  
✅ 4+ TUEs created with teachers assigned  
✅ All evaluation structures total 100%  
✅ Academic hierarchy is browsable

---

## Phase 4: Student Management

**Objective**: Import students from Excel

### Step 4.1: Import Students

1. Navigate to **Admin → Student Management**
2. Click **Import Excel** (was "Import Students")
3. **Select Import Options**:
   - Field: `Electrical Engineering & Renewable Energies`
   - Promotion: `L3 EE 2023-2024`
   - Academic Year: `2023-2024`
4. Click **Choose File**
5. Select `testing/sample-data/students-import-template.csv` (or the .xlsx version if you converted it)
   > **Note**: Since we are selecting "EE" in the dropdown, this will import ALL students in the file as "EE" students, even if the file contains "CS" students. Ideally, split your CSV into separate files per promotion.
6. Click **Import**
7. Wait for import to complete

### Expected Results
✅ Import success message: "20 students imported successfully"  
✅ No errors in import results  
✅ Student list shows 20 students  
✅ Filter by Field "EE" shows 10 students  
✅ Filter by Field "CS" shows 10 students  
✅ Filter by Promotion "L3 EE 2023-2024" shows 10 students  
✅ Filter by Promotion "L3 CS 2023-2024" shows 10 students

### Step 4.2: Verify Student Data

1. Click on a few students to view their details
2. Verify:
   - Student ID (Matricule) is correct
   - Names are correct
   - Date of birth is formatted correctly
   - Field and Promotion are assigned correctly

### Step 4.3: Test Search

1. Search for "Jean Ouedraogo" - should find BIT2023001
2. Search for "BIT2023011" - should find Ibrahim Koné
3. Search with partial names

---

## Phase 5: Attendance Entry

**Objective**: Enter attendance data as Schooling Manager

Reference: `sample-data/attendance-data.md`

### Step 5.1: Login as Manager

1. Logout from admin account
2. Login as `manager@bit.com` / `manager123`
3. You should see the Schooling Manager dashboard

### Step 5.2: Enter Attendance for Solar Thermal Energy

1. Navigate to **Manager → Attendance Management**
2. Select:
   - Field: `Electrical Engineering & Renewable Energies`
   - Semester: `S1`
   - TU: `Renewable Energy IV`
   - TUE: `Solar Thermal Energy`
3. Click **Load Students**

4. Enter attendance for each student (reference attendance-data.md):
   - **Total Sessions**: 20 (for all students)
   - **Attended Sessions** (per student):
     - BIT2023001 (Jean): 18
     - BIT2023002 (Marie): 20
     - BIT2023003 (Paul): 14
     - BIT2023004 (Alice): 19
     - BIT2023005 (David): 17
     - BIT2023006 (Sophie): 20
     - BIT2023007 (Michel): 15
     - BIT2023008 (Emma): 19
     - BIT2023009 (François): 16
     - BIT2023010 (Fatima): 18

5. Verify that **Attendance %** and **Presence Grade** calculate automatically
6. Click **Save All**

### Step 5.3: Enter Attendance for OOP Course

1. Select:
   - Field: `Computer Science & Software Engineering`
   - Semester: `S1`
   - TU: `Advanced Programming`
   - TUE: `Object-Oriented Programming`
2. Click **Load Students**

3. Enter attendance (reference attendance-data.md):
   - **Total Sessions**: 24 (for all students)
   - Enter attended sessions for each CS student

4. Click **Save All**

### Expected Results
✅ Attendance saved successfully for both courses  
✅ Presence grades calculate correctly (between 0-20)  
✅ Attendance percentages are correct  
✅ Can view and edit saved attendance  
✅ Manager cannot see grades or transcripts

---

## Phase 6: Grade Entry

**Objective**: Enter grades as Teachers

### Step 6.1: Login as Teacher 1 (EE)

1. Logout from manager account
2. Login as `teacher1@bit.com` / `teacher123`
3. You should see the Teacher dashboard
4. Verify you can see assigned courses (Solar Thermal Energy, Wind Energy Systems)

### Step 6.2: Enter Grades Manually

1. Navigate to **Teacher → Grade Submission**
2. Select TUE: `Solar Thermal Energy`
3. Click **Load Students**

4. Verify the table shows:
   - Student information
   - **Presence Grade** (read-only, from attendance)
   - **Participation Grade** (editable, default 10)
   - Evaluation columns: DS1, DS2, DM, Final Exam

5. Enter grades for one student manually (e.g., Jean Ouedraogo):
   - Participation: 12
   - DS 1: 14
   - DS 2: 16
   - DM: 15
   - Final Exam: 17

6. Click **Save** for that row
7. Verify **Final Grade** calculates automatically

### Step 6.3: Import Grades from Excel

1. Still on Solar Thermal Energy grade entry page
2. Click **Import Grades**
3. Click **Download Template** (save for reference)
4. Click **Choose File**
5. Select `testing/sample-data/grades-import-template-solar-thermal.csv`
6. Click **Upload**
7. Review import results

### Expected Results
✅ Manual grade entry works  
✅ Final grade calculates correctly  
✅ Excel import successful  
✅ All 10 EE students have grades  
✅ Presence grades are visible but not editable  
✅ Participation defaults to values from CSV or 10

### Step 6.4: Login as Teacher 2 (CS) and Import Grades

1. Logout from Teacher 1
2. Login as `teacher2@bit.com` / `teacher123`
3. Navigate to **Teacher → Grade Submission**
4. Select TUE: `Object-Oriented Programming`
5. Click **Load Students**
6. Click **Import Grades**
7. Select `testing/sample-data/grades-import-template-programming.csv`
8. Click **Upload**

### Expected Results
✅ CS students grades imported successfully  
✅ All 10 CS students have grades  
✅ Final grades calculated correctly

---

## Phase 7: Transcript Generation

**Objective**: Calculate results and generate transcripts as Admin

### Step 7.1: Login as Admin

1. Logout from teacher account
2. Login as `admin@bit.com` / `admin123`

### Step 7.2: Calculate Results

1. Navigate to **Admin → Results**
2. Click **Calculate Semester Results**
3. Select:
   - Field: `Electrical Engineering & Renewable Energies`
   - Semester: `S1`
4. Click **Calculate**
5. Wait for calculation to complete

6. Repeat for CS:
   - Field: `Computer Science & Software Engineering`
   - Semester: `S1`
   - Click **Calculate**

### Expected Results
✅ Calculation completes without errors  
✅ Success message displayed  
✅ Semester averages calculated  
✅ TU validations determined  
✅ Credits awarded appropriately

### Step 7.3: View a Transcript

1. Navigate to **Admin → Transcript Management**
2. Search for student "Jean Ouedraogo" (BIT2023001)
3. Click **View Transcript**
4. Review the transcript data:
   - Student information correct
   - Semester results displayed
   - TU and TUE grades shown
   - Averages calculated
   - Validation statuses (V/NV/V-C)
   - Credits earned

### Step 7.4: Generate PDF Transcript

1. On the transcript view page, click **Generate PDF**
2. Wait for PDF generation
3. PDF should download automatically
4. Open the PDF and verify:
   - Header with BIT logo and information
   - Student details correct
   - Semester results table
   - TUs with individual TUEs
   - Grades, averages, validation statuses
   - Footer with validation rules

### Expected Results
✅ Transcript data displays correctly  
✅ PDF generates without errors  
✅ PDF is formatted properly  
✅ All grades and calculations are accurate  
✅ PDF includes all required sections

### Step 7.5: Test Bulk PDF Generation

1. Navigate to **Admin → Transcript Management**
2. Click **Bulk Generate**
3. Filter by Field: `Electrical Engineering & Renewable Energies`
4. Select all EE students (or use **Select All**)
5. Click **Generate PDFs**
6. Monitor progress
7. Once complete, click **Download ZIP**
8. Extract ZIP and verify 10 PDFs are present

### Expected Results
✅ Bulk generation completes  
✅ ZIP file downloads  
✅ ZIP contains 10 PDFs  
✅ Each PDF is correctly named  
✅ All PDFs open and display correctly

---

## Testing Checklist

Use this checklist to track your testing progress:

### Authentication
- [ ] Admin login successful
- [ ] Teacher login successful
- [ ] Schooling Manager login successful
- [ ] Logout works for all roles
- [ ] Protected routes redirect to login when not authenticated
- [ ] Password change functionality works

### User Management (Admin)
- [ ] Create new user (all roles)
- [ ] View all users
- [ ] Edit user information
- [ ] Deactivate user
- [ ] User list filters work
- [ ] Role-based access control enforced

### Academic Structure (Admin)
- [ ] Create Field
- [ ] Create Promotion
- [ ] Create Semester
- [ ] Create TU
- [ ] Create TUE with evaluation structure
- [ ] Assign teacher to TUE
- [ ] Edit academic structure elements
- [ ] Delete academic structure elements
- [ ] Evaluation structure validation (must total 100%)

### Student Management (Admin/Manager)
- [ ] Add student manually
- [ ] Import students from Excel
- [ ] Download student import template
- [ ] View student list
- [ ] Search students
- [ ] Filter students (by field, promotion, academic year)
- [ ] Edit student information
- [ ] Delete student
- [ ] Excel import error handling

### Attendance (Schooling Manager)
- [ ] Select course hierarchy (Field → Semester → TU → TUE)
- [ ] Load students for selected TUE
- [ ] Enter total sessions
- [ ] Enter attended sessions
- [ ] Attendance % auto-calculates
- [ ] Presence grade auto-calculates
- [ ] Save individual attendance
- [ ] Save all attendance
- [ ] View existing attendance
- [ ] Edit attendance
- [ ] Bulk entry (Apply to All for total sessions)

### Grade Entry (Teacher)
- [ ] View assigned courses
- [ ] Select TUE for grade entry
- [ ] Load students
- [ ] View presence grades (read-only)
- [ ] Enter participation grades
- [ ] Enter evaluation grades
- [ ] Final grade auto-calculates
- [ ] Save individual grades
- [ ] Save all grades
- [ ] Import grades from Excel
- [ ] Download grade import template
- [ ] Edit existing grades
- [ ] Grade validation (0-20 range)

### Results & Transcripts (Admin)
- [ ] Calculate semester results
- [ ] View student transcript
- [ ] Verify calculations (TUE averages, TU averages, semester averages)
- [ ] Verify validation statuses
- [ ] Verify credits awarded
- [ ] Generate single PDF transcript
- [ ] PDF formatting correct
- [ ] PDF contains all required information
- [ ] Bulk PDF generation
- [ ] Download ZIP of transcripts
- [ ] Extract and verify multiple PDFs

### Dashboard & Navigation
- [ ] Admin dashboard displays correct statistics
- [ ] Teacher dashboard shows assigned courses
- [ ] Manager dashboard shows attendance tasks
- [ ] Navigation menu appropriate for each role
- [ ] Quick actions work
- [ ] Breadcrumbs display correctly

### Data Integrity
- [ ] Relationships maintained (Field → Promotion → Semester → TU → TUE)
- [ ] Student enrollment linked to promotion
- [ ] Grades linked to student and TUE
- [ ] Attendance linked to student and TUE
- [ ] Teacher assignments enforced
- [ ] No duplicate student IDs
- [ ] Academic hierarchy browsable

### Error Handling
- [ ] Invalid login shows error
- [ ] Required fields validated
- [ ] Excel upload errors handled gracefully
- [ ] Network errors handled
- [ ] Validation errors displayed clearly
- [ ] Evaluation structure totaling validation

### Performance
- [ ] Excel import handles 20+ students
- [ ] Grade entry responsive with multiple students
- [ ] PDF generation completes in reasonable time
- [ ] Bulk PDF generation handles 10+ students
- [ ] Search and filter responsive

---

## Troubleshooting

### Common Issues

**Problem**: Excel import fails  
**Solution**: 
- Verify CSV matches template format exactly
- Check date format is YYYY-MM-DD
- Ensure field codes and promotion names exist
- Verify no duplicate student IDs

**Problem**: Evaluation structure won't save  
**Solution**: Ensure total coefficients equal exactly 100%

**Problem**: Teacher can't see assigned courses  
**Solution**: Verify teacher is assigned to TUEs in academic structure (Admin)

**Problem**: Presence grade is 0 or wrong  
**Solution**: Ensure attendance was entered by Schooling Manager before grade calculation

**Problem**: PDF generation fails  
**Solution**: 
- Ensure all grades are entered
- Verify semester results were calculated
- Check browser console for errors

**Problem**: Final grade not calculating  
**Solution**: Ensure all required evaluation grades are entered (missing = 0)

---

## Test Data Summary

### Users
- **Admin**: admin@bit.com / admin123
- **Teacher 1**: teacher1@bit.com / teacher123 (EE courses)
- **Teacher 2**: teacher2@bit.com / teacher123 (CS courses)
- **Teacher 3**: teacher3@bit.com / teacher123 (Optional)
- **Manager**: manager@bit.com / manager123

### Students
- 10 EE students (BIT2023001 - BIT2023010)
- 10 CS students (BIT2023011 - BIT2023020)

### Courses
- **EE**: Solar Thermal Energy, Wind Energy Systems
- **CS**: Object-Oriented Programming, Data Structures & Algorithms

### Sample Data Files
- `students-import-template.csv`
- `grades-import-template-solar-thermal.csv`
- `grades-import-template-programming.csv`
- `test-users.md`
- `academic-structure-data.md`
- `attendance-data.md`

---

## Next Steps

After completing this testing guide:

1. **Expand Academic Structure**: Add more TUEs to reach 30 credits per semester
2. **Test Additional Semesters**: Create S6 and test with different students
3. **Test Edge Cases**: 
   - Student with missing grades
   - Failed TU (average < 10)
   - Validated by compensation
4. **Test Annual Transcripts**: Complete both S5 and S6, generate annual transcripts
5. **Performance Testing**: Import 100+ students, test bulk operations
6. **Security Testing**: Verify role-based access restrictions

---

**Document Version**: 1.0  
**Last Updated**: November 22, 2025  
**Testing Duration**: Approximately 2-3 hours for complete testing
