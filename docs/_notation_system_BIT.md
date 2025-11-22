# 🎓 SYSTÈME DE NOTATION ET CALCUL - BURKINA INSTITUTE OF TECHNOLOGY (BIT)

**Document de référence pour la conception du système de gestion académique**

---

## 📚 1. SYSTÈME MODULAIRE HIÉRARCHIQUE

### 1.1 Vue d'ensemble de la hiérarchie

Le système académique de BIT est organisé en 4 niveaux hiérarchiques imbriqués :

```
FILIÈRE / PROMOTION
    ↓
SEMESTRE (6 par Licence)
    ↓
TU (Teaching Unit / Unité d'Enseignement)
    ↓
TUE (Teaching Unit Element / Module / Cours)
```

---

## 🏛️ 2. NIVEAU 1 : FILIÈRE & PROMOTION

### 2.1 Filières disponibles

BIT propose actuellement **3 filières de Licence** en ingénierie :
- **Electrical Engineering & Renewable Energies (EE)**
- **Computer Science (CS)**
- **Mechanical Engineering (ME)**

Plus un **Master en Intelligence Artificielle**.

### 2.2 Promotions

Une promotion représente une cohorte d'étudiants pour une année académique donnée dans une filière spécifique.

**Attributs :**
- Année académique (ex: "2023-2024")
- Niveau (L1, L2, L3, M1, M2)
- Filière

**Exemple :** Promotion L2 Electrical Engineering 2023-2024

---

## 📅 3. NIVEAU 2 : SEMESTRE

### 3.1 Organisation

Chaque **Licence** (Bac+3) est composée de **6 semestres** :
- **L1** : Semestre 1 (S1) + Semestre 2 (S2)
- **L2** : Semestre 3 (S3) + Semestre 4 (S4)
- **L3** : Semestre 5 (S5) + Semestre 6 (S6)

### 3.2 Caractéristiques d'un semestre

- **Durée** : ~15 semaines d'enseignement
- **Nombre de TU** : 4 à 6 TU par semestre
- **Crédits totaux** : Généralement 30 crédits ECTS par semestre (60 par an)

### 3.3 Particularités par filière

Chaque filière a ses propres semestres avec des TU spécifiques à la discipline.

**Exemple Semestre 5 (L3S5) - Electrical Engineering :**
- TU1 : Ethics and Management
- TU2 : Storage
- TU3 : Telecommunications and Systems
- TU4 : Renewable Energy IV
- TU5 : Electrical Networks and Smart Grids

---

## 📦 4. NIVEAU 3 : TU (TEACHING UNIT / UNITÉ D'ENSEIGNEMENT)

### 4.1 Définition

Une **TU (Teaching Unit)** est un **regroupement thématique cohérent** de plusieurs modules (TUE) autour d'une discipline ou d'un domaine de compétences.

### 4.2 Caractéristiques

**Attributs :**
- Code unique (ex: "TU_L3S5_01")
- Nom (ex: "Renewable Energy IV")
- Crédits ECTS : 2 à 4 crédits
- Semestre d'appartenance
- Liste des TUE qui la composent

**Propriétés calculées :**
- Moyenne de la TU (agrégation des notes des TUE)
- Statut de validation (V / NV / V-C)
- Crédits acquis (0 si non validée, valeur des crédits si validée)

### 4.3 Composition typique

Une TU contient généralement **1 à 4 TUE** :
- **TU simple** : 1 seul TUE (ex: "Storage" → "Energy storage technologies")
- **TU complexe** : 3-4 TUE (ex: "Renewable Energy IV" → 3 modules)

### 4.4 Exemple concret

```
TU : "Renewable Energy IV" (4 crédits)
├── TUE1 : Solar thermal energy (2 crédits)
├── TUE2 : Solar thermal energy project (1 crédit)
└── TUE3 : Signals and systems (1 crédit)
```

---

## 📖 5. NIVEAU 4 : TUE (TEACHING UNIT ELEMENT / MODULE / COURS)

### 5.1 Définition

Un **TUE (Teaching Unit Element)** est le **cours réel** dispensé par un ou plusieurs professeurs. C'est à ce niveau que les étudiants sont évalués et notés.

### 5.2 Caractéristiques

**Attributs :**
- Code unique (ex: "EE_L3_REN401")
- Nom (ex: "Solar thermal energy")
- Crédits ECTS : 1 à 4 crédits
- TU parente
- Professeur(s) assigné(s)
- Volume horaire (cours magistraux + TD + TP)

**Note finale :** Note sur 20 calculée selon les composantes d'évaluation (voir section 6)

### 5.3 Association avec les professeurs

- Un TUE peut avoir **1 ou plusieurs professeurs** (co-enseignement)
- Un professeur peut enseigner **plusieurs TUE**
- Seuls les professeurs assignés à un TUE peuvent saisir/modifier les notes de ce TUE

---

## 📊 6. SYSTÈME DE NOTATION D'UN TUE (MODULE)

### 6.1 Composantes de la note finale

La **note finale d'un TUE** (sur 20) est calculée selon la formule suivante :

```
Note TUE = (Présence × 5%) + (Participation × 5%) + (Évaluations × 90%)
```

**Répartition des pondérations :**
| Composante | Pondération | Note sur |
|------------|-------------|----------|
| **Présence** | 5% | 20 |
| **Participation** | 5% | 20 |
| **Évaluations** (Devoirs/Projets/Examens) | 90% | 20 |

---

### 6.2 Présence (5%)


**Contribution à la note finale :**
```
Contribution Présence = 17.33 × 5% = 0.87 points
```

---

### 6.3 Participation (5%)

**Évaluation de la participation :**

La participation est notée **subjectivement par le professeur** sur 20 en fonction de :
- Interventions pertinentes en classe
- Participation aux discussions
- Engagement dans les travaux de groupe
- Qualité des questions posées

**Contribution à la note finale :**
```
Contribution Participation = Note Participation × 5%
```

**Exemple :**
- Note Participation = 15/20
- Contribution = 15 × 5% = 0.75 points

**Règles de gestion :**
- Note saisie par le professeur
- Par défaut : 10/20 si non renseignée

---

### 6.4 Évaluations : Devoirs, Projets, Examens (90%)

#### 6.4.1 Types d'évaluations

Un TUE peut comporter **plusieurs évaluations** de différents types :
- **Devoir surveillé (DS)** : Examen écrit en temps limité
- **Devoir maison (DM)** : Travail à rendre
- **Projet** : Travail pratique ou de recherche
- **Examen final** : Évaluation sommative de fin de semestre
- **Contrôle continu (CC)** : Plusieurs petites évaluations
- **TP (Travaux Pratiques)** : Évaluations pratiques
- **Exposé/Présentation** : Évaluation orale

#### 6.4.2 Pondération flexible des évaluations

Chaque évaluation possède son **propre coefficient** (pourcentage) qui doit totaliser **100%** pour l'ensemble des évaluations du TUE.

**Exemple 1 : TUE avec 3 évaluations**

```
TUE : "Solar thermal energy"

Évaluation 1 : Devoir surveillé (DS1)     → 30%
Évaluation 2 : Projet                     → 40%
Évaluation 3 : Examen final               → 30%
                                    TOTAL = 100%
```

**Calcul :**
```
Note Évaluations = (DS1 × 30% + Projet × 40% + Examen × 30%)
```

Si étudiant obtient : DS1 = 14/20, Projet = 16/20, Examen = 12/20
```
Note Évaluations = (14 × 0.30) + (16 × 0.40) + (12 × 0.30)
                 = 4.2 + 6.4 + 3.6
                 = 14.2/20
```

**Exemple 2 : TUE avec 5 évaluations**

```
TUE : "Computer Networks"

Évaluation 1 : CC1 (Contrôle continu)     → 15%
Évaluation 2 : CC2 (Contrôle continu)     → 15%
Évaluation 3 : TP (Travaux pratiques)     → 20%
Évaluation 4 : Projet                     → 25%
Évaluation 5 : Examen final               → 25%
                                    TOTAL = 100%
```

#### 6.4.3 Configuration par le professeur

Le professeur doit **configurer au début du semestre** :
1. Le nombre d'évaluations pour son TUE
2. Le type de chaque évaluation
3. Le coefficient (%) de chaque évaluation


**Contrainte système :** La somme des coefficients doit égaler 100%

#### 6.4.4 Contribution des évaluations à la note finale TUE

```
Contribution Évaluations = Note Évaluations × 90%
```

**Exemple (suite exemple 1) :**
```
Note Évaluations = 14.2/20
Contribution = 14.2 × 90% = 12.78 points
```

---

### 6.5 Calcul complet de la note finale d'un TUE

**Formule complète :**

```
Note Finale TUE = (Note Présence × 5%) 
                + (Note Participation × 5%) 
                + (Note Évaluations × 90%)
```

**Exemple complet :**

```
TUE : "Solar thermal energy"

Composante          | Note /20 | Pondération | Contribution
--------------------|----------|-------------|-------------
Présence            | 17.33    | 5%          | 0.87
Participation       | 15.00    | 5%          | 0.75
Évaluations         | 14.20    | 90%         | 12.78
                                        TOTAL = 14.40/20

→ Note finale TUE = 14.40/20
```

---

### 6.6 Règles de gestion des notes TUE

#### 6.6.1 Notes manquantes

- **Présence non enregistrée** : Par défaut 0/20
- **Participation non saisie** : Par défaut 10/20
- **Évaluation non notée** : Étudiant considéré absent → 0/20


#### 6.6.2 Notes limites

- Toutes les notes sont comprises entre **0 et 20**
- Précision : **2 décimales** (ex: 14.75/20)
- Arrondissement : **au centième près**

#### 6.6.3 Modification des notes

- Toute modification est **tracée** (historique)
- Seul l'admin peut modifier des notes déjà saisies 

---

## 🧮 7. CALCUL DE LA MOYENNE D'UNE TU

### 7.1 Principe

La **moyenne d'une TU** est la **moyenne pondérée** des notes finales des TUE qui la composent, pondérée par les crédits de chaque TUE.

### 7.2 Formule

```
Moyenne TU = Σ(Note TUE × Crédits TUE) / Σ(Crédits TUE)
```

### 7.3 Exemple

```
TU : "Renewable Energy IV" (4 crédits total)

TUE                            | Note | Crédits | Produit
-------------------------------|------|---------|--------
Solar thermal energy           | 14.40| 2       | 28.80
Solar thermal project          | 16.00| 1       | 16.00
Signals and systems            | 13.00| 1       | 13.00
                                      TOTAL     | 57.80

Moyenne TU = 57.80 / (2+1+1) = 57.80 / 4 = 14.45/20
```

### 7.4 Règles de gestion

- Si un TUE n'a pas de note (étudiant n'a passé aucune évaluation) : considéré comme 0/20
- La moyenne TU est calculée **automatiquement** après saisie de toutes les notes des TUE
- Précision : **2 décimales**

---

## ✅ 8. VALIDATION D'UNE TU

### 8.1 Règle de validation

Une TU est **validée (V)** si et seulement si :

```
Moyenne TU ≥ 8.00/20
```

**Statuts possibles :**
- **V** : Validée (moyenne ≥ 8.00)
- **NV** : Non Validée (moyenne < 8.00)
- **V-C** : Validée par Compensation (voir section 8.3)

### 8.2 Conséquences de la validation

#### TU Validée (V)
- Statut : **V**
- Crédits acquis : **Totalité des crédits de la TU**
- Exemple : TU de 4 crédits validée → +4 crédits acquis

#### TU Non Validée (NV)
- Statut : **NV**
- Crédits acquis : **0 crédit**
- Exemple : TU de 4 crédits avec moyenne 7.5 → 0 crédits acquis
- Conséquence : Étudiant doit **rattraper** cette TU

### 8.3 Compensation entre TU (V-C)

La **compensation** permet de valider une TU ayant une moyenne < 8 si certaines conditions sont remplies.

**Règle de compensation :**
Une TU peut être validée par compensation (V-C) si :
1. Sa moyenne est **≥ 6.00/20** (seuil minimal)
2. La **moyenne du semestre ≥ 10.00/20**
3. Les autres TU du semestre compensent le déficit

**Exemple :**
```
Semestre 5 :
- TU1 : 14.0/20 (validée V)
- TU2 : 7.0/20 (< 8, mais ≥ 6)
- TU3 : 12.0/20 (validée V)
- Moyenne semestre : 11.0/20 (≥ 10)

→ TU2 est validée par compensation (V-C)
→ Crédits de TU2 acquis
```

**Limite de compensation :**
- Maximum **1 TU par semestre** peut être compensée
- Si moyenne TU < 6.00 : **aucune compensation possible**

---

## 📈 9. CALCUL DE LA MOYENNE SEMESTRIELLE

### 9.1 Formule

```
Moyenne Semestre = Σ(Moyenne TU × Crédits TU) / Σ(Crédits TU)
```

### 9.2 Exemple complet

```
Semestre 5 (L3S5) - Electrical Engineering

TU                          | Moyenne | Crédits | Produit
----------------------------|---------|---------|--------
Ethics and Management       | 14.17   | 3       | 42.51
Storage                     | 7.50    | 3       | 22.50
Telecommunications          | 11.50   | 3       | 34.50
Renewable Energy IV         | 14.45   | 4       | 57.80
Electrical Networks         | 9.00    | 2       | 18.00
                                     TOTAL     | 175.31

Moyenne S5 = 175.31 / (3+3+3+4+2) = 175.31 / 15 = 11.69/20
```

### 9.3 Calcul des crédits acquis

```
Pour chaque TU du semestre :
    Si TU validée (V ou V-C) → Crédits acquis += Crédits TU
    Si TU non validée (NV) → Crédits acquis += 0

Total crédits acquis Semestre = Somme des crédits des TU validées
```

**Exemple (suite) :**
```
TU1 (3 crédits) : 14.17 → V → +3 crédits
TU2 (3 crédits) : 7.50  → NV → +0 crédits
TU3 (3 crédits) : 11.50 → V → +3 crédits
TU4 (4 crédits) : 14.45 → V → +4 crédits
TU5 (2 crédits) : 9.00  → V → +2 crédits

Total crédits acquis = 3 + 0 + 3 + 4 + 2 = 12/15 crédits
```

---

## ✅ 10. VALIDATION D'UN SEMESTRE

### 10.1 Règle de validation stricte

Un semestre est **validé** si et seulement si **DEUX conditions** sont remplies :

```
1. Moyenne Semestre ≥ 10.00/20
   ET
2. Toutes les TU ≥ 8.00/20 (ou validées par compensation)
```

### 10.2 Statuts possibles

- **VALIDATED** : Semestre validé
- **NOT VALIDATED** : Semestre non validé
- **ADJOURNED** : Ajourné (en attente de rattrapage)

### 10.3 Exemples de validation

#### Exemple 1 : Semestre VALIDÉ ✅
```
Moyenne semestre : 11.69/20 (≥ 10) ✓
TU1 : 14.17 (≥ 8) ✓
TU2 : 8.50 (≥ 8) ✓
TU3 : 11.50 (≥ 8) ✓
TU4 : 14.45 (≥ 8) ✓
TU5 : 9.00 (≥ 8) ✓

→ SEMESTRE VALIDÉ
→ 15/15 crédits acquis
```

#### Exemple 2 : Semestre NON VALIDÉ ❌ (TU insuffisante)
```
Moyenne semestre : 11.50/20 (≥ 10) ✓
TU1 : 14.00 (≥ 8) ✓
TU2 : 7.50 (< 8) ✗  ← PROBLÈME
TU3 : 12.00 (≥ 8) ✓
TU4 : 14.00 (≥ 8) ✓

→ SEMESTRE NON VALIDÉ (même si moyenne ≥ 10)
→ 12/15 crédits acquis (TU2 non validée)
→ Étudiant doit rattraper TU2
```

#### Exemple 3 : Semestre NON VALIDÉ ❌ (Moyenne insuffisante)
```
Moyenne semestre : 9.80/20 (< 10) ✗  ← PROBLÈME
TU1 : 10.00 (≥ 8) ✓
TU2 : 9.50 (≥ 8) ✓
TU3 : 8.00 (≥ 8) ✓
TU4 : 11.00 (≥ 8) ✓

→ SEMESTRE NON VALIDÉ (même si toutes TU ≥ 8)
→ 15/15 crédits acquis MAIS semestre non validé globalement
```

### 10.4 Conséquences

**Semestre validé :**
- Progression vers semestre suivant
- Crédits définitivement acquis
- Bulletin officiel émis

**Semestre non validé :**
- **Session de rattrapage** (examens de 2ème session)
- Ou **redoublement** du semestre
- Maximum 2 redoublements durant la Licence

---

## 🏆 11. ATTRIBUTION DES MENTIONS

### 11.1 Barème des mentions

Les mentions sont attribuées selon la **moyenne semestrielle** ou **annuelle** :

| Mention | Intervalle | Signification |
|---------|------------|---------------|
| **F** | < 10.00 | Fail (Échoué) |
| **D** | 10.00 ≤ x < 11.00 | Passable |
| **D+** | 11.00 ≤ x < 12.00 | Passable+ |
| **C** | 12.00 ≤ x < 13.00 | Fairly Good (Assez Bien) |
| **C+** | 13.00 ≤ x < 14.00 | Fairly Good+ |
| **B** | 14.00 ≤ x < 15.00 | Good (Bien) |
| **B+** | 15.00 ≤ x < 16.00 | Good+ |
| **A** | 16.00 ≤ x < 17.00 | Very Good (Très Bien) |
| **A+** | 17.00 ≤ x < 18.00 | Very Good+ |
| **A++** | ≥ 18.00 | Excellent |

### 11.2 Exemples

```
Moyenne 11.69/20 → Mention D+
Moyenne 14.50/20 → Mention B
Moyenne 17.80/20 → Mention A+
Moyenne 9.50/20 → Mention F
```

### 11.3 Mentions pour le bulletin

- **Mention semestrielle** : Basée sur moyenne du semestre
- **Mention annuelle** : Basée sur moyenne de l'année (2 semestres)
- **Mention de Licence** : Basée sur moyenne générale des 6 semestres

---

## 📊 12. CALCUL DE LA MOYENNE ANNUELLE

### 12.1 Structure

Une **année académique** = 2 semestres consécutifs
- L1 = S1 + S2
- L2 = S3 + S4
- L3 = S5 + S6

### 12.2 Formule

```
Moyenne Annuelle = (Moyenne S1 × Crédits S1 + Moyenne S2 × Crédits S2) 
                   / (Crédits S1 + Crédits S2)
```

### 12.3 Exemple

```
Année L3 (2023-2024) - Electrical Engineering

Semestre 5 : Moyenne = 11.69/20 | Crédits = 15
Semestre 6 : Moyenne = 13.20/20 | Crédits = 15

Moyenne L3 = (11.69 × 15 + 13.20 × 15) / (15 + 15)
           = (175.35 + 198.00) / 30
           = 373.35 / 30
           = 12.44/20

→ Mention annuelle L3 : C (Fairly Good)
```

### 12.4 Crédits annuels

```
Crédits acquis année = Crédits acquis S1 + Crédits acquis S2

Objectif : 60 crédits par an (30 par semestre)
```

### 12.5 Validation de l'année

**Règle système LMD :**
Une année est validée si :
- **Les 2 semestres sont validés**
- **Total ≥ 48 crédits acquis** sur 60 (80% minimum)

Si année non validée → Redoublement

---


## 📄 13. BULLETIN OFFICIEL (GRADE TRANSCRIPT)

### 13.1 Contenu du bulletin

Le bulletin officiel émis par BIT contient :

**En-tête :**
- Logo et nom de l'institution
- "BURKINA FASO - La Patrie ou la Mort, nous Vaincrons"
- Autorisations ministérielles

**Informations étudiant :**
- Nom et prénom(s)
- Student ID (matricule)
- Date et lieu de naissance
- Filière (Field)
- Spécialité (Speciality)
- Grade (Licence L1/L2/L3)
- Année académique

**Pour chaque semestre :**
- Numéro du semestre (ex: "5th Semester (L3S5)")
- Liste des TU avec :
  - Nom de la TU
  - Liste des TUE (modules) de cette TU avec notes
  - Crédits (TU et TUE)
  - Moyenne TU
  - Statut validation TU (V / NV / V-C)
  - Crédits acquis
- **Semester average** (moyenne semestrielle)
- **Total credits acquired** (crédits acquis)
- **Decision for the semester** (VALIDATED / NOT VALIDATED / ADJOURNED)

**Résumé annuel :**
- **Annual Average** (moyenne annuelle)
- **Annual Result** (résultat de l'année)
- **Rating** (mention)
- **Total credits acquired** (crédits totaux acquis)

**Pied de page :**
- Notes explicatives (règles de validation)
- Barème des mentions
- Lieu, date d'émission
- Signature du Directeur Académique

### 14.2 Notes importantes sur le bulletin

Le bulletin comporte les mentions suivantes :

**Description des codes :**
- **V** : TU Validated (TU Validée)
- **NV** : TU Not Validated (TU Non Validée)
- **V-C** : TU Validated by Compensation (TU Validée par Compensation)

**Règles de validation :**
- "A semester is validated if and only if the semester average ≥ 10 and the average of each TU ≥ 08"

**Avertissements :**
- "Any deletion or overload causes the invalidity of this document"
- "Only one transcript is issued. It is up to the interested party to make certified copies"

---

## 🔄 15. FLUX DE CALCUL AUTOMATIQUE

### 15.1 Déclenchement des calculs

Les calculs sont effectués **en cascade** et peuvent être déclenchés :
1. **Automatiquement** après saisie/modification d'une note TUE
2. **Manuellement** par l'administrateur ou le directeur académique
3. **En batch** à la fin du semestre pour tous les étudiants

### 15.2 Ordre des calculs

```
1. Note TUE = (Présence × 5%) + (Participation × 5%) + (Évaluations × 90%)
       ↓
2. Moyenne TU = Moyenne pondérée des notes TUE (par crédits TUE)
       ↓
3. Validation TU = V si moyenne ≥ 8, sinon NV (ou V-C si compensation)
       ↓
4. Crédits TU acquis = Crédits TU si validée, sinon 0
       ↓
5. Moyenne Semestre = Moyenne pondérée des moyennes TU (par crédits TU)
       ↓
6. Total crédits Semestre acquis = Somme des crédits TU validées
       ↓
7. Validation