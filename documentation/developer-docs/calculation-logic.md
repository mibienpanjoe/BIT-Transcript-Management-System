# Calculation Logic Documentation

This document explains all calculation formulas and validation logic used in the BIT TMS.

## Table of Contents
1. [Overview](#overview)
2. [TUE Final Grade Calculation](#tue-final-grade-calculation)
3. [TU Average Calculation](#tu-average-calculation)
4. [TU Validation Logic](#tu-validation-logic)
5. [Semester Average Calculation](#semester-average-calculation)
6. [Semester Validation Logic](#semester-validation-logic)
7. [Mention Calculation](#mention-calculation)
8. [Credits Calculation](#credits-calculation)
9. [Implementation Examples](#implementation-examples)

---

## Overview

The BIT TMS uses a hierarchical calculation system:

```
TUE Grades → TU Average → Semester Average
     ↓            ↓              ↓
  Validation  Validation    Validation
                                ↓
                            Mention
```

All calculations are performed server-side to ensure consistency and accuracy.

---

## TUE Final Grade Calculation

### Formula

```
Final TUE Grade = (Presence × 5%) + (Participation × 5%) + (Evaluations × 90%)
```

### Components

#### 1. Presence Grade (5% weight)
- **Source**: Calculated from attendance records
- **Formula**: `(Attended Sessions / Total Sessions) × 20`
- **Range**: 0-20
- **Default**: 10/20 if attendance not entered

#### 2. Participation Grade (5% weight)
- **Source**: Entered by teacher
- **Range**: 0-20
- **Default**: 10/20

#### 3. Evaluations Average (90% weight)
- **Source**: Weighted average of all evaluations
- **Formula**: `Σ(Evaluation Grade × Coefficient) / 100`
- **Range**: 0-20

### Calculation Steps

1. **Calculate Evaluations Average**:
   ```
   Evaluations Average = Σ(Evaluation Grade × Coefficient) / 100
   ```

2. **Calculate Final Grade**:
   ```
   Final Grade = (Presence × 0.05) + (Participation × 0.05) + (Evaluations Average × 0.90)
   ```

3. **Round to 2 decimal places**

### Example

**Given:**
- Presence: 18.00/20
- Participation: 12.00/20
- Evaluations:
  - DS 1 (20%): 14.00/20
  - DS 2 (20%): 16.00/20
  - DM (10%): 15.00/20
  - Final Exam (50%): 17.00/20

**Step 1: Calculate Evaluations Average**
```
Evaluations Average = (14 × 0.20) + (16 × 0.20) + (15 × 0.10) + (17 × 0.50)
                    = 2.80 + 3.20 + 1.50 + 8.50
                    = 16.00/20
```

**Step 2: Calculate Final Grade**
```
Final Grade = (18 × 0.05) + (12 × 0.05) + (16 × 0.90)
            = 0.90 + 0.60 + 14.40
            = 15.90/20
```

### Edge Cases

- **Missing Evaluations**: Treated as 0/20
- **Missing Presence**: Default to 10/20
- **Missing Participation**: Default to 10/20
- **Negative Values**: Not allowed, validation enforced
- **Values > 20**: Not allowed, validation enforced

---

## TU Average Calculation

### Formula

```
TU Average = Σ(TUE Grade × TUE Credits) / Σ(TUE Credits)
```

### Calculation Steps

1. For each TUE in the TU:
   - Get the final TUE grade
   - Get the TUE credits
   - Multiply: `TUE Grade × TUE Credits`

2. Sum all products

3. Sum all TUE credits

4. Divide: `Sum of Products / Sum of Credits`

5. Round to 2 decimal places

### Example

**TU: Renewable Energy IV (3 credits total)**

| TUE | Grade | Credits | Product |
|-----|-------|---------|---------|
| Solar Thermal Energy | 15.90 | 2 | 31.80 |
| Wind Energy Systems | 14.50 | 1 | 14.50 |

**Calculation:**
```
TU Average = (31.80 + 14.50) / (2 + 1)
           = 46.30 / 3
           = 15.43/20
```

### Edge Cases

- **Missing TUE Grades**: TU average cannot be calculated
- **Zero Credits**: Not allowed, validation enforced
- **Single TUE**: TU average = TUE grade

---

## TU Validation Logic

### Validation Rules

A TU can have one of three validation statuses:

1. **V (Validated)**: TU Average ≥ 8.00/20
2. **NV (Not Validated)**: TU Average < 6.00/20
3. **V-C (Validated by Compensation)**: 
   - TU Average ≥ 6.00/20 AND < 8.00/20
   - Semester Average ≥ 10.00/20
   - Maximum 1 TU per semester can be compensated

### Decision Tree

```
Is TU Average ≥ 8.00?
├─ YES → Status = V (Validated)
└─ NO
   └─ Is TU Average < 6.00?
      ├─ YES → Status = NV (Not Validated)
      └─ NO (6.00 ≤ Average < 8.00)
         └─ Is Semester Average ≥ 10.00?
            ├─ YES → Status = V-C (Validated by Compensation)*
            └─ NO → Status = NV (Not Validated)

* Maximum 1 V-C per semester
```

### Examples

#### Example 1: Validated (V)
- TU Average: 12.50/20
- Status: **V** (≥ 8.00)
- Credits Earned: Full credits

#### Example 2: Not Validated (NV)
- TU Average: 5.50/20
- Status: **NV** (< 6.00)
- Credits Earned: 0

#### Example 3: Validated by Compensation (V-C)
- TU Average: 7.00/20
- Semester Average: 11.00/20
- Status: **V-C** (6.00 ≤ 7.00 < 8.00 AND semester ≥ 10.00)
- Credits Earned: Full credits

#### Example 4: Not Validated (NV) - Compensation Failed
- TU Average: 7.00/20
- Semester Average: 9.50/20
- Status: **NV** (semester average < 10.00)
- Credits Earned: 0

### Compensation Limit

**Rule**: Maximum 1 TU can be validated by compensation per semester.

**Logic**:
1. Calculate all TU averages
2. Identify TUs with 6.00 ≤ average < 8.00
3. If semester average ≥ 10.00:
   - Validate the TU with the highest average (closest to 8.00)
   - Mark as V-C
   - Mark others as NV

---

## Semester Average Calculation

### Formula

```
Semester Average = Σ(TU Average × TU Credits) / Σ(TU Credits)
```

### Calculation Steps

1. For each TU in the semester:
   - Get the TU average
   - Get the TU credits
   - Multiply: `TU Average × TU Credits`

2. Sum all products

3. Sum all TU credits

4. Divide: `Sum of Products / Sum of Credits`

5. Round to 2 decimal places

### Example

**Semester 5 (30 credits total)**

| TU | Average | Credits | Product |
|----|---------|---------|---------|
| Renewable Energy IV | 15.43 | 3 | 46.29 |
| Power Systems III | 12.80 | 4 | 51.20 |
| Digital Electronics II | 14.20 | 3 | 42.60 |
| Mathematics V | 11.50 | 2 | 23.00 |
| English III | 16.00 | 2 | 32.00 |
| Professional Skills | 13.00 | 2 | 26.00 |

**Calculation:**
```
Semester Average = (46.29 + 51.20 + 42.60 + 23.00 + 32.00 + 26.00) / (3 + 4 + 3 + 2 + 2 + 2)
                 = 221.09 / 16
                 = 13.82/20
```

---

## Semester Validation Logic

### Validation Rules

A semester is validated if **BOTH** conditions are met:

1. **Semester Average ≥ 10.00/20**
2. **All TUs are validated** (status = V or V-C)

### Decision Tree

```
Is Semester Average ≥ 10.00?
├─ NO → Status = NOT_VALIDATED
└─ YES
   └─ Are all TUs validated (V or V-C)?
      ├─ YES → Status = VALIDATED
      └─ NO → Status = NOT_VALIDATED
```

### Examples

#### Example 1: Validated
- Semester Average: 13.82/20
- TU Statuses: V, V, V, V, V, V
- Result: **VALIDATED** ✅

#### Example 2: Not Validated (Low Average)
- Semester Average: 9.50/20
- TU Statuses: V, V, V, V, V, V
- Result: **NOT_VALIDATED** ❌ (average < 10.00)

#### Example 3: Not Validated (TU Failed)
- Semester Average: 11.00/20
- TU Statuses: V, V, NV, V, V, V
- Result: **NOT_VALIDATED** ❌ (one TU not validated)

#### Example 4: Validated with Compensation
- Semester Average: 11.50/20
- TU Statuses: V, V, V-C, V, V, V
- Result: **VALIDATED** ✅ (V-C counts as validated)

---

## Mention Calculation

### Mention Scale

| Mention | Range | English | French |
|---------|-------|---------|--------|
| **A++** | ≥ 18.00 | Excellent | Excellent |
| **A+** | 17.00 - 17.99 | Very Good+ | Très Bien+ |
| **A** | 16.00 - 16.99 | Very Good | Très Bien |
| **B+** | 15.00 - 15.99 | Good+ | Bien+ |
| **B** | 14.00 - 14.99 | Good | Bien |
| **C+** | 13.00 - 13.99 | Fairly Good+ | Assez Bien+ |
| **C** | 12.00 - 12.99 | Fairly Good | Assez Bien |
| **D+** | 11.00 - 11.99 | Passable+ | Passable+ |
| **D** | 10.00 - 10.99 | Passable | Passable |
| **F** | < 10.00 | Fail | Échec |

### Calculation Logic

```javascript
function calculateMention(average) {
  if (average >= 18.00) return 'A++';
  if (average >= 17.00) return 'A+';
  if (average >= 16.00) return 'A';
  if (average >= 15.00) return 'B+';
  if (average >= 14.00) return 'B';
  if (average >= 13.00) return 'C+';
  if (average >= 12.00) return 'C';
  if (average >= 11.00) return 'D+';
  if (average >= 10.00) return 'D';
  return 'F';
}
```

### Examples

- Average: 18.50 → Mention: **A++**
- Average: 17.25 → Mention: **A+**
- Average: 16.80 → Mention: **A**
- Average: 13.82 → Mention: **C+**
- Average: 10.50 → Mention: **D**
- Average: 9.80 → Mention: **F**

---

## Credits Calculation

### Credits Earned per TU

```
If TU is validated (V or V-C):
  Credits Earned = TU Credits
Else:
  Credits Earned = 0
```

### Total Semester Credits

```
Total Credits Earned = Σ(Credits for validated TUs)
```

### Example

**Semester 5 (30 credits total)**

| TU | Credits | Status | Credits Earned |
|----|---------|--------|----------------|
| Renewable Energy IV | 3 | V | 3 |
| Power Systems III | 4 | V | 4 |
| Digital Electronics II | 3 | V-C | 3 |
| Mathematics V | 2 | V | 2 |
| English III | 2 | V | 2 |
| Professional Skills | 2 | NV | 0 |

**Total Credits Earned**: 3 + 4 + 3 + 2 + 2 + 0 = **14 credits**

---

## Implementation Examples

### JavaScript/Node.js Implementation

```javascript
// TUE Final Grade Calculation
function calculateTUEFinalGrade(presenceGrade, participationGrade, evaluationGrades) {
  // Calculate evaluations average
  let evaluationsSum = 0;
  for (const eval of evaluationGrades) {
    evaluationsSum += (eval.grade * eval.coefficient) / 100;
  }
  
  // Calculate final grade
  const finalGrade = (presenceGrade * 0.05) + 
                     (participationGrade * 0.05) + 
                     (evaluationsSum * 0.90);
  
  // Round to 2 decimals
  return Math.round(finalGrade * 100) / 100;
}

// TU Average Calculation
function calculateTUAverage(tueGrades) {
  let totalWeightedGrade = 0;
  let totalCredits = 0;
  
  for (const tue of tueGrades) {
    totalWeightedGrade += tue.grade * tue.credits;
    totalCredits += tue.credits;
  }
  
  const average = totalWeightedGrade / totalCredits;
  return Math.round(average * 100) / 100;
}

// TU Validation
function validateTU(tuAverage, semesterAverage, compensationUsed) {
  if (tuAverage >= 8.00) {
    return 'V';
  } else if (tuAverage < 6.00) {
    return 'NV';
  } else {
    // 6.00 <= tuAverage < 8.00
    if (semesterAverage >= 10.00 && !compensationUsed) {
      return 'V-C';
    } else {
      return 'NV';
    }
  }
}

// Semester Average Calculation
function calculateSemesterAverage(tuResults) {
  let totalWeightedAverage = 0;
  let totalCredits = 0;
  
  for (const tu of tuResults) {
    totalWeightedAverage += tu.average * tu.credits;
    totalCredits += tu.credits;
  }
  
  const average = totalWeightedAverage / totalCredits;
  return Math.round(average * 100) / 100;
}

// Mention Calculation
function calculateMention(average) {
  if (average >= 18.00) return 'A++';
  if (average >= 17.00) return 'A+';
  if (average >= 16.00) return 'A';
  if (average >= 15.00) return 'B+';
  if (average >= 14.00) return 'B';
  if (average >= 13.00) return 'C+';
  if (average >= 12.00) return 'C';
  if (average >= 11.00) return 'D+';
  if (average >= 10.00) return 'D';
  return 'F';
}

// Credits Calculation
function calculateCreditsEarned(tuResults) {
  let creditsEarned = 0;
  
  for (const tu of tuResults) {
    if (tu.validationStatus === 'V' || tu.validationStatus === 'V-C') {
      creditsEarned += tu.credits;
    }
  }
  
  return creditsEarned;
}
```

---

## Rounding Rules

All calculations follow these rounding rules:

1. **Intermediate Calculations**: Keep full precision
2. **Final Results**: Round to 2 decimal places
3. **Rounding Method**: Standard rounding (0.5 rounds up)

**Examples:**
- 15.894 → 15.89
- 15.895 → 15.90
- 15.904 → 15.90
- 15.905 → 15.91

---

**Document Version**: 1.0  
**Last Updated**: November 22, 2025  
**For**: BIT TMS Developers
