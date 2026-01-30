# BIT Transcript Management System (TMS) - Walkthrough

## Overview
The BIT TMS is a comprehensive web application designed to manage the academic lifecycle of students, from enrollment to transcript generation. It features a role-based access control system catering to Administrators, Teachers, and Schooling Managers.

## Features by Role

### 1. Administrator
*   **Dashboard**: View key statistics (Total Students, Teachers, Fields, Users) and quick actions.
*   **User Management**: Create, edit, and deactivate system users (Admins, Teachers, Schooling Managers).
*   **Academic Structure**: Manage the hierarchy of the curriculum:
    *   **Fields**: Define fields of study (e.g., Computer Science).
    *   **Promotions**: Create cohorts/years for each field.
    *   **Semesters**: Define semesters (L1S1, L1S2, etc.) for each promotion.
    *   **Teaching Units (TU)**: Group subjects into units with credit values.
    *   **TU Elements (TUE)**: Define individual subjects and **assign Teachers** to them.
*   **Student Management**: 
    *   Add/Edit students manually.
    *   **Import Students** via Excel for bulk enrollment.
    *   Filter students by Field and Promotion.
*   **Results & Transcripts**:
    *   **Calculate Results**: Trigger calculation of Semester and Annual averages.
    *   **Generate Transcripts**: Download PDF transcripts for individual students (Semester & Annual).

### 2. Teacher
*   **Grade Management**:
    *   View assigned Teaching Unit Elements (TUEs).
    *   Configure evaluation schema (component names + weights totaling 90%).
    *   Enter grades for **Participation** and evaluation components.
    *   View (read-only) **Presence** grades managed by the Schooling Manager.
    *   **Import Grades** via Excel for bulk entry.

### 3. Schooling Manager
*   **Student Management**: View and manage student records (shared with Admin).
*   **Attendance Management**:
    *   Select Field -> Promotion -> Semester -> TUE.
    *   Enter **Presence Grades** (0-20) for students based on their attendance record.

## System Architecture

### Frontend
*   **Framework**: React + Vite
*   **Styling**: TailwindCSS
*   **State Management**: React Context (AuthContext)
*   **Routing**: React Router DOM (with Protected Routes)
*   **HTTP Client**: Axios (with Interceptors for JWT)

### Backend
*   **Runtime**: Node.js + Express
*   **Database**: MongoDB (Mongoose)
*   **Authentication**: JWT (JSON Web Tokens)
*   **PDF Generation**: PDFKit
*   **Excel Processing**: XLSX

## Getting Started

1.  **Start the Backend**:
    ```bash
    cd backend
    npm start
    ```
    Server runs on `http://localhost:5000`.

2.  **Start the Frontend**:
    ```bash
    cd frontend
    npm run dev
    ```
    Application runs on `http://localhost:5173`.

3.  **Default Login**:
    *   **Email**: `admin@bit.com`
    *   **Password**: `admin123`

## Key Workflows

### Setting up a New Academic Year
1.  **Admin**: Go to **Academic Structure**.
2.  Create a **Field** (if new).
3.  Create a **Promotion** (e.g., "CS 2023-2024").
4.  Create **Semesters** (S1, S2).
5.  Create **TUs** for each semester.
6.  Create **TUEs** for each TU and assign **Teachers**.

### Enrolling Students
1.  **Admin/Manager**: Go to **Students**.
2.  Click **Import Excel** to upload a list of students for the new Promotion.

### Grading Process
1.  **Schooling Manager**: Go to **Attendance**. Select the TUE and enter Presence grades.
2.  **Teacher**: Log in, go to **Grades**. Select the TUE, configure evaluation schema, and enter grades.
3.  **Admin**: Go to **Results**. Click **Calculate Semester Results** to compute averages.
4.  **Admin**: Click **PDF** icon next to a student to download their transcript.

## Verification Status
*   [x] **Authentication**: Login, Logout, Protected Routes working.
*   [x] **User Management**: CRUD operations functional.
*   [x] **Academic Structure**: Full hierarchy management implemented.
*   [x] **Student Management**: CRUD and Excel Import working.
*   [x] **Grade Entry**: Teachers can enter grades; Presence is read-only.
*   [x] **Attendance**: Dedicated interface for Schooling Managers.
*   [x] **Results**: Calculation triggers and PDF generation connected.
*   [x] **Settings**: Password change functionality added.
