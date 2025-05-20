// config/db.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(process.env.POSTGRES_URI, {
    dialect: 'postgres',
    logging: false,
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({
            force: process.env.NODE_ENV === 'test', // Only force sync in test env
            alter: process.env.NODE_ENV === 'development' // Auto-alter tables in dev
        }); // Auto-create tables if they don't exist
        console.log('PostgreSQL connected and models synced successfully');
    } catch (err) {
        console.error('PostgreSQL connection error:', err);
        process.exit(1);
    }
};

export { sequelize, connectDB };
