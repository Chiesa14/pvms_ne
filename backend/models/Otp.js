import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Otp = sequelize.define('Otp', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    timestamps: true,
});

export default Otp; 