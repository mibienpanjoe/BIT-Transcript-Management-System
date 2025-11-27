# Product Requirements Document (PRD)
## BIT Transcript Management System (TMS)
Version: 1.2 (Updated MVP with PDF + Correct Roles)
Tech Stack: Node.js (Express) · React + Vite · TailwindCSS · MongoDB

---

# 1. Product Summary

The BIT Transcript Management System (TMS) digitizes academic processes for:

- Student records  
- Academic structure (Fields, Semesters, TUs, TUEs)  
- Grade entry by Teachers  
- Presence entry by Schooling Manager  
- Automatic LMD calculations  
- **Admin-only Transcript PDF generation (single or bulk)**  

System roles: **Admin, Teacher, Schooling Manager**

**Important Update:**  
✔ Admin can view & download transcripts  
✔ Admin can generate PDFs  
✔ Schooling Manager *cannot* view or download transcripts  
✔ Teacher cannot view transcripts

---

# 2. Product Goals

## Primary Goals
1. Provide an official, automated transcript calculation and PDF system.  
2. Secure and separate responsibilities between Admin, Teacher, Manager.  
3. Reduce manual errors and replace Excel dependencies.

## Secondary Goals
- Faster validation processes  
- More transparency for Admin  
- Consistency with BIT’s official template  

---

# 3. Key Users & Permissions

| Role | Allowed | Not Allowed |
|------|---------|-------------|
| **Admin** | Manage all data, generate transcripts, download PDF | — |
| **Teacher** | Enter grades for assigned TUEs | View transcript, edit structure |
| **Schooling Manager** | Enter presence scores only | View transcripts, enter grades |

---

# 4. Core Use Cases

### Admin
- Manage users  
- Manage students  
- Manage academic structure  
- Import students via Excel  
- **Generate single or bulk PDF transcripts**  
- View full student transcript  

### Teacher
- View assigned TUEs  
- Submit grades  

### Schooling Manager
- Add presence scores  
- Cannot view transcripts  

---

# 5. Functional Requirements

## 5.1 Must‑Have Features

### Authentication
- JWT login  
- Role-based route protection  

### User Management
- Admin creates and manages users  
- Roles: Admin / Teacher / Schooling Manager  

### Student Management
- Add/edit/delete students  
- Import via Excel  

### Academic Structure
Admin actions:
- Manage Fields  
- Manage Semesters  
- Manage TUs  
- Manage TUEs and assign teachers  

### Grade & Presence Management
- Teachers → Enter grades  
- Schooling Manager → Enter presence scores  
- No one else can modify grades  

### Automatic Calculations
- TUE → TU average  
- TU → Semester average  
- TU validated: avg ≥ 8  
- Semester validated: avg ≥ 10 & all TUs ≥ 8  
- Mention scaling: A++ to F  

---

## 📄 PDF Transcript (Included in MVP)

### Rules
- **Only Admin can view, generate, download transcript PDFs**
- Schooling Manager has **zero transcript visibility**
- Teacher has **zero transcript visibility**

### Features
- Generate **single transcript PDF**  
- Generate **multiple PDFs in bulk**  
- Must match official BIT layout  
- Include:  
  - Student biodata  
  - TUE grades  
  - TU averages  
  - Semester averages  
  - Validation  
  - Mention  
  - Credits  

---

# 6. Non‑Functional Requirements

- Fast: API < 200 ms  
- Secure: bcrypt, JWT, RBAC  
- Accurate: central calculation engine  
- Responsive UI  

---

# 7. MVP Scope

### Included
✔ Authentication  
✔ User Roles  
✔ Student CRUD + import  
✔ Structure CRUD  
✔ Grade entry  
✔ Presence entry  
✔ Calculations  
✔ **Admin transcript viewer**  
✔ **Admin PDF generator**  
✔ Basic React screens  

### Excluded (post-MVP)
✖ Dashboards  
✖ Notifications  
✖ Dark mode  
✖ Multilingual  
✖ Audit logs  

---

# 8. Success Metrics

- Transcript errors: 0%  
- Generation time: < 3 seconds  
- Grade entry time: -70% faster  
- Admin satisfaction ≥ 85%  

---

# End of Document
