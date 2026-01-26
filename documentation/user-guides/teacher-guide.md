# Teacher Guide

Welcome to the BIT TMS Teacher Guide! This guide will help you view your assigned courses and enter grades for your students.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Viewing Assigned Courses](#viewing-assigned-courses)
3. [Entering Grades](#entering-grades)
4. [Importing Grades from Excel](#importing-grades-from-excel)
5. [Understanding Grade Calculations](#understanding-grade-calculations)
6. [Best Practices](#best-practices)

---

## Getting Started

### Logging In
1. Navigate to the BIT TMS login page
2. Enter your teacher email and password
3. Click **Login**
4. You'll be redirected to the teacher dashboard

### Teacher Dashboard Overview
Your dashboard shows:
- **Assigned Courses**: List of TUEs you're teaching
- **Number of Students**: Students enrolled in each course
- **Quick Actions**: Enter grades, view course details

---

## Viewing Assigned Courses

### My Courses Page

1. Navigate to **Teacher → My Courses**
2. View your assigned TUEs (Teaching Unit Elements)
3. For each course, you'll see:
   - **Course Code**: e.g., "EE_L3_REN401"
   - **Course Name**: e.g., "Solar Thermal Energy"
   - **TU**: Parent Teaching Unit
   - **Semester**: Academic semester
   - **Credits**: Course credits
   - **Number of Students**: Enrolled students
   - **Actions**: Enter Grades button

### Course Details

Click on a course name to view:
- Full course information
- Evaluation structure
- List of enrolled students
- Current grade entry status

---

## Entering Grades

### Understanding the Grade Entry Interface

When you click **Enter Grades** for a course, you'll see a table with:
- **Student Information**: Name and Student ID
- **Presence Grade**: Auto-calculated from attendance (read-only)
- **Participation Grade**: Editable (default: 10/20)
- **Evaluation Grades**: Columns for each evaluation (DS, DM, Final, etc.)
- **Final Grade**: Auto-calculated (display only)

### Step-by-Step Grade Entry

#### 1. Select the Course
1. Navigate to **Teacher → Grade Submission**
2. Select the TUE from the dropdown
3. Click **Load Students**

#### 2. Enter Participation Grades
1. In the **Participation** column, enter grades (0-20)
2. Default is 10/20 if not changed
3. Press Tab or Enter to move to the next field

#### 3. Enter Evaluation Grades
1. For each evaluation column (DS1, DS2, DM, Final, etc.):
   - Enter the grade (0-20)
   - Leave blank if not yet evaluated
2. The system validates that grades are between 0 and 20

#### 4. Review Calculated Final Grades
- The **Final Grade** column updates automatically
- Formula: `(Presence × 5%) + (Participation × 5%) + (Evaluations × 90%)`
- Grades are rounded to 2 decimal places

#### 5. Save Grades
- **Option 1**: Click **Save** after each row
- **Option 2**: Click **Save All** to save all changes at once
- A success message will confirm the save

### Grade Entry Example

**Course**: Solar Thermal Energy  
**Evaluation Structure**:
- DS 1: 20%
- DS 2: 20%
- DM: 10%
- Final Exam: 50%

**Student**: Jean Ouedraogo

| Component | Grade | Weight | Contribution |
|-----------|-------|--------|--------------|
| Presence | 18.00 | 5% | 0.90 |
| Participation | 12.00 | 5% | 0.60 |
| DS 1 | 14.00 | 18% (20% of 90%) | 2.52 |
| DS 2 | 16.00 | 18% (20% of 90%) | 2.88 |
| DM | 15.00 | 9% (10% of 90%) | 1.35 |
| Final Exam | 17.00 | 45% (50% of 90%) | 7.65 |
| **Final Grade** | | | **15.90** |

---

## Importing Grades from Excel

For faster grade entry, you can import grades from an Excel file.

### Step 1: Download the Template

1. Navigate to **Teacher → Grade Submission**
2. Select your TUE
3. Click **Import Grades**
4. Click **Download Template**
5. The template will include:
   - All enrolled students
   - Student IDs and names
   - Columns for each evaluation

### Step 2: Fill the Template

Open the Excel file and fill in the grades:
- **studentId**: Pre-filled (don't modify)
- **participationGrade**: Enter 0-20
- **evaluation1**, **evaluation2**, etc.: Enter 0-20 for each evaluation
- Leave cells blank for not-yet-evaluated items

**Example Template:**
```
studentId,studentName,participationGrade,DS1,DS2,DM,FinalExam
BIT2023001,Jean Ouedraogo,12,14,16,15,17
BIT2023002,Marie Kaboré,15,16,17,18,19
BIT2023003,Paul Sawadogo,10,12,13,11,14
```

### Step 3: Upload the File

1. In the import dialog, click **Choose File**
2. Select your filled Excel file
3. Click **Upload**
4. Review the import results:
   - ✅ **Success**: Number of grades imported
   - ❌ **Errors**: List of rows with errors

### Step 4: Verify Imported Grades

1. After import, review the grade entry table
2. Verify all grades were imported correctly
3. Make any necessary corrections
4. Click **Save All**

---

## Understanding Grade Calculations

### TUE Final Grade Formula

```
Final Grade = (Presence × 5%) + (Participation × 5%) + (Evaluations × 90%)
```

**Components:**

1. **Presence (5%)**
   - Automatically calculated from attendance records
   - Entered by the Schooling Manager
   - You cannot edit this value

2. **Participation (5%)**
   - Subjectively graded by you
   - Default: 10/20
   - Reflects student engagement, questions, contributions

3. **Evaluations (90%)**
   - Weighted average of all evaluations
   - Each evaluation has its own coefficient
   - Coefficients are defined in the course structure

### Evaluation Average Calculation

The evaluations average is calculated as:

```
Evaluations Average = Σ(Evaluation Grade × Coefficient) / 100
```

**Example:**
- DS 1 (20%): 14/20 → 14 × 0.20 = 2.80
- DS 2 (20%): 16/20 → 16 × 0.20 = 3.20
- DM (10%): 15/20 → 15 × 0.10 = 1.50
- Final (50%): 17/20 → 17 × 0.50 = 8.50
- **Evaluations Average** = 2.80 + 3.20 + 1.50 + 8.50 = **16.00/20**

### Final Grade Calculation

Using the example above:
- Presence: 18/20
- Participation: 12/20
- Evaluations Average: 16/20

```
Final Grade = (18 × 0.05) + (12 × 0.05) + (16 × 0.90)
            = 0.90 + 0.60 + 14.40
            = 15.90/20
```

### Grade Validation

- All grades must be between **0 and 20**
- Grades are rounded to **2 decimal places**
- Missing evaluations are treated as 0 (affects the average)

---

## Best Practices

### Before Grade Entry
- ✅ Verify you're entering grades for the correct course
- ✅ Ensure all evaluations have been completed
- ✅ Check that attendance has been entered by the Schooling Manager

### During Grade Entry
- ✅ Enter grades promptly after each evaluation
- ✅ Double-check grade values before saving
- ✅ Use Excel import for large classes (20+ students)
- ✅ Save frequently to avoid losing data

### After Grade Entry
- ✅ Review the final grades for reasonableness
- ✅ Check for any outliers or errors
- ✅ Notify students of their grades (if applicable)
- ✅ Keep your own backup of grades

### Excel Import Tips
- ✅ Always use the downloaded template
- ✅ Don't modify student IDs or names
- ✅ Test with a small batch first
- ✅ Keep a backup of your Excel file
- ✅ Verify imports immediately after uploading

### Grade Entry Timing
- ✅ Enter grades within 1 week of evaluation
- ✅ Complete all grade entry before semester end
- ✅ Coordinate with the Schooling Manager for attendance

---

## Frequently Asked Questions

### Can I edit grades after saving?
Yes, you can edit grades at any time. Simply return to the grade entry page, make changes, and save again.

### What if I make a mistake?
You can edit any grade you've entered. If you need to delete a grade entirely, contact an administrator.

### Can I see other teachers' grades?
No, you can only view and edit grades for courses assigned to you.

### What if the presence grade is missing?
Contact the Schooling Manager to enter attendance for your course. Presence defaults to 10/20 if not entered.

### Can I change the evaluation structure?
No, only administrators can modify the evaluation structure. Contact your admin if changes are needed.

### What happens if I don't enter participation grades?
The system uses a default of 10/20 for participation if you don't enter a value.

### Can I download student grades?
Yes, you can export the grade entry table to Excel for your records.

---

## Troubleshooting

### Common Issues

**Problem**: I can't see my assigned courses  
**Solution**: Contact an administrator to verify you're assigned to the correct TUEs

**Problem**: Excel import fails  
**Solution**: 
- Verify you're using the template downloaded from the system
- Check that student IDs haven't been modified
- Ensure all grades are between 0 and 20
- Check for empty rows or invalid data

**Problem**: Final grade doesn't calculate  
**Solution**: Ensure all evaluation grades are entered. Missing evaluations are treated as 0.

**Problem**: I can't save grades  
**Solution**: 
- Check your internet connection
- Verify all grades are valid (0-20)
- Try refreshing the page and re-entering
- Contact technical support if the issue persists

**Problem**: Presence grade is incorrect  
**Solution**: Contact the Schooling Manager to verify and correct attendance records

For more help, see the [Troubleshooting Guide](../troubleshooting.md) or contact your administrator.

---

## Contact Support

If you need assistance:
- **Technical Issues**: Contact your system administrator
- **Grade Questions**: Contact the Academic Director
- **System Access**: Contact the IT department

---

**Document Version**: 1.0  
**Last Updated**: November 22, 2025  
**For**: BIT TMS Teachers
