import { CarEntry, ParkingSlot } from '../models/index.js';
import { Op } from 'sequelize';
import { createPaginationOptions, createPaginationResponse } from '../utils/pagination.js';

/**
 * Generate a report of outgoing cars with total amount charged between two dates
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const generateOutgoingCarsReport = async (req, res) => {
    try {
        const { startDate, endDate, page = 1, limit = 10 } = req.query;

        // Validate date parameters
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required',
            });
        }

        // Set start date to beginning of day
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        // Set end date to end of day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format. Please use ISO 8601 format (YYYY-MM-DD)',
            });
        }

        if (start > end) {
            return res.status(400).json({
                success: false,
                message: 'Start date must be before end date',
            });
        }

        // Calculate pagination
        const { offset } = createPaginationOptions({ page, limit });

        // Query outgoing cars with their details
        const { count, rows: outgoingCars } = await CarEntry.findAndCountAll({
            where: {
                exit_time: {
                    [Op.between]: [start, end],
                },
            },
            include: [{
                model: ParkingSlot,
                required: true,
                attributes: ['name', 'location'],
            }],
            attributes: [
                'id',
                'plate_number',
                'ticket_number',
                'entry_time',
                'exit_time',
                'amount',
            ],
            order: [['exit_time', 'DESC']],
            limit,
            offset,
        });

        // Calculate total amount
        const totalAmount = outgoingCars.reduce((sum, car) => sum + parseFloat(car.amount), 0);

        // Prepare response
        const response = {
            success: true,
            data: {
                outgoingCars,
                summary: {
                    totalCars: count,
                    totalAmount: totalAmount.toFixed(2),
                    dateRange: {
                        start: start.toISOString(),
                        end: end.toISOString(),
                    },
                },
                pagination: createPaginationResponse(count, page, limit),
            },
        };

        res.json(response);
    } catch (error) {
        console.error('Error generating outgoing cars report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate outgoing cars report',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

/**
 * Generate a report of entered cars between two dates
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const generateEnteredCarsReport = async (req, res) => {
    try {
        const { startDate, endDate, page = 1, limit = 10 } = req.query;

        // Validate date parameters
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required',
            });
        }

        // Set start date to beginning of day
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        // Set end date to end of day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format. Please use ISO 8601 format (YYYY-MM-DD)',
            });
        }

        if (start > end) {
            return res.status(400).json({
                success: false,
                message: 'Start date must be before end date',
            });
        }

        // Calculate pagination
        const { offset } = createPaginationOptions({ page, limit });

        // Query entered cars with their details
        const { count, rows: enteredCars } = await CarEntry.findAndCountAll({
            where: {
                entry_time: {
                    [Op.between]: [start, end],
                },
            },
            include: [{
                model: ParkingSlot,
                required: true,
                attributes: ['name', 'location'],
            }],
            attributes: [
                'id',
                'plate_number',
                'ticket_number',
                'entry_time',
                'exit_time',
                'amount',
            ],
            order: [['entry_time', 'DESC']],
            limit,
            offset,
        });

        // Calculate statistics
        const totalCars = count;
        const activeCars = enteredCars.filter(car => !car.exit_time).length;
        const exitedCars = totalCars - activeCars;
        const totalRevenue = enteredCars
            .filter(car => car.exit_time)
            .reduce((sum, car) => sum + parseFloat(car.amount), 0);

        // Prepare response
        const response = {
            success: true,
            data: {
                enteredCars,
                summary: {
                    totalCars,
                    activeCars,
                    exitedCars,
                    totalRevenue: totalRevenue.toFixed(2),
                    dateRange: {
                        start: start.toISOString(),
                        end: end.toISOString(),
                    },
                },
                pagination: createPaginationResponse(count, page, limit),
            },
        };

        res.json(response);
    } catch (error) {
        console.error('Error generating entered cars report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate entered cars report',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
}; 