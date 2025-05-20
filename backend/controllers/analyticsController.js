// controllers/analyticsController.js
import User from '../models/User.js';
import Vehicle from '../models/vehicle.js';
import Reservation from '../models/Reservation.js';
import Payment from '../models/Payment.js';
import ParkingSlot from '../models/ParkingSlot.js';
import { Op } from 'sequelize';

export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.count();
        const totalVehicles = await Vehicle.count();
        const totalReservations = await Reservation.count();
        const totalRevenue = await Payment.sum('amount', { where: { status: 'completed' } });
        const totalSlots = await ParkingSlot.count();
        const occupiedSlots = await Reservation.count({ where: { status: 'active' } });

        res.json({
            totalUsers,
            totalVehicles,
            totalReservations,
            totalRevenue: totalRevenue || 0,
            occupancyRate: totalSlots > 0 ? ((occupiedSlots / totalSlots) * 100).toFixed(2) + '%' : '0%'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve dashboard analytics' });
    }
};
