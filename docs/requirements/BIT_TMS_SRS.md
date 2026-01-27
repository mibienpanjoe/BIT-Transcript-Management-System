# BIT Transcript Management System (TMS) – Software Requirements Specification

## Introduction

The BIT Transcript Management System (TMS) is a web-based application designed for the Burkina Institute of Technology (BIT) to manage student academic records, course grades, and official transcripts. BIT is a leading engineering university operating under the LMD (Licence-Master-Doctorat) system, structured into programs (fields of study), Teaching Units (TU), and Teaching Unit Elements (TUE or modules) across semesters. The TMS will streamline the process of recording grades and generating official student transcripts (academic report cards) in PDF format. It implements strict role-based access control with three user roles – Administrator (Admin), Teacher, and Schooling Manager – each with specific permissions, ensuring data integrity and confidentiality. The system’s primary goal is to simplify grade management and automate transcript generation while adhering to BIT’s academic regulations (credit requirements, grade validations, etc.).

## Must-Have Functionalities

**Authentication & Access Control:** All users (Admin, Teachers, Schooling Managers) must securely log in. The system will enforce role-based authorization so that each user only accesses functions permitted to their role. This guarantees that sensitive academic data (like transcripts) is only accessible to authorized personnel.

**User Management (Admin Only):** The Admin can manage user accounts for Teachers and Schooling Managers. This includes creating accounts, assigning roles/permissions, and activating or deactivating users. For example, the Admin can add a new teacher user and assign them to teach specific courses (TUEs). Only the Admin has access to user administration interfaces.

**Student Information Management:** The system supports adding and maintaining student records (CRUD operations). The Admin can import students in bulk from an Excel spreadsheet (for initial onboarding or batch updates), automatically assigning each student to the appropriate program (field of study) and cohort year (promotion). The Admin can also view all students, update their profile info (e.g. personal details, program, promotion), or remove students if needed.

**Academic Structure Configuration (Admin Only):** The Admin can set up and modify the academic structure of BIT within the system. This includes managing the list of Fields (degree programs/departments), Teaching Units (TUs) for each program and semester, and the specific Teaching Unit Elements (TUEs) (individual courses/modules). The Admin can assign each TUE to a Teacher (linking instructors to the courses they teach). Additionally, the Admin can configure semesters and promotions so that transcripts are organized by academic term.

**Grade Management:** Teachers and the Admin collaborate in managing student grades:

- **Grade Entry (Teachers):** Each Teacher can view and input grades only for the courses (TUEs) they are assigned to teach. They may enter grades through a web form (or upload, if supported) for students in their class. Teachers cannot see or edit grades for courses they do not teach, ensuring privacy and focus. Once a grade is submitted by a teacher, they cannot modify it arbitrarily (edits may require Admin intervention to maintain data integrity). Teachers have no access to generate or view official transcripts.


- **Grade Oversight (Admin):** The Admin can view and edit all student grades across all courses. This allows correction of any errors and overall supervision of academic records. Admin can override or update a grade if necessary (for example, after a remediation or to fix input mistakes).

- **Attendance Marks (Schooling Manager):** The Schooling Manager can view all students’ grades in each course (read-only access) but cannot modify academic grades. Their primary contribution is recording attendance scores for each student in each module . This role ensures that non-academic components (like attendance) are tracked, but Schooling Managers are not permitted to view or download transcripts.

**Batch Grade Import:** Provide a mechanism for teachers to import grades via Excel for each course, in addition to manual entry. This would be useful for large classes – the instructor could upload a spreadsheet of grades to save time. A drag-and-drop interface for file uploads and permit to select the excel file among the files in his storage or integration with Excel templates would streamline this process.

 **Batch Student Import:** Provide a mechanism for the admin to import students via Excel for each promotion and by field, in addition to manual entry. A drag-and-drop interface for file uploads, and permit to select the excel file among the files in his storage or integration with Excel templates would streamline this process.

**Automated Calculations:** The system will automatically compute aggregate results needed for transcripts. For example, individual TUE grades will roll up into the corresponding TU average, which then contributes to the semester average, and ultimately the annual average. It will also determine pass/fail status of TUs and semesters based on BIT’s grading criteria (e.g. a TU is validated if its average ≥ 12/20, semester if average ≥ 12/20 and all TUs ≥ 12/20). These calculations ensure that whenever teachers input grades, the higher-level results update immediately, maintaining an up-to-date record for transcript generation.

**PDF Transcript Generation (Admin Only):** Generating official student transcripts in PDF format is a core MVP feature. The Admin is the only role authorized to generate, view, and download these transcripts, reflecting the policy that only academic management can issue official grade reports. The system will allow the Admin to produce a transcript for an individual student or generate transcripts in bulk for a cohort (e.g. for an entire class at end of year). Each transcript document will compile the student’s academic performance across all relevant courses and semesters, including earned credits and academic standing. The format of the transcript will follow BIT’s official institutional standards (e.g. including the Director’s signature line, official grading scale, and the student’s cumulative results). Transcripts generated are intended to be final, official documents (in PDF) that can be printed or electronically shared as needed. Within the TMS, no other role (Teacher or Schooling Manager) can access student transcripts, ensuring confidentiality and compliance with the new role rules.

**Mobile-Friendly Design :** Ensure the platform is responsive and works well on mobile devices. This would allow teachers to input grades or view their classes on the go, and enable admins to perform urgent tasks from a smartphone. It (or a responsive web UI via Tailwind CSS) would increase the accessibility of TMS for all users.

## Project Structure (Frontend & Backend)

The BIT TMS is structured as a client–server application, dividing responsibilities between a React frontend and a Node.js/Express backend, with MongoDB as the database.

### Frontend (React + Vite + Tailwind CSS)
 
- Component-based UI  
- React Router navigation  
- Tailwind styling  
- Responsive pages  
- API integration via fetch/Axios  

### Backend (Node.js + Express & MongoDB)

- RESTful API  
- Role-based route protection  
- Controllers & Business Logic  
- MongoDB schema with Users, Students, TUEs, TUs, Semesters, Grades  
- PDF generation service  
- Input validation & error handling  

## Tech Stack Justification

### Node.js & Express  
Event-driven, scalable, single-language full-stack development.

### React  
Component-based UI, fast rendering, widely supported.

### Tailwind CSS  
Utility-first design, fast UI development, responsive, easily customizable.

### MongoDB  
Flexible schema, JSON-native, scalable, ideal for evolving academic data structures.

---
Description Transcript system 
