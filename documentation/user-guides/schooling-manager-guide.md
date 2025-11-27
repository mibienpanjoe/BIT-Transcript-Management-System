# Schooling Manager Guide

Welcome to the BIT TMS Schooling Manager Guide! This guide will help you enter and manage student attendance records.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Understanding Attendance](#understanding-attendance)
3. [Entering Attendance](#entering-attendance)
4. [Viewing Attendance Records](#viewing-attendance-records)
5. [Best Practices](#best-practices)

---

## Getting Started

### Logging In
1. Navigate to the BIT TMS login page
2. Enter your schooling manager email and password
3. Click **Login**
4. You'll be redirected to the manager dashboard

### Manager Dashboard Overview
Your dashboard shows:
- **Attendance Entry Tasks**: Courses requiring attendance entry
- **Quick Actions**: Enter attendance
- **Summary**: Overview of attendance completion status

### Your Role
As a Schooling Manager, you are responsible for:
- ✅ Recording student attendance for all courses
- ✅ Calculating attendance percentages
- ✅ Ensuring attendance data is accurate and up-to-date

> **Note**: You cannot view transcripts or enter grades. These functions are restricted to teachers and administrators.

---

## Understanding Attendance

### What is Attendance?

Attendance tracks how many class sessions each student attended out of the total sessions held.

### How Attendance Affects Grades

Attendance is converted to a **Presence Grade** (0-20) which contributes **5%** to the student's final TUE grade.

**Formula:**
```
Attendance Percentage = (Attended Sessions / Total Sessions) × 100
Presence Grade = (Attendance Percentage / 100) × 20
```

**Example:**
- Total Sessions: 20
- Attended Sessions: 18
- Attendance Percentage: (18 / 20) × 100 = **90%**
- Presence Grade: (90 / 100) × 20 = **18.00/20**

### Attendance Grading Scale

| Attendance % | Presence Grade | Impact |
|--------------|----------------|--------|
| 100% | 20.00 | Excellent |
| 90% | 18.00 | Very Good |
| 80% | 16.00 | Good |
| 70% | 14.00 | Acceptable |
| 60% | 12.00 | Fair |
| 50% | 10.00 | Minimum |
| < 50% | < 10.00 | Poor |

---

## Entering Attendance

### Step-by-Step Attendance Entry

#### 1. Select the Course (TUE)

1. Navigate to **Manager → Attendance Management**
2. Use the dropdown to select:
   - **Field**: e.g., Electrical Engineering
   - **Semester**: e.g., S5
   - **TU**: e.g., Renewable Energy IV
   - **TUE**: e.g., Solar Thermal Energy
3. Click **Load Students**

#### 2. View the Student List

The attendance table displays:
- **Student ID**: Matricule
- **Student Name**: Full name
- **Total Sessions**: Number of sessions held (editable)
- **Attended Sessions**: Number attended (editable)
- **Attendance %**: Auto-calculated
- **Presence Grade**: Auto-calculated (0-20)

#### 3. Enter Attendance Data

For each student:

1. **Total Sessions**: Enter the total number of class sessions
   - This is usually the same for all students in a course
   - Example: 20 sessions

2. **Attended Sessions**: Enter how many sessions the student attended
   - Must be ≤ Total Sessions
   - Example: 18 sessions

3. The system automatically calculates:
   - **Attendance %**: (18 / 20) × 100 = 90%
   - **Presence Grade**: (90 / 100) × 20 = 18.00/20

#### 4. Save Attendance

- **Option 1**: Click **Save** after each row
- **Option 2**: Enter all data, then click **Save All**
- A success message confirms the save

### Bulk Entry Tip

If all students have the same total sessions:
1. Enter the total sessions for the first student
2. Click **Apply to All** to copy to all students
3. Then enter individual attended sessions for each student

---

## Viewing Attendance Records

### View All Attendance

1. Navigate to **Manager → Attendance Management**
2. Click **View All Records**
3. Use filters to find specific records:
   - By Field
   - By Semester
   - By TUE
   - By Student

### View Student Attendance

To see all attendance for a specific student:
1. Click **Search Student**
2. Enter student name or ID
3. View all their attendance records across all courses

### Edit Existing Attendance

1. Find the attendance record
2. Click **Edit**
3. Update the values
4. Click **Save**

> **Important**: Editing attendance will recalculate the presence grade and affect the student's final grade.

---

## Best Practices

### Data Entry
- ✅ Enter attendance regularly (weekly or bi-weekly)
- ✅ Don't wait until the end of the semester
- ✅ Double-check total sessions count
- ✅ Verify attended sessions ≤ total sessions
- ✅ Use bulk entry features for efficiency

### Accuracy
- ✅ Keep accurate attendance records
- ✅ Cross-reference with teacher records
- ✅ Update immediately if errors are found
- ✅ Maintain backup attendance sheets

### Timing
- ✅ Enter attendance before teachers enter grades
- ✅ Complete all attendance entry before semester end
- ✅ Coordinate with teachers on session counts

### Communication
- ✅ Notify teachers when attendance is entered
- ✅ Confirm total session counts with teachers
- ✅ Report discrepancies to administrators

---

## Attendance Entry Examples

### Example 1: Perfect Attendance

**Course**: Solar Thermal Energy  
**Student**: Jean Ouedraogo

| Field | Value |
|-------|-------|
| Total Sessions | 20 |
| Attended Sessions | 20 |
| Attendance % | 100% |
| Presence Grade | 20.00/20 |

### Example 2: Good Attendance

**Course**: Digital Electronics  
**Student**: Marie Kaboré

| Field | Value |
|-------|-------|
| Total Sessions | 24 |
| Attended Sessions | 22 |
| Attendance % | 91.67% |
| Presence Grade | 18.33/20 |

### Example 3: Poor Attendance

**Course**: Power Systems  
**Student**: Paul Sawadogo

| Field | Value |
|-------|-------|
| Total Sessions | 18 |
| Attended Sessions | 8 |
| Attendance % | 44.44% |
| Presence Grade | 8.89/20 |

---

## Frequently Asked Questions

### What if a student joins late?
Enter the total sessions from when they joined, not from the beginning of the semester. Coordinate with the teacher.

### Can I edit attendance after saving?
Yes, you can edit attendance records at any time. Changes will update the presence grade automatically.

### What if total sessions varies by student?
This is rare, but you can enter different total sessions for each student if needed (e.g., late enrollment).

### What if a student has excused absences?
Coordinate with the teacher and administration on policy. You may count excused absences as attended or adjust total sessions.

### Can I delete attendance records?
No, you can only edit. Contact an administrator if you need to delete a record.

### What happens if I don't enter attendance?
The system uses a default presence grade of 10/20. This may negatively impact student grades.

### Can I see student grades?
No, you can only view and enter attendance. Grades are managed by teachers and administrators.

---

## Troubleshooting

### Common Issues

**Problem**: Can't find a course  
**Solution**: Verify the course exists in the academic structure. Contact an administrator if needed.

**Problem**: Save button is disabled  
**Solution**: 
- Ensure attended sessions ≤ total sessions
- Verify all required fields are filled
- Check that values are valid numbers

**Problem**: Attendance percentage is wrong  
**Solution**: The system calculates automatically. Verify your total and attended sessions are correct.

**Problem**: Changes aren't saving  
**Solution**:
- Check your internet connection
- Try refreshing the page
- Contact technical support if the issue persists

**Problem**: Student is missing from the list  
**Solution**: Verify the student is enrolled in the selected course. Contact an administrator to check enrollment.

For more help, see the [Troubleshooting Guide](../troubleshooting.md) or contact your administrator.

---

## Contact Support

If you need assistance:
- **Technical Issues**: Contact your system administrator
- **Attendance Policy Questions**: Contact the Academic Director
- **System Access**: Contact the IT department

---

**Document Version**: 1.0  
**Last Updated**: November 22, 2025  
**For**: BIT TMS Schooling Managers
