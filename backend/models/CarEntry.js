import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const CarEntry = sequelize.define('CarEntry', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    plate_number: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    parking_code: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'ParkingSlots',
            key: 'code',
        },
    },
    entry_time: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    exit_time: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    ticket_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
}, {
    timestamps: true,
    tableName: 'CarEntries',
});

export default CarEntry; 