# Frequently Asked Questions (FAQ)

Common questions about BIT TMS.

## General Questions

### What is BIT TMS?
BIT TMS (Transcript Management System) is a comprehensive web application for managing student records, grades, attendance, and transcript generation at the Burkina Institute of Technology.

### Who can use the system?
The system has three user roles:
- **Admins**: Full system access
- **Teachers**: Can enter grades for assigned courses
- **Schooling Managers**: Can enter attendance records

### Is my data secure?
Yes. The system uses:
- Encrypted passwords (bcrypt)
- Secure authentication (JWT tokens)
- Role-based access control
- HTTPS encryption (in production)

### Can I access the system from my phone?
Yes! The system is responsive and works on mobile devices, tablets, and desktops.

---

## User Account Questions

### How do I get an account?
Contact your system administrator. Only admins can create user accounts.

### I forgot my password. What do I do?
Contact your system administrator to reset your password.

### Can I change my password?
Yes. After logging in, go to your profile settings and select "Change Password".

### Can I change my email address?
No. Email addresses cannot be changed. Contact an admin if you need a new email.

### Why was my account deactivated?
Contact your administrator. Accounts may be deactivated for:
- End of employment
- Security reasons
- Inactivity

---

## Student Management Questions

### How do I add students?
**Admins only:**
- Single student: Admin → Student Management → Add Student
- Multiple students: Admin → Student Management → Import Students (Excel)

### Can I edit student information?
**Admins only:** Yes, click the Edit icon next to the student in the student list.

### What happens if I delete a student?
**Warning:** Deleting a student removes all their grades and attendance records. This cannot be undone!

### Can students access the system?
Not in the current version. Only admins, teachers, and managers have access.

---

## Grade Entry Questions

### Who can enter grades?
Only teachers assigned to a specific TUE can enter grades for that course.

### Can I edit grades after saving?
Yes, you can edit grades at any time. Changes are tracked.

### What if I make a mistake?
Simply edit the grade and save again. The system will update all calculations automatically.

### Why can't I see my courses?
You must be assigned to a TUE by an administrator. Contact your admin.

### What is the default participation grade?
If you don't enter a participation grade, the system uses 10/20 as the default.

### How is the final grade calculated?
```
Final Grade = (Presence × 5%) + (Participation × 5%) + (Evaluations × 90%)
```
See [Calculation Logic](./developer/calculation-logic.md) for details.

### Can I import grades from Excel?
Yes! Download the template, fill it in, and upload. See [Teacher Guide](./user-guides/teacher-guide.md#importing-grades-from-excel).

---

## Attendance Questions

### Who can enter attendance?
Only Schooling Managers can enter attendance records.

### How is attendance converted to a grade?
```
Attendance % = (Attended Sessions / Total Sessions) × 100
Presence Grade = (Attendance % / 100) × 20
```

### Can I edit attendance after saving?
Yes, you can edit attendance records at any time.

### What if a student joins late?
Enter the total sessions from when they joined, not from the beginning of the semester.

### What about excused absences?
Coordinate with the teacher and administration on policy. You may count excused absences as attended or adjust total sessions.

---

## Transcript Questions

### Who can generate transcripts?
Only administrators can view and generate transcripts.

### How long does PDF generation take?
- Single student: 2-5 seconds
- Bulk (100 students): 5-10 minutes

### Can I generate transcripts for specific semesters?
Yes, you can generate semester-specific or complete transcripts.

### What if grades are missing?
The system will show missing grades as blank or 0. Ensure all grades are entered before generating transcripts.

### Can I customize the transcript template?
Not through the UI. Contact a developer to modify the PDF template.

---

## Calculation Questions

### How are TU averages calculated?
```
TU Average = Σ(TUE Grade × TUE Credits) / Σ(TUE Credits)
```

### How are semester averages calculated?
```
Semester Average = Σ(TU Average × TU Credits) / Σ(TU Credits)
```

### What does "V-C" mean?
V-C means "Validated by Compensation". A TU with average 8.00-11.99 can be validated if the semester average is ≥ 12.00.

### How many TUs can be compensated per semester?
Maximum 1 TU per semester can be validated by compensation.

### What is a "mention"?
A mention is a grade rating (A++, A+, A, B+, B, C+, C, D+, D, F) based on the semester average.

### When are calculations performed?
Calculations are performed automatically when:
- Grades are saved
- Attendance is updated
- Transcripts are generated

You can also manually trigger recalculation (admin only).

---

## Academic Structure Questions

### What is the hierarchy?
```
Field → Promotion → Semester → TU → TUE
```

### Who can modify the academic structure?
Only administrators.

### Can I delete a TUE that has grades?
Not recommended. Deleting a TUE will orphan the associated grades. Contact an admin.

### What is an evaluation structure?
The evaluation structure defines the assessments for a course (DS, DM, Final, etc.) and their coefficients (percentages).

### Why must coefficients total 100%?
This ensures the weighted average is calculated correctly. The system enforces this rule.

---

## Technical Questions

### What browsers are supported?
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

### Can I use Internet Explorer?
No. Internet Explorer is not supported. Use a modern browser.

### Why is the system slow?
Possible reasons:
- Slow internet connection
- High server load (many users)
- Large dataset (many students)
- Browser cache needs clearing

### Can I use the system offline?
No. BIT TMS requires an internet connection.

### Is there a mobile app?
Not currently. Use the web version on your mobile browser.

### Can I export data to Excel?
Some data can be exported. Contact an admin for bulk exports.

---

## Import/Export Questions

### What file format is required for imports?
Excel files (.xlsx or .xls). CSV files are not supported.

### Can I import grades for multiple courses at once?
No. Grades must be imported per TUE.

### What if my import fails?
Review the error messages, fix the issues in your Excel file, and try again. See [Troubleshooting Guide](./troubleshooting.md#import-issues).

### Can I download a list of all students?
**Admins only:** Yes, use the export feature in Student Management.

---

## Policy Questions

### How long are grades stored?
Grades are stored permanently unless manually deleted by an admin.

### Can grades be changed after semester end?
Technically yes, but this should be done only with proper authorization. All changes are logged.

### Who can see my grades?
- **Teachers**: Can see grades for courses they teach
- **Admins**: Can see all grades
- **Managers**: Cannot see grades

### What is the grading scale?
Grades are on a 0-20 scale, where:
- 20 = Perfect
- 10 = Passing
- 0 = Fail

---

## Support Questions

### How do I report a bug?
Contact your system administrator with:
- Description of the issue
- Steps to reproduce
- Screenshots (if applicable)
- Browser and version

### How do I request a new feature?
Submit feature requests to your administrator. They will be evaluated for future updates.

### Is there training available?
Yes. Contact your administrator to schedule training sessions.

### Where can I find more help?
- [Quick Start Guide](./quick-start-guide.md)
- [User Guides](./user-guides/)
- [Troubleshooting Guide](./troubleshooting.md)
- Contact your administrator

---

## Still Have Questions?

Contact your system administrator or refer to the appropriate guide:
- [Admin Guide](./user-guides/admin-guide.md)
- [Teacher Guide](./user-guides/teacher-guide.md)
- [Schooling Manager Guide](./user-guides/schooling-manager-guide.md)

---

**Document Version**: 1.0  
**Last Updated**: November 22, 2025
