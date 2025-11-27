# BIT Transcript Management System - Implementation Tasks

This document provides a step-by-step breakdown of all implementation tasks for the BIT TMS project, organized by phases.

---

## 📋 Task Status Legend

- `[ ]` - Not started
## Phase 2: Authentication System

### 2.1 User Model
- [ ] Create `src/models/User.js` Mongoose schema
  - [ ] Define fields: email, password, role, firstName, lastName, isActive
  - [ ] Add email uniqueness and validation
  - [ ] Add role enum validation (admin, teacher, schooling_manager)
  - [ ] Add timestamps (createdAt, updatedAt)
- [ ] Implement password hashing middleware (pre-save hook)
- [ ] Create method to compare passwords
- [ ] Create method to generate JWT tokens

### 2.2 Auth Controllers
- [ ] Create `src/controllers/authController.js`
  - [ ] Implement `register` controller (admin creates users)
  - [ ] Implement `login` controller (email + password)
  - [ ] Implement `logout` controller
  - [ ] Implement `getMe` controller (get current user)
  - [ ] Add input validation for all controllers

### 2.3 Auth Middleware
- [ ] Create `src/middleware/auth.js`
  - [ ] Implement `protect` middleware (verify JWT)
  - [ ] Implement `authorize(...roles)` middleware (role-based access)
  - [ ] Add error handling for expired/invalid tokens

### 2.4 Auth Routes
- [ ] Create `src/routes/authRoutes.js`
  - [ ] `POST /api/auth/login`
  - [ ] `POST /api/auth/logout`
  - [ ] `GET /api/auth/me` (protected)
- [ ] Register auth routes in `server.js`

### 2.5 Testing Auth System
- [ ] Test user registration (via Postman/Insomnia)
- [ ] Test login functionality
- [ ] Test JWT token generation
- [ ] Test protected route access
- [ ] Test role-based authorization

---

## Phase 3: User Management (Admin Only)

### 3.1 User Controllers
- [ ] Create `src/controllers/userController.js`
  - [ ] Implement `getUsers` (list all users with filters)
  - [ ] Implement `createUser` (admin creates users)
  - [ ] Implement `getUser` (get single user by ID)
  - [ ] Implement `updateUser` (update user details)
  - [ ] Implement `deleteUser` (soft delete/deactivate)
  - [ ] Add pagination for user list
  - [ ] Add search/filter functionality

### 3.2 User Routes
- [ ] Create `src/routes/userRoutes.js`
  - [ ] `GET /api/users` (protected, admin only)
  - [ ] `POST /api/users` (protected, admin only)
  - [ ] `GET /api/users/:id` (protected, admin only)
  - [ ] `PUT /api/users/:id` (protected, admin only)
  - [ ] `DELETE /api/users/:id` (protected, admin only)

### 3.3 Testing User Management
- [ ] Test creating users with different roles
- [ ] Test listing users
- [ ] Test updating user information
- [ ] Test user deactivation
- [ ] Verify only admins can access these routes

---

## Phase 4: Student Management

### 4.1 Student Model
- [ ] Create `src/models/Student.js`
  - [ ] Define fields: studentId (matricule), firstName, lastName, dateOfBirth, placeOfBirth
  - [ ] Add references: fieldId, promotionId
  - [ ] Add academicYear, isActive
  - [ ] Add unique constraint on studentId
  - [ ] Add timestamps

### 4.2 Student Controllers
- [ ] Create `src/controllers/studentController.js`
  - [ ] Implement `getStudents` (list with filters: field, promotion, year)
  - [ ] Implement `createStudent`
  - [ ] Implement `getStudent` (by ID)
  - [ ] Implement `updateStudent`
  - [ ] Implement `deleteStudent`
  - [ ] Implement `importStudents` (Excel upload)
  - [ ] Add pagination and search

### 4.3 Excel Import Service
- [ ] Install `xlsx` or `exceljs` package
- [ ] Create `src/services/excelService.js`
  - [ ] Implement function to parse Excel files
  - [ ] Implement student data validation from Excel
  - [ ] Implement bulk insert logic
  - [ ] Add error reporting for invalid data
- [ ] Configure multer for file uploads

### 4.4 Student Routes
- [ ] Create `src/routes/studentRoutes.js`
  - [ ] `GET /api/students` (protected, admin)
  - [ ] `POST /api/students` (protected, admin)
  - [ ] `POST /api/students/import` (protected, admin, with file upload)
  - [ ] `GET /api/students/:id` (protected, admin)
  - [ ] `PUT /api/students/:id` (protected, admin)
  - [ ] `DELETE /api/students/:id` (protected, admin)

### 4.5 Testing Student Management
- [ ] Test creating individual students
- [ ] Test Excel import with sample data
- [ ] Test filtering students by field/promotion
- [ ] Test search functionality
- [ ] Test update and delete operations

---

## Phase 5: Academic Structure - Fields & Promotions

### 5.1 Field Model
- [ ] Create `src/models/Field.js`
  - [ ] Define fields: name, code, description
  - [ ] Add unique constraint on code
  - [ ] Add timestamps

### 5.2 Field Controllers
- [ ] Create `src/controllers/fieldController.js`
  - [ ] Implement `getFields`
  - [ ] Implement `createField`
  - [ ] Implement `getField`
  - [ ] Implement `updateField`
  - [ ] Implement `deleteField`

### 5.3 Field Routes
- [ ] Create `src/routes/fieldRoutes.js`
  - [ ] `GET /api/fields` (protected, all users can view)
  - [ ] `POST /api/fields` (protected, admin only)
  - [ ] `GET /api/fields/:id` (protected)
  - [ ] `PUT /api/fields/:id` (protected, admin only)
  - [ ] `DELETE /api/fields/:id` (protected, admin only)

### 5.4 Promotion Model
- [ ] Create `src/models/Promotion.js`
  - [ ] Define fields: name, fieldId (ref), academicYear, level
  - [ ] Add level enum validation (L1, L2, L3, M1, M2)
  - [ ] Add timestamps

### 5.5 Promotion Controllers
- [ ] Create `src/controllers/promotionController.js`
  - [ ] Implement `getPromotions` (with field filter)
  - [ ] Implement `createPromotion`
  - [ ] Implement `getPromotion`
  - [ ] Implement `updatePromotion`
  - [ ] Implement `deletePromotion`

### 5.6 Promotion Routes
- [ ] Create `src/routes/promotionRoutes.js`
  - [ ] `GET /api/promotions` (protected)
  - [ ] `POST /api/promotions` (protected, admin only)
  - [ ] `GET /api/promotions/:id` (protected)
  - [ ] `PUT /api/promotions/:id` (protected, admin only)
  - [ ] `DELETE /api/promotions/:id` (protected, admin only)

### 5.7 Testing Fields & Promotions
- [ ] Create sample fields (EE, CS, ME)
- [ ] Create sample promotions for each field
- [ ] Test CRUD operations
- [ ] Test field-promotion relationships

---

## Phase 6: Academic Structure - Semesters, TUs, TUEs

### 6.1 Semester Model
- [ ] Create `src/models/Semester.js`
  - [ ] Define fields: name, code, fieldId, level, semesterNumber, totalCredits
  - [ ] Add timestamps

### 6.2 Semester Controllers & Routes
- [ ] Create `src/controllers/semesterController.js`
  - [ ] Implement CRUD operations
  - [ ] Implement `getSemesterWithTUs` (populate TUs)
- [ ] Create `src/routes/semesterRoutes.js`
  - [ ] Standard CRUD endpoints (admin only for CUD)

### 6.3 Teaching Unit (TU) Model
- [ ] Create `src/models/TU.js`
  - [ ] Define fields: name, code, semesterId (ref), credits
  - [ ] Add unique constraint on code
  - [ ] Add timestamps

### 6.4 TU Controllers & Routes
- [ ] Create `src/controllers/tuController.js`
  - [ ] Implement CRUD operations
  - [ ] Implement `getTUWithTUEs` (populate TUEs)
- [ ] Create `src/routes/tuRoutes.js`
  - [ ] Standard CRUD endpoints

### 6.5 Teaching Unit Element (TUE) Model
- [ ] Create `src/models/TUE.js`
  - [ ] Define fields: name, code, tuId (ref), credits, teacherId (ref)
  - [ ] Add evaluationStructure array schema
  - [ ] Add volumeHours
  - [ ] Add validation for evaluation coefficients (sum = 100)
  - [ ] Add timestamps

### 6.6 TUE Controllers & Routes
- [ ] Create `src/controllers/tueController.js`
  - [ ] Implement CRUD operations
  - [ ] Implement teacher assignment logic
  - [ ] Implement evaluation structure configuration
- [ ] Create `src/routes/tueRoutes.js`
  - [ ] Standard CRUD endpoints
  - [ ] `GET /api/tues/teacher/:teacherId` (get TUEs for a teacher)

### 6.7 Testing Academic Structure
- [ ] Create complete academic structure for sample semester (e.g., L3S5 EE)
- [ ] Test semester → TU → TUE hierarchy
- [ ] Test teacher assignment to TUEs
- [ ] Test evaluation structure configuration
- [ ] Verify referential integrity

---

## Phase 7: Attendance System

### 7.1 Attendance Model
- [ ] Create `src/models/Attendance.js`
  - [ ] Define fields: studentId, tueId, totalSessions, attendedSessions
  - [ ] Add calculated fields: attendancePercentage, attendanceGrade
  - [ ] Add enteredBy (ref to User)
  - [ ] Add timestamps

### 7.2 Attendance Controllers
- [ ] Create `src/controllers/attendanceController.js`
  - [ ] Implement `getAttendance` (list with filters)
  - [ ] Implement `createAttendance` (schooling manager)
  - [ ] Implement `updateAttendance`
  - [ ] Implement `getStudentAttendance` (by student ID)
  - [ ] Add auto-calculation of percentage and grade

### 7.3 Attendance Routes
- [ ] Create `src/routes/attendanceRoutes.js`
  - [ ] `GET /api/attendance` (protected, admin/manager)
  - [ ] `POST /api/attendance` (protected, manager)
  - [ ] `PUT /api/attendance/:id` (protected, manager)
  - [ ] `GET /api/attendance/student/:studentId` (protected)

### 7.4 Testing Attendance
- [ ] Test attendance recording by schooling manager
- [ ] Verify automatic calculation of attendance percentage
- [ ] Verify automatic calculation of attendance grade (0-20)
- [ ] Test retrieval by student

---

## Phase 8: Grade Management System

### 8.1 Grade Model
- [ ] Create `src/models/Grade.js`
  - [ ] Define fields: studentId, tueId
  - [ ] Add presenceGrade, participationGrade (default: 10)
  - [ ] Add evaluationGrades array (matching TUE evaluation structure)
  - [ ] Add calculated fields: evaluationsAverage, finalGrade
  - [ ] Add enteredBy, lastModifiedBy (refs)
  - [ ] Add timestamps

### 8.2 Grade Controllers
- [ ] Create `src/controllers/gradeController.js`
  - [ ] Implement `getMyTUEs` (teacher gets assigned TUEs)
  - [ ] Implement `getGradesForTUE` (all students in a TUE)
  - [ ] Implement `submitGrade` (create or update grade)
  - [ ] Implement `updateGrade` (admin only for modifications)
  - [ ] Implement `importGrades` (Excel bulk upload)
  - [ ] Add validation: only assigned teacher can enter grades

### 8.3 Grade Entry Service
- [ ] Create `src/services/gradeService.js`
  - [ ] Implement grade validation logic
  - [ ] Implement calculation of evaluations average
  - [ ] Implement calculation of final TUE grade
  - [ ] Add hooks to trigger calculations on save

### 8.4 Excel Grade Import
- [ ] Extend `src/services/excelService.js`
  - [ ] Implement grade import parser
  - [ ] Validate student IDs and grade values
  - [ ] Bulk insert/update grades
  - [ ] Generate import report (success/errors)

### 8.5 Grade Routes
- [ ] Create `src/routes/gradeRoutes.js`
  - [ ] `GET /api/grades/my-tues` (protected, teacher)
  - [ ] `GET /api/grades/tue/:tueId` (protected, teacher/admin)
  - [ ] `POST /api/grades` (protected, teacher)
  - [ ] `POST /api/grades/import` (protected, teacher)
  - [ ] `PUT /api/grades/:id` (protected, admin only)

### 8.6 Testing Grade System
- [ ] Test teacher viewing assigned TUEs
- [ ] Test grade entry for students
- [ ] Test grade update by admin
- [ ] Test Excel grade import
- [ ] Verify teachers can only access their TUEs
- [ ] Verify automatic final grade calculation

---

## Phase 9: Calculation Engine

### 9.1 Calculation Service Foundation
- [ ] Create `src/services/calculationService.js`
- [ ] Create helper functions for rounding to 2 decimals
- [ ] Create validation functions for grade ranges

### 9.2 TUE Grade Calculation
- [ ] Implement `calculateTUEFinalGrade(gradeDoc)`
  - [ ] Formula: (presence × 5%) + (participation × 5%) + (evaluations × 90%)
  - [ ] Handle missing values (defaults)
  - [ ] Return grade rounded to 2 decimals

### 9.3 TU Average Calculation
- [ ] Implement `calculateTUAverage(studentId, tuId)`
  - [ ] Fetch all TUE grades for student in this TU
  - [ ] Calculate weighted average based on TUE credits
  - [ ] Formula: Σ(TUE Grade × TUE Credits) / Σ(TUE Credits)
  - [ ] Return average rounded to 2 decimals

### 9.4 TU Validation Logic
- [ ] Implement `validateTU(tuAverage, semesterAverage)`
  - [ ] If tuAverage ≥ 8.00: return "V"
  - [ ] If tuAverage < 6.00: return "NV"
  - [ ] If 6.00 ≤ tuAverage < 8.00 AND semesterAverage ≥ 10.00: return "V-C"
  - [ ] Else: return "NV"

### 9.5 Semester Average Calculation
- [ ] Implement `calculateSemesterAverage(studentId, semesterId)`
  - [ ] Calculate all TU averages for student in semester
  - [ ] Calculate weighted average based on TU credits
  - [ ] Formula: Σ(TU Average × TU Credits) / Σ(TU Credits)
  - [ ] Return average rounded to 2 decimals

### 9.6 Semester Validation Logic
- [ ] Implement `validateSemester(semesterAverage, tuValidations)`
  - [ ] Check if semesterAverage ≥ 10.00
  - [ ] Check if all TUs are validated (V or V-C)
  - [ ] Return "VALIDATED" if both conditions met
  - [ ] Else return "NOT_VALIDATED"

### 9.7 Mention Calculation
- [ ] Implement `calculateMention(average)`
  - [ ] Apply mention scale logic
  - [ ] Return mention (A++, A+, A, B+, B, C+, C, D+, D, F)

### 9.8 Credits Calculation
- [ ] Implement `calculateCreditsEarned(tuValidations)`
  - [ ] Sum credits for all validated TUs (V or V-C)
  - [ ] Return total credits earned

### 9.9 Testing Calculation Engine
- [ ] Unit test TUE grade calculation with examples from documentation
- [ ] Unit test TU average calculation
- [ ] Unit test TU validation logic (all scenarios: V, NV, V-C)
- [ ] Unit test semester average calculation
- [ ] Unit test semester validation
- [ ] Unit test mention calculation
- [ ] Verify all calculations match examples in `_notation_system_BIT.md`

---

## Phase 10: Results Aggregation Models

### 10.1 TU Results Model
- [ ] Create `src/models/TUResult.js`
  - [ ] Define fields: studentId, tuId, semesterId
  - [ ] Add tueGrades array (embedded)
  - [ ] Add calculated fields: tuAverage, creditsAttempted, creditsEarned, validationStatus
  - [ ] Add timestamps

### 10.2 Semester Results Model
- [ ] Create `src/models/SemesterResult.js`
  - [ ] Define fields: studentId, semesterId, promotionId, academicYear
  - [ ] Add tuResults array (embedded)
  - [ ] Add calculated fields: semesterAverage, totalCreditsAttempted, totalCreditsEarned, semesterValidation, mention
  - [ ] Add timestamps

### 10.3 Result Generation Service
- [ ] Create `src/services/resultService.js`
  - [ ] Implement `generateTUResult(studentId, tuId)`
  - [ ] Implement `generateSemesterResult(studentId, semesterId)`
  - [ ] Implement `generateAllResults(studentId)` (all semesters)

### 10.4 Result Controllers & Routes
- [ ] Create `src/controllers/resultController.js`
  - [ ] Implement `getStudentResults` (admin only)
  - [ ] Implement `generateResults` (admin trigger)
  - [ ] Implement `recalculateAll` (admin only)
- [ ] Create `src/routes/resultRoutes.js`
  - [ ] `GET /api/results/student/:studentId`
  - [ ] `POST /api/results/generate/:studentId`
  - [ ] `POST /api/results/recalculate-all`

### 10.5 Testing Results Aggregation
- [ ] Create sample data for complete student (all grades)
- [ ] Test TU result generation
- [ ] Test semester result generation
- [ ] Verify all calculations are correct
- [ ] Test recalculation trigger

---

## Phase 11: Transcript PDF Generation

### 11.1 PDF Generation Setup
- [ ] Install PDF library: `npm install pdfkit` or `puppeteer`
- [ ] Create `src/services/pdfService.js`
- [ ] Set up PDF template structure

### 11.2 PDF Template Design
- [ ] Create header section (logo, institution name, motto)
- [ ] Create student information section
- [ ] Create semester results table template
- [ ] Create TU/TUE grade table structure
- [ ] Create footer section (validation rules, signature area)
- [ ] Add mention scale table
- [ ] Style PDF to match BIT official template

### 11.3 PDF Generation Functions
- [ ] Implement `generateTranscriptPDF(studentId)`
  - [ ] Fetch all student data
  - [ ] Fetch all semester results
  - [ ] Populate PDF template with data
  - [ ] Generate PDF buffer
  - [ ] Return PDF for download or save to server
- [ ] Implement `generateBulkTranscriptPDFs(studentIds[])`
  - [ ] Loop through student IDs
  - [ ] Generate individual PDFs
  - [ ] Option: zip all PDFs together
  - [ ] Return zip file or individual files

### 11.4 Transcript Controllers
- [ ] Create `src/controllers/transcriptController.js`
  - [ ] Implement `getTranscriptData` (JSON view, admin only)
  - [ ] Implement `generateSinglePDF` (admin only)
  - [ ] Implement `generateBulkPDFs` (admin only)
  - [ ] Implement `downloadTranscriptPDF` (streaming)

### 11.5 Transcript Routes
- [ ] Create `src/routes/transcriptRoutes.js`
  - [ ] `GET /api/transcripts/student/:studentId` (admin only)
  - [ ] `GET /api/transcripts/student/:studentId/pdf` (admin only, download)
  - [ ] `POST /api/transcripts/bulk-generate` (admin only, body: studentIds[])
  - [ ] `GET /api/transcripts/semester/:semesterId/student/:studentId/pdf`

### 11.6 Testing PDF Generation
- [ ] Test single student transcript generation
- [ ] Verify PDF matches official template
- [ ] Test bulk PDF generation (10 students)
- [ ] Test download functionality
- [ ] Verify all data is accurate in PDF
- [ ] Test with missing data scenarios

---

## Phase 12: Backend Error Handling & Logging

### 12.1 Error Handling Middleware
- [ ] Create `src/middleware/errorHandler.js`
  - [ ] Implement global error handler
  - [ ] Handle different error types (validation, authentication, database)
  - [ ] Format error responses consistently
  - [ ] Log errors appropriately

### 12.2 Logging Setup
- [ ] Install Winston: `npm install winston`
- [ ] Create `src/config/logger.js`
  - [ ] Configure console logging (development)
  - [ ] Configure file logging (production)
  - [ ] Set up error log file
  - [ ] Set up combined log file

### 12.3 Validation Utilities
- [ ] Create `src/utils/validation.js`
  - [ ] Email validation
  - [ ] Password strength validation
  - [ ] Grade range validation (0-20)
  - [ ] Credit validation
  - [ ] Student ID format validation

### 12.4 Testing Error Handling
- [ ] Test validation errors
- [ ] Test authentication errors
- [ ] Test authorization errors
- [ ] Test database errors
- [ ] Verify error logging

---

## Phase 13: API Documentation

### 13.1 Swagger/OpenAPI Setup
- [ ] Install Swagger: `npm install swagger-jsdoc swagger-ui-express`
- [ ] Create `src/config/swagger.js`
- [ ] Configure Swagger UI endpoint (`/api-docs`)

### 13.2 API Documentation
- [ ] Document all authentication endpoints
- [ ] Document user management endpoints
- [ ] Document student management endpoints
- [ ] Document academic structure endpoints
- [ ] Document grade endpoints
- [ ] Document attendance endpoints
- [ ] Document transcript endpoints
- [ ] Add request/response examples
- [ ] Add authentication requirements

### 13.3 Postman Collection
- [ ] Create Postman collection for all endpoints
- [ ] Add example requests
- [ ] Add environment variables
- [ ] Export collection JSON

---

## Phase 14: Backend Testing & Optimization

### 14.1 Database Indexing
- [ ] Add index on User.email
- [ ] Add index on Student.studentId
- [ ] Add index on Student.fieldId, Student.promotionId
- [ ] Add index on TUE.teacherId
- [ ] Add index on Grade.studentId, Grade.tueId
- [ ] Add compound indexes for common queries

### 14.2 API Optimization
- [ ] Implement pagination for all list endpoints
- [ ] Add query optimization (select, populate limits)
- [ ] Implement caching for static data (fields, semesters)
- [ ] Add request rate limiting

### 14.3 Integration Testing
- [ ] Test complete grade entry workflow
- [ ] Test complete transcript generation workflow
- [ ] Test user management workflow
- [ ] Test student import workflow
- [ ] Test calculation accuracy with real data

---

## Phase 15: Frontend Foundation Setup

### 15.1 Frontend Environment Setup
- [ ] Verify Vite + React + TailwindCSS setup
- [ ] Install additional dependencies:
  - [ ] `react-router-dom` (routing)
  - [ ] `axios` (API calls)
  - [ ] `react-hook-form` (form management)
  - [ ] `react-toastify` or `react-hot-toast` (notifications)
  - [ ] `react-icons` (icon library)
  - [ ] `@headlessui/react` (accessible components)
- [ ] Configure environment variables (`.env`)
  - [ ] `VITE_API_URL=http://localhost:5000/api`

### 15.2 Project Structure Setup
- [ ] Create folder structure (components, pages, context, hooks, services, utils)
- [ ] Set up Tailwind configuration
- [ ] Create global CSS in `src/index.css`
- [ ] Set up routing structure in `App.jsx`

### 15.3 API Service Layer
- [ ] Create `src/services/api.js` (Axios instance with interceptors)
- [ ] Create `src/services/authService.js` (login, logout, getMe)
- [ ] Create `src/services/userService.js`
- [ ] Create `src/services/studentService.js`
- [ ] Create `src/services/academicService.js`
- [ ] Create `src/services/gradeService.js`
- [ ] Create `src/services/attendanceService.js`
- [ ] Create `src/services/transcriptService.js`

### 15.4 Authentication Context
- [ ] Create `src/context/AuthContext.jsx`
  - [ ] Implement AuthProvider
  - [ ] Implement login, logout, register functions
  - [ ] Store user and token in state
  - [ ] Persist auth state to localStorage
  - [ ] Create useAuth hook
- [ ] Create `src/components/layout/ProtectedRoute.jsx` (route guard)

### 15.5 Testing Frontend Foundation
- [ ] Test Vite dev server runs
- [ ] Test API connection to backend
- [ ] Test AuthContext functionality
- [ ] Test ProtectedRoute component

---

## Phase 16: Frontend Common Components

### 16.1 Layout Components
- [ ] Create `src/components/layout/Header.jsx`
  - [ ] Logo, navigation, user menu
  - [ ] Role-based navigation items
- [ ] Create `src/components/layout/Sidebar.jsx`
  - [ ] Collapsible sidebar
  - [ ] Role-based menu items
- [ ] Create `src/components/layout/Footer.jsx`
- [ ] Create `src/components/layout/Layout.jsx` (wrapper)

### 16.2 Common UI Components
- [ ] Create `src/components/common/Button.jsx`
  - [ ] Primary, secondary, danger variants
  - [ ] Loading state
- [ ] Create `src/components/common/Input.jsx`
  - [ ] Text, email, password, number types
  - [ ] Error state display
- [ ] Create `src/components/common/Select.jsx`
- [ ] Create `src/components/common/Table.jsx`
  - [ ] Sortable headers
  - [ ] Pagination
  - [ ] Row actions
- [ ] Create `src/components/common/Modal.jsx`
- [ ] Create `src/components/common/LoadingSpinner.jsx`
- [ ] Create `src/components/common/Alert.jsx`
- [ ] Create `src/components/common/Card.jsx`

### 16.3 Utility Functions
- [ ] Create `src/utils/validation.js` (form validators)
- [ ] Create `src/utils/formatters.js` (date, number formatting)
- [ ] Create `src/utils/constants.js` (role names, mention scale, etc.)
- [ ] Create `src/utils/calculations.js` (client-side calculation helpers)

### 16.4 Custom Hooks
- [ ] Create `src/hooks/useAuth.js`
- [ ] Create `src/hooks/useFetch.js` (data fetching with loading/error states)
- [ ] Create `src/hooks/useForm.js` (form handling)

---

## Phase 17: Authentication & Login Pages

### 17.1 Login Page
- [ ] Create `src/pages/Login.jsx`
  - [ ] Email and password inputs
  - [ ] Form validation
  - [ ] Submit handler
  - [ ] Error display
  - [ ] Loading state
- [ ] Create `src/components/auth/LoginForm.jsx`
- [ ] Style login page with TailwindCSS (premium design)

### 17.2 Authentication Flow
- [ ] Implement login redirect after successful auth
- [ ] Implement logout functionality
- [ ] Implement auto-redirect if already authenticated
- [ ] Implement token refresh logic
- [ ] Handle token expiration

### 17.3 Testing Authentication
- [ ] Test login with valid credentials
- [ ] Test login with invalid credentials
- [ ] Test protected route access
- [ ] Test logout functionality
- [ ] Test token persistence

---

## Phase 18: Admin Dashboard & User Management

### 18.1 Admin Dashboard
- [ ] Create `src/pages/admin/Dashboard.jsx`
  - [ ] Summary cards (total users, students, fields, etc.)
  - [ ] Quick actions
  - [ ] Recent activity (optional for MVP)

### 18.2 User Management Pages
- [ ] Create `src/pages/admin/UserManagement.jsx`
  - [ ] User list table
  - [ ] Search and filter
  - [ ] Add user button
- [ ] Create `src/components/users/UserList.jsx`
- [ ] Create `src/components/users/UserForm.jsx` (modal)
  - [ ] Create/edit user form
  - [ ] Role selection
  - [ ] Validation
- [ ] Create `src/components/users/UserCard.jsx`

### 18.3 User Management Functionality
- [ ] Implement user creation
- [ ] Implement user editing
- [ ] Implement user deactivation
- [ ] Implement search/filter
- [ ] Implement pagination

### 18.4 Testing User Management
- [ ] Test creating users with different roles
- [ ] Test editing user information
- [ ] Test user deactivation
- [ ] Test search and filter
- [ ] Verify only admins can access

---

## Phase 19: Student Management Pages

### 19.1 Student List Page
- [ ] Create `src/pages/admin/StudentManagement.jsx`
  - [ ] Student list table
  - [ ] Search bar (by name, student ID)
  - [ ] Filters (field, promotion, academic year)
  - [ ] Add student button
  - [ ] Import students button
- [ ] Create `src/components/students/StudentList.jsx`
- [ ] Create `src/components/students/StudentCard.jsx`

### 19.2 Student Form
- [ ] Create `src/components/students/StudentForm.jsx` (modal)
  - [ ] All student fields
  - [ ] Field selection dropdown
  - [ ] Promotion selection dropdown
  - [ ] Date picker for date of birth
  - [ ] Validation

### 19.3 Student Import
- [ ] Create `src/components/students/StudentImport.jsx`
  - [ ] File upload (drag-and-drop)
  - [ ] File selection from storage
  - [ ] Upload progress
  - [ ] Import results display (success/errors)
- [ ] Create Excel template download option

### 19.4 Student Management Functionality
- [ ] Implement student creation
- [ ] Implement student editing
- [ ] Implement student deletion
- [ ] Implement Excel import
- [ ] Implement search and filters
- [ ] Implement pagination

### 19.5 Testing Student Management
- [ ] Test adding students manually
- [ ] Test Excel import with sample file
- [ ] Test search by name and ID
- [ ] Test filtering by field/promotion
- [ ] Test editing and deleting students

---

## Phase 20: Academic Structure Management Pages

### 20.1 Academic Structure Page Layout
- [ ] Create `src/pages/admin/AcademicStructure.jsx`
  - [ ] Tabs: Fields, Promotions, Semesters, TUs, TUEs
  - [ ] Or separate pages for each

### 20.2 Fields Management
- [ ] Create `src/components/academic/FieldManagement.jsx`
  - [ ] Field list
  - [ ] Add/edit/delete field
  - [ ] Modal form

### 20.3 Promotions Management
- [ ] Create `src/components/academic/PromotionManagement.jsx`
  - [ ] Promotion list with field info
  - [ ] Add/edit/delete promotion
  - [ ] Filter by field

### 20.4 Semesters Management
- [ ] Create `src/components/academic/SemesterManagement.jsx`
  - [ ] Semester list grouped by field/level
  - [ ] Add/edit/delete semester
  - [ ] View TUs in semester

### 20.5 TUs Management
- [ ] Create `src/components/academic/TUManagement.jsx`
  - [ ] TU list with semester info
  - [ ] Add/edit/delete TU
  - [ ] View TUEs in TU

### 20.6 TUEs Management
- [ ] Create `src/components/academic/TUEManagement.jsx`
  - [ ] TUE list with TU and teacher info
  - [ ] Add/edit/delete TUE
  - [ ] Assign teacher
  - [ ] Configure evaluation structure
- [ ] Create evaluation structure form component
  - [ ] Add/remove evaluations
  - [ ] Set coefficients
  - [ ] Validate sum = 100%

### 20.7 Testing Academic Structure
- [ ] Test creating full hierarchy (Field → Promotion → Semester → TU → TUE)
- [ ] Test editing each level
- [ ] Test deleting with referential integrity
- [ ] Test teacher assignment
- [ ] Test evaluation structure configuration

---

## Phase 21: Teacher Interface - Grade Entry

### 21.1 Teacher Dashboard
- [ ] Create `src/pages/teacher/Dashboard.jsx`
  - [ ] List of assigned TUEs
  - [ ] Quick grade entry links

### 21.2 My Courses Page
- [ ] Create `src/pages/teacher/MyCourses.jsx`
  - [ ] Display all assigned TUEs
  - [ ] Show number of students per TUE
  - [ ] Link to grade entry for each TUE
- [ ] Create `src/components/grades/MyAssignedCourses.jsx`

### 21.3 Grade Entry Page
- [ ] Create `src/pages/teacher/GradeSubmission.jsx`
  - [ ] Select TUE
  - [ ] Display student list for selected TUE
  - [ ] Grade entry table
- [ ] Create `src/components/grades/GradeEntry.jsx`
  - [ ] Participation grade input
  - [ ] Evaluation grades inputs (dynamic based on TUE structure)
  - [ ] Auto-save functionality
  - [ ] Validation (0-20 range)

### 21.4 Grade Table Component
- [ ] Create `src/components/grades/GradeTable.jsx`
  - [ ] Student name, ID
  - [ ] Presence grade (read-only, from attendance)
  - [ ] Participation grade input
  - [ ] Evaluation grade inputs (columns)
  - [ ] Calculated final grade (display)
  - [ ] Save button per row or bulk save

### 21.5 Grade Import for Teachers
- [ ] Create `src/components/grades/GradeImport.jsx`
  - [ ] Excel file upload
  - [ ] Template download
  - [ ] Import results

### 21.6 Testing Teacher Interface
- [ ] Test teacher viewing assigned TUEs
- [ ] Test grade entry for students
- [ ] Test validation
- [ ] Test auto-calculation display
- [ ] Test Excel import
- [ ] Verify teachers can only access their TUEs

---

## Phase 22: Schooling Manager Interface - Attendance

### 22.1 Manager Dashboard
- [ ] Create `src/pages/manager/Dashboard.jsx`
  - [ ] Overview of attendance entry tasks

### 22.2 Attendance Management Page
- [ ] Create `src/pages/manager/AttendanceManagement.jsx`
  - [ ] Select TUE
  - [ ] Display student list
  - [ ] Attendance entry form
- [ ] Create `src/components/attendance/AttendanceEntry.jsx`
  - [ ] Total sessions input
  - [ ] Attended sessions input
  - [ ] Auto-calculated percentage and grade display

### 22.3 Attendance Table
- [ ] Create `src/components/attendance/AttendanceTable.jsx`
  - [ ] Student list
  - [ ] Input fields for attendance
  - [ ] Calculated fields display
  - [ ] Save functionality

### 22.4 Testing Manager Interface
- [ ] Test attendance entry
- [ ] Test auto-calculation of percentage and grade
- [ ] Verify managers cannot view transcripts
- [ ] Verify managers cannot enter grades

---

## Phase 23: Admin Transcript Management

### 23.1 Transcript Management Page
- [ ] Create `src/pages/admin/TranscriptManagement.jsx`
  - [ ] Student search/selection
  - [ ] View transcript button
  - [ ] Generate PDF button
  - [ ] Bulk generation section

### 23.2 Transcript Viewer Component
- [ ] Create `src/components/transcripts/TranscriptViewer.jsx`
  - [ ] Display student info
  - [ ] Display all semester results
  - [ ] Display TU and TUE grades
  - [ ] Display validation statuses
  - [ ] Display mentions
  - [ ] Display credits earned

### 23.3 PDF Generation Components
- [ ] Create `src/components/transcripts/TranscriptPDFGenerator.jsx`
  - [ ] Single student PDF generation
  - [ ] Download button
  - [ ] Loading state
- [ ] Create `src/components/transcripts/BulkTranscriptGenerator.jsx`
  - [ ] Student selection (checkboxes or multi-select)
  - [ ] Generate all button
  - [ ] Progress indicator
  - [ ] Download zip button

### 23.4 Transcript Functionality
- [ ] Implement transcript data fetching
- [ ] Implement single PDF generation and download
- [ ] Implement bulk PDF generation
- [ ] Handle loading and error states
- [ ] Display success/error messages

### 23.5 Testing Transcript Management
- [ ] Test viewing transcript for a student
- [ ] Test generating single PDF
- [ ] Test downloading PDF
- [ ] Test bulk PDF generation (10 students)
- [ ] Verify only admins can access

---

## Phase 24: Responsive Design & Mobile Optimization

### 24.1 Mobile-First Design Review
- [ ] Review all pages on mobile viewport
- [ ] Ensure buttons and inputs are touch-friendly
- [ ] Implement responsive tables (horizontal scroll or card view)
- [ ] Test navigation on mobile

### 24.2 Responsive Components
- [ ] Make Header responsive (hamburger menu)
- [ ] Make Sidebar collapsible on mobile
- [ ] Make tables responsive (stack or scroll)
- [ ] Make forms responsive (single column on mobile)
- [ ] Make modals responsive

### 24.3 Mobile Testing
- [ ] Test all pages on mobile (375px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1280px+ width)
- [ ] Test touch interactions
- [ ] Test keyboard navigation

---

## Phase 25: UI/UX Enhancements

### 25.1 Design Polish
- [ ] Implement consistent color scheme
- [ ] Add hover effects on buttons and links
- [ ] Add transitions and animations (subtle)
- [ ] Improve spacing and alignment
- [ ] Add loading skeletons for data fetching
- [ ] Add empty states for lists

### 25.2 User Feedback
- [ ] Implement toast notifications (success/error)
- [ ] Add confirmation dialogs for delete operations
- [ ] Add form submission feedback
- [ ] Add progress indicators for long operations

### 25.3 Accessibility
- [ ] Ensure proper heading hierarchy
- [ ] Add ARIA labels where needed
- [ ] Ensure keyboard navigation works
- [ ] Test with screen reader (basic testing)
- [ ] Ensure color contrast meets standards

---

## Phase 26: Testing & Bug Fixing

### 26.1 End-to-End Testing
- [ ] Test complete user management workflow
- [ ] Test complete student management workflow
- [ ] Test complete academic structure creation
- [ ] Test complete grade entry workflow (teacher)
- [ ] Test complete attendance entry workflow (manager)
- [ ] Test complete transcript generation workflow (admin)
- [ ] Test role-based access control thoroughly

### 26.2 Cross-Browser Testing
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Edge
- [ ] Test on Safari (if available)

### 26.3 Performance Testing
- [ ] Test with large datasets (100+ students)
- [ ] Test API response times
- [ ] Test PDF generation time
- [ ] Test bulk operations

### 26.4 Bug Fixes
- [ ] Document all found bugs
- [ ] Prioritize bugs (critical, high, medium, low)
- [ ] Fix critical and high priority bugs
- [ ] Regression testing after fixes

---

## Phase 27: Security Hardening

### 27.1 Security Review
- [ ] Review all authentication/authorization logic
- [ ] Review input validation on frontend and backend
- [ ] Review error messages (no sensitive data leakage)
- [ ] Implement HTTPS in production
- [ ] Implement security headers (Helmet.js)
- [ ] Implement CSRF protection (if needed)

### 27.2 Rate Limiting
- [ ] Implement rate limiting on login endpoint
- [ ] Implement rate limiting on sensitive endpoints
- [ ] Configure rate limit settings

### 27.3 Sensitive Data Protection
- [ ] Ensure passwords are never logged
- [ ] Ensure JWT secrets are secure
- [ ] Sanitize all database queries (prevent NoSQL injection)
- [ ] Validate file uploads (Excel import)

---

## Phase 28: Documentation

### 28.1 User Documentation
- [x] Create Admin User Guide (markdown or PDF)
  - [x] How to manage users
  - [x] How to manage students
  - [x] How to set up academic structure
  - [x] How to generate transcripts
- [x] Create Teacher Guide
  - [x] How to view assigned courses
  - [x] How to enter grades
  - [x] How to import grades
- [x] Create Schooling Manager Guide
  - [x] How to enter attendance

### 28.2 Developer Documentation
- [x] Document database schema
- [x] Document API endpoints (Swagger)
- [x] Document calculation logic
- [x] Document deployment process
- [x] Create README.md files for backend and frontend

### 28.3 Code Documentation
- [x] Add JSDoc comments to all major functions
- [x] Add inline comments for complex logic
- [x] Document environment variables

---

## Phase 29: Deployment Preparation

### 29.1 Production Environment Setup
- [ ] Set up production MongoDB database
- [ ] Configure environment variables for production
- [ ] Set up hosting for backend (e.g., Render, Heroku, DigitalOcean)
- [ ] Set up hosting for frontend (e.g., Vercel, Netlify)

### 29.2 Backend Deployment
- [ ] Build backend for production
- [ ] Deploy to hosting service
- [ ] Configure CORS for production frontend URL
- [ ] Test backend endpoints in production

### 29.3 Frontend Deployment
- [ ] Build frontend for production (`npm run build`)
- [ ] Configure API URL for production
- [ ] Deploy to hosting service
- [ ] Test frontend in production

### 29.4 Database Migration
- [ ] Export development data (if needed)
- [ ] Import into production database
- [ ] Create initial admin account
- [ ] Verify data integrity

### 29.5 Post-Deployment Testing
- [ ] Test all critical workflows in production
- [ ] Test PDF generation in production
- [ ] Test performance in production
- [ ] Monitor for errors

---

## Phase 30: User Acceptance & Training

### 30.1 User Acceptance Testing
- [ ] Provide access to stakeholders
- [ ] Gather feedback
- [ ] Document issues and enhancement requests
- [ ] Prioritize feedback

### 30.2 Training Sessions
- [ ] Conduct training for admins
- [ ] Conduct training for teachers
- [ ] Conduct training for schooling managers
- [ ] Provide user guides

### 30.3 Feedback Implementation
- [ ] Implement critical feedback
- [ ] Retest affected areas
- [ ] Deploy updates

---

## Phase 31: Launch & Monitoring

### 31.1 Launch Preparation
- [ ] Final security review
- [ ] Final performance review
- [ ] Backup production database
- [ ] Prepare rollback plan

### 31.2 Launch
- [ ] Announce system availability
- [ ] Monitor system closely for first 48 hours
- [ ] Be ready to address issues quickly

### 31.3 Monitoring Setup
- [ ] Set up error logging and monitoring (e.g., Sentry)
- [ ] Set up uptime monitoring
- [ ] Set up performance monitoring
- [ ] Set up database backup automation

### 31.4 Ongoing Support
- [ ] Establish support channel (email, help desk)
- [ ] Monitor user feedback
- [ ] Plan for regular updates and maintenance
- [ ] Document known issues and workarounds

---

## 🎯 Success Checklist

### Functional Requirements ✅
- [ ] All user roles implemented and working
- [ ] Authentication and authorization working correctly
- [ ] User management (Admin) fully functional
- [ ] Student management with Excel import working
- [ ] Academic structure fully configurable
- [ ] Grade entry (Teachers) working with validation
- [ ] Attendance entry (Schooling Manager) working
- [ ] All calculations accurate and tested
- [ ] Validation logic correct (TU, Semester)
- [ ] Mention calculation correct
- [ ] Transcript viewer working (Admin only)
- [ ] PDF transcript generation working (single + bulk)
- [ ] PDFs match official BIT template

### Non-Functional Requirements ✅
- [ ] API response times < 200ms
- [ ] PDF generation < 3 seconds
- [ ] Responsive UI on mobile and desktop
- [ ] Secure (HTTPS, password hashing, JWT, RBAC)
- [ ] Error handling comprehensive
- [ ] User-friendly interface
- [ ] Documentation complete

### Testing ✅
- [ ] Unit tests for calculations
- [ ] Integration tests for API
- [ ] End-to-end tests for critical workflows
- [ ] Cross-browser testing done
- [ ] Performance testing done
- [ ] Security testing done

### Deployment ✅
- [ ] Backend deployed and running
- [ ] Frontend deployed and running
- [ ] Database in production
- [ ] Monitoring enabled
- [ ] Backups configured

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-22  
**Total Tasks**: 500+  
**Estimated Timeline**: 8-12 weeks (depending on team size and availability)  
**Project**: BIT Transcript Management System (TMS)

**Note**: This task list is comprehensive and should be adjusted based on your team's velocity and priorities. Some tasks can be done in parallel if you have multiple developers.
