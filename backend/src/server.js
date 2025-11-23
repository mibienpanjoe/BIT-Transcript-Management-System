const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/database');
const logger = require('./config/logger');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const studentRoutes = require('./routes/studentRoutes');
const fieldRoutes = require('./routes/fieldRoutes');
const promotionRoutes = require('./routes/promotionRoutes');
const semesterRoutes = require('./routes/semesterRoutes');
const tuRoutes = require('./routes/tuRoutes');
const tueRoutes = require('./routes/tueRoutes');
const gradeRoutes = require('./routes/gradeRoutes');
const calculationRoutes = require('./routes/calculationRoutes');
const pdfRoutes = require('./routes/pdfRoutes');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/tus', tuRoutes);
app.use('/api/tues', tueRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/calculations', calculationRoutes);
app.use('/api/pdf', pdfRoutes);

// Basic route
app.get('/', (req, res) => {
    res.send('BIT TMS API is running...');
});

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({
        message: 'Server Error',
        error: process.env.NODE_ENV === 'production' ? {} : err.message,
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
