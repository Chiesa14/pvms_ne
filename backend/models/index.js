import User from './User.js';
import ParkingSlot from './ParkingSlot.js';
import CarEntry from './CarEntry.js';
import Otp from './Otp.js';
import Vehicle from './Vehicle.js';

// Define associations
CarEntry.belongsTo(ParkingSlot, {
    foreignKey: 'parking_code',
    targetKey: 'code'
});

ParkingSlot.hasMany(CarEntry, {
    foreignKey: 'parking_code',
    sourceKey: 'code'
});

export {
    User,
    ParkingSlot,
    CarEntry,
    Otp,
    Vehicle
}; 