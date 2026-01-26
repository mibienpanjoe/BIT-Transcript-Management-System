# Quick Start Guide

Get up and running with BIT TMS in minutes!

## For Users

### First Time Login

1. **Get Your Credentials**
   - Contact your system administrator for:
     - Email address
     - Temporary password

2. **Access the System**
   - Open your web browser
   - Navigate to: `https://your-bit-tms-url.com`

3. **Login**
   - Enter your email
   - Enter your password
   - Click **Login**

4. **Change Your Password** (Recommended)
   - After first login, change your temporary password
   - Use a strong password (min 8 characters, mix of letters, numbers, symbols)

### Quick Actions by Role

#### Admin

- **Add a user**: Admin → User Management → Add New User
- **Import students**: Admin → Student Management → Import Students
- **Generate transcript**: Admin → Transcript Management → Select Student → Generate PDF

#### Teacher

- **View courses**: Teacher → My Courses
- **Enter grades**: Teacher → Grade Submission → Select TUE → Enter Grades

#### Schooling Manager

- **Enter attendance**: Manager → Attendance Management → Select TUE → Enter Attendance

---

## For Developers

### Local Development Setup

#### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Git

#### 1. Clone the Repository

```bash
git clone https://github.com/your-org/bit-tms.git
cd bit-tms
```

#### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your MongoDB URI and JWT secret
nano .env

# Start development server
npm run dev
```

Backend runs on: `http://localhost:5000`

#### 3. Frontend Setup

```bash
# Navigate to frontend (in new terminal)
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with backend URL
nano .env

# Start development server
npm run dev
```

Frontend runs on: `http://localhost:5173`

#### 4. Create Test Data

Use the provided seed script:

```bash
cd backend
npm run seed
```

This creates:

- 1 admin user (admin@bit.edu.bf / Admin123!)
- 1 teacher user (teacher@bit.edu.bf / Teacher123!)
- 1 manager user (manager@bit.edu.bf / Manager123!)
- Sample fields, promotions, and students

#### 5. Test the Application

1. Open `http://localhost:5173`
2. Login with admin credentials
3. Explore the system!

### Alternative: Docker Setup

The application is fully containerized for both development and production environments.

#### Development with Docker

To get started quickly without installing local dependencies, use the following:

```bash
docker-compose up --build
```

- **Hot-ReloadING**: Enabled via bind mounts.
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

#### Production with Docker

For a high-performance, secure production deployment:

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

- **Nginx**: Serves the frontend reliably and efficiently.
- **Security**: Runs as a non-root user with minimal exposed ports.
- **Persistence**: MongoDB data is stored in a dedicated Docker volume.

### Project Structure

```
bit-tms/
├── backend/
│   ├── src/
│   │   ├── models/          # Mongoose schemas
│   │   ├── controllers/     # Route controllers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth, error handling
│   │   ├── services/        # Business logic
│   │   └── utils/           # Helper functions
│   ├── server.js            # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   └── utils/           # Utilities
│   ├── App.jsx
│   └── package.json
└── documentation/           # This folder!
```

### Common Development Tasks

#### Run Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

#### Lint Code

```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

#### Build for Production

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

---

## Next Steps

### For Users

- Read your role-specific guide:
  - [Admin Guide](./user-guides/admin-guide.md)
  - [Teacher Guide](./user-guides/teacher-guide.md)
  - [Schooling Manager Guide](./user-guides/schooling-manager-guide.md)

### For Developers

- Review [Database Schema](./developer-docs/database-schema.md)
- Understand [Calculation Logic](./developer-docs/calculation-logic.md)
- Check [API Documentation](./developer-docs/api-documentation.md)
- Read [Deployment Guide](./developer-docs/deployment-guide.md)

---

## Getting Help

- **Users**: Contact your system administrator
- **Developers**: Check [Troubleshooting Guide](./troubleshooting.md) or [FAQ](./faq.md)

---

**Document Version**: 1.0  
**Last Updated**: November 22, 2025
