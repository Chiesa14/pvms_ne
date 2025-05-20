import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Vehicle = sequelize.define('Vehicle', {
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
        onDelete: 'CASCADE',
    },
    plate_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: 'user_plate_unique', // composite unique with userId
    },
    brand: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    model: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    color: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'plate_number'],
            name: 'user_plate_unique',
        },
    ],
});

export default Vehicle; 