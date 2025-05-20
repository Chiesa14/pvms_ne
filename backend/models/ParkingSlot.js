import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const ParkingSlot = sequelize.define('ParkingSlot', {
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  available_spaces: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fee_per_hour: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  timestamps: true,
});

export default ParkingSlot;
