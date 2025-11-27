# BIT TMS Testing Resources

This directory contains comprehensive testing resources for the BIT Transcript Management System.

## Quick Start

1. **Start the application** (backend and frontend)
2. **Open** `TESTING-GUIDE.md` for step-by-step instructions
3. **Use sample data** from the `sample-data/` directory
4. **Follow the phases** sequentially for best results

## Directory Structure

```
testing/
├── README.md                           # This file
├── TESTING-GUIDE.md                    # Comprehensive testing guide
└── sample-data/                        # Sample data files
    ├── students-import-template.csv    # 20 students for Excel import
    ├── grades-import-template-solar-thermal.csv  # Grades for EE course
    ├── grades-import-template-programming.csv    # Grades for CS course
    ├── test-users.md                   # User accounts to create
    ├── academic-structure-data.md      # Complete academic setup
    └── attendance-data.md              # Attendance records
```

## What's Included

### 1. TESTING-GUIDE.md
A comprehensive, step-by-step guide that covers:
- Initial setup and prerequisites
- User management (Admins, Teachers, Managers)
- Academic structure setup (Fields, Promotions, Semesters, TUs, TUEs)
- Student management and Excel import
- Attendance entry
- Grade entry and Excel import
- Results calculation and transcript generation
- Complete testing checklist
- Troubleshooting tips

**Estimated Time**: 2-3 hours for complete testing

### 2. Sample Data Files

#### students-import-template.csv
- 20 student records ready for import
- 10 Electrical Engineering students
- 10 Computer Science students
- Properly formatted for Excel import
- All required fields included

#### grades-import-template-solar-thermal.csv
- Sample grades for "Solar Thermal Energy" course
- 10 EE students
- Includes participation and all evaluations (DS1, DS2, DM, Final Exam)
- Realistic grade distributions

#### grades-import-template-programming.csv
- Sample grades for "Object-Oriented Programming" course
- 10 CS students
- Includes participation and all evaluations (TP1, TP2, Project, Final Exam)

#### test-users.md
User credentials for testing:
- Default admin account
- 3 Teacher accounts
- 1 Schooling Manager account
- All with test passwords

#### academic-structure-data.md
Complete academic setup including:
- 2 Fields (EE and CS)
- 2 Promotions
- 2 Semesters
- 6 Teaching Units (TUs)
- 12 Teaching Unit Elements (TUEs) with full evaluation structures
- All relationships and credits defined

#### attendance-data.md
Attendance records for 4 courses:
- Solar Thermal Energy (EE)
- Wind Energy Systems (EE)
- Object-Oriented Programming (CS)
- Data Structures & Algorithms (CS)
- Includes total sessions, attended sessions, and calculated presence grades

## Testing Workflow

Follow these phases in order:

1. **Initial Setup** - Start application, verify login
2. **User Management** - Create test user accounts
3. **Academic Structure** - Set up fields, promotions, semesters, TUs, TUEs
4. **Student Management** - Import students from Excel
5. **Attendance Entry** - Enter attendance as Schooling Manager
6. **Grade Entry** - Enter grades as Teachers (manual and Excel import)
7. **Transcript Generation** - Calculate results and generate PDFs as Admin

## Key Features to Test

### Excel Import ✅
- Student bulk import (20 students)
- Grade bulk import (multiple courses)
- Template download
- Error handling

### Role-Based Access ✅
- Admin: Full system access
- Teacher: Grade entry for assigned courses only
- Schooling Manager: Attendance entry only

### Calculations ✅
- Attendance percentage → Presence grade
- Weighted evaluation averages
- TUE final grades (Presence 5% + Participation 5% + Evaluations 90%)
- TU averages
- Semester averages
- Credit calculations
- Validation statuses (V/NV/V-C)

### PDF Generation ✅
- Single student transcript
- Bulk PDF generation
- ZIP download
- Correct formatting and content

## Sample Test Scenarios

### Scenario 1: Perfect Student
- **Student**: Marie Kaboré (BIT2023002)
- **Attendance**: 100% (Presence: 20/20)
- **Grades**: Excellent across all evaluations
- **Expected**: High final average, all TUs validated

### Scenario 2: Struggling Student
- **Student**: Paul Sawadogo (BIT2023003)
- **Attendance**: 70% (Presence: 14/20)
- **Grades**: Lower scores
- **Expected**: Lower final average, possible NV (non-validated) TUs

### Scenario 3: Good Student
- **Student**: Jean Ouedraogo (BIT2023001)
- **Attendance**: 90% (Presence: 18/20)
- **Grades**: Good to very good
- **Expected**: Good final averages, TUs validated

## Tips for Efficient Testing

1. **Follow the guide sequentially** - Don't skip phases
2. **Use the checklist** - Track your progress
3. **Keep test data handy** - Open sample data files in text editor
4. **Test one role at a time** - Complete one user type before switching
5. **Verify calculations** - Spot-check a few calculations manually
6. **Take notes** - Document any issues or questions
7. **Test error cases** - Try invalid inputs to verify validation

## Common Testing Pitfalls

❌ **Skipping attendance entry** → Presence grades default to 10/20  
❌ **Not assigning teachers to TUEs** → Teachers can't see courses  
❌ **Evaluation structure not totaling 100%** → Cannot save TUE  
❌ **Importing students before creating structure** → Field/Promotion not found errors  
❌ **Not calculating results before transcript generation** → Incomplete transcripts

## Success Criteria

After completing all testing phases, you should have:

✅ 5 user accounts (1 Admin, 3 Teachers, 1 Manager)  
✅ 2 Fields, 2 Promotions, 2 Semesters  
✅ 6 TUs, 4+ TUEs with evaluation structures  
✅ 20 students imported via Excel  
✅ Attendance entered for at least 2 courses  
✅ Grades entered for at least 2 courses (via Excel import)  
✅ Results calculated for at least 1 semester  
✅ PDF transcripts generated successfully  
✅ All features tested and working  

## Need Help?

If you encounter issues:

1. **Check the troubleshooting section** in TESTING-GUIDE.md
2. **Review the user guides** in `documentation/user-guides/`
3. **Check console logs** (browser and backend)
4. **Verify data integrity** (relationships, required fields)
5. **Review walkthrough.md** for system architecture

## Additional Resources

- **User Guides**: `documentation/user-guides/`
  - admin-guide.md
  - teacher-guide.md
  - schooling-manager-guide.md
- **Walkthrough**: `walkthrough.md`
- **Developer Docs**: `documentation/developer/`

## Feedback

After testing, please note:
- Any bugs or issues found
- Features that work well
- Areas needing improvement
- Documentation gaps
- Performance observations

---

**Ready to start testing?** Open `TESTING-GUIDE.md` and begin with Phase 1!

---

**Document Version**: 1.0  
**Last Updated**: November 22, 2025  
**Maintained By**: BIT TMS Development Team
