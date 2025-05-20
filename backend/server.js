// server.js
import express, { json } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from './config/db.js';
import setupSwagger from './config/swagger.js';
import { initializeAdmin } from './config/initAdmin.js';
import './models/index.js'; // Import models
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import slotRoutes from './routes/parkingSlot.js';
import carEntryRoutes from './routes/carEntry.js';
import reportsRoutes from './routes/reports.js';
import vehicleRoutes from './routes/vehicle.js';

const app = express();

// Connect Database
connectDB().then(() => {
    // Initialize admin user after database connection
    initializeAdmin();
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(json());

// Swagger Docs
setupSwagger(app);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/car-entries', carEntryRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/vehicles', vehicleRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
