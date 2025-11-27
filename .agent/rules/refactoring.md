---
trigger: always_on
---

> **CRITICAL INSTRUCTION FOR AI AGENT:**
> Before ANY code modification, you MUST read and follow the rules below. Failure to do so will result in broken builds.

## Rule 1: The "Impact Radius" Check (Mandatory)
Before modifying ANY file (e.g., `A.js`), you must:
1.  **Search for references:** Run a search to find every other file that imports or requires `A.js`.
2.  **Analyze dependencies:** If you change a function signature, export name, or data structure in `A.js`, you MUST list all other files that will break.
3.  **Plan the Atomic Update:** Your implementation plan must include updating `A.js` AND all its dependent files in the same "transaction" (sequence of edits).

## Rule 2: Schema-First Development
If you are modifying a Mongoose Schema (e.g., `models/Grade.js`):
1.  **Stop.** Do not edit the schema yet.
2.  **Check Services:** Find all services (like `CalculationEngine.js`) that use this schema.
3.  **Check Frontend:** Find all React components (like `GradeEntryTable.jsx`) that display this data.
4.  **Update Strategy:** You must update the Schema, the Backend Service, and the Frontend Component in that order.

## Rule 3: No "Placeholder" or "Partial" Fixes
* **Never** leave comments like `// ... update other files similarly`. You must update them yourself.
* **Never** break the build. If a change requires updating 5 files, update all 5.