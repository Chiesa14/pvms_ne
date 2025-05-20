import Reservation from '../models/Reservation.js';
import ParkingSlot from '../models/ParkingSlot.js';
import User from '../models/User.js';
import sendNotification from '../utils/sendNotification.js';
import { Op } from 'sequelize';
import {
    createPaginationOptions,
    createWhereClause,
    createPaginationResponse,
    createDateRangeFilter
} from '../utils/pagination.js';
import sendEmail from '../utils/sendEmail.js';
import Vehicle from '../models/vehicle.js';

export const createReservation = async (req, res) => {
    try {
        const { slotId, startTime, endTime, vehicleId } = req.body;

        if (!slotId || !startTime || !endTime || !vehicleId) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (new Date(startTime) >= new Date(endTime)) {
            return res.status(400).json({ message: 'End time must be after start time' });
        }

        // Check if slot exists and is available
        const existingSlot = await ParkingSlot.findByPk(slotId);
        if (!existingSlot) {
            return res.status(404).json({ message: 'Parking slot not found' });
        }

        if (existingSlot.status !== 'available') {
            return res.status(409).json({ message: 'Parking slot is not available' });
        }

        // Check for overlapping reservation
        const overlapping = await Reservation.findOne({
            where: {
                slotId,
                status: 'active',
                [Op.or]: [
                    {
                        startTime: { [Op.lt]: endTime },
                        endTime: { [Op.gt]: startTime }
                    }
                ]
            }
        });

        if (overlapping) {
            return res.status(409).json({ message: 'Slot already reserved for this time' });
        }

        const reservation = await Reservation.create({
            userId: req.user.userId,
            slotId,
            startTime,
            endTime,
            status: 'pending',
            vehicleId,
        });

        // Update slot status to reserved
        await existingSlot.update({ status: 'reserved' });

        // Notify all admins
        try {
            const admins = await User.findAll({ where: { role: 'admin' } });
            for (const admin of admins) {
                await sendNotification(admin.dataValues.id, `New reservation request from user #${req.user.userId}`, 'reservation');
            }
        } catch (notificationError) {
            console.error('Failed to send notifications:', notificationError);
            // Don't fail the request if notifications fail
        }

        // Return the created reservation with slot details
        const createdReservation = await Reservation.findByPk(reservation.id, {
            include: [
                {
                    model: ParkingSlot,
                    as: 'slot',
                    attributes: ['slotNumber', 'floor', 'type', 'status'],
                }
            ]
        });

        res.status(201).json(createdReservation);
    } catch (error) {
        console.error('Reservation creation error:', error);
        res.status(500).json({
            message: 'Error creating reservation',
            error: error.message
        });
    }
};

export const getUserReservations = async (req, res) => {
    try {
        const { page, limit, offset } = createPaginationOptions(req.query);

        const where = createWhereClause(req.query, {
            searchFields: ['status'],
            statusField: 'status'
        });

        where.userId = req.user.userId;

        const { count, rows } = await Reservation.findAndCountAll({
            where,
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: ParkingSlot,
                    as: 'slot',
                    attributes: ['slotNumber', 'floor', 'type', 'status'],
                },
                {
                    model: Vehicle,
                    as: 'vehicle',
                    attributes: ['type', 'licensePlate', 'brand', 'model', 'color'],
                }
            ]
        });

        res.json(createPaginationResponse(count, page, limit, rows));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const cancelReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findOne({
            where: {
                id: req.params.id,
                userId: req.user.userId,
            },
            include: [
                {
                    model: ParkingSlot,
                    as: 'slot',
                    attributes: ['slotNumber', 'floor', 'type'],
                }
            ]
        });

        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        reservation.status = 'cancelled';
        await reservation.save();

        try {
            await sendNotification(req.user.userId, 'Your reservation was successfully cancelled!', 'reservation');
        } catch (notificationError) {
            console.error('Failed to send cancellation notification:', notificationError);
            // Don't fail the request if notification fails
        }

        res.status(200).json({
            message: 'Reservation cancelled successfully',
            reservation
        });
    } catch (error) {
        console.error('Cancellation error:', error);
        res.status(500).json({
            message: 'Error cancelling reservation',
            error: error.message
        });
    }
};

// Admin: acknowledge reservation
export const acknowledgeReservation = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const reservation = await Reservation.findByPk(req.params.id, {
            include: [
                { model: User, as: 'user', attributes: ['email', 'firstName', 'lastName'] },
                { model: ParkingSlot, as: 'slot', attributes: ['slotNumber', 'floor', 'type'] },
                { model: Vehicle, as: 'vehicle', attributes: ['type', 'licensePlate', 'brand', 'model', 'color'] },
            ]
        });
        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
        reservation.status = 'active';
        await reservation.save();

        // Calculate duration and price
        const start = new Date(reservation.startTime);
        const end = new Date(reservation.endTime);
        const durationHours = Math.ceil((end - start) / (1000 * 60 * 60));
        const vehicleType = reservation.vehicle?.type || 'car';
        const priceMap = { motorcycle: 500, bus: 1000, car: 800, truck: 1500 };
        const pricePerHour = priceMap[vehicleType] || 800;
        const totalPrice = durationHours * pricePerHour;

        // Send email
        const emailText = `
Hello ${reservation.user?.firstName || ''},

Your parking reservation has been approved!

Slot: ${reservation.slot?.slotNumber}
Vehicle type: ${vehicleType}
Duration: ${durationHours} hour(s)
Price per hour: ${pricePerHour}
Total price: ${totalPrice}

Start: ${start.toLocaleString()}
End: ${end.toLocaleString()}

Thank you for using our service!
        `;
        if (reservation.user?.email) {
            await sendEmail(reservation.user.email, 'Your Parking Ticket', emailText);
        }

        await sendNotification(reservation.userId, 'Your reservation was acknowledged by admin.', 'reservation');
        res.json({ message: 'Reservation acknowledged', reservation, ticket: { durationHours, vehicleType, pricePerHour, totalPrice } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: revoke reservation
export const revokeReservation = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const reservation = await Reservation.findByPk(req.params.id);
        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
        reservation.status = 'revoked';
        await reservation.save();
        await sendNotification(reservation.userId, 'Your reservation was revoked by admin.', 'reservation');
        res.json({ message: 'Reservation revoked', reservation });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all reservations (admin only)
export const getAllReservations = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const { page, limit, offset } = createPaginationOptions(req.query);

        const where = createWhereClause(req.query, {
            searchFields: ['status'],
            statusField: 'status'
        });

        // Add date range filter for startTime
        const dateFilter = createDateRangeFilter(req.query, 'startTime');
        if (Object.keys(dateFilter).length > 0) {
            Object.assign(where, dateFilter);
        }

        const { count, rows } = await Reservation.findAndCountAll({
            where,
            limit,
            offset,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['firstName', 'lastName', 'email'],
                },
                {
                    model: ParkingSlot,
                    as: 'slot',
                    attributes: ['slotNumber', 'floor', 'type'],
                },
                {
                    model: Vehicle,
                    as: 'vehicle',
                    attributes: ['type', 'licensePlate', 'brand', 'model', 'color'],
                }
            ],
            order: [['createdAt', 'DESC']],
        });

        res.json(createPaginationResponse(count, page, limit, rows));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
