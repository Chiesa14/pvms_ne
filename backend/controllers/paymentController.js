import Payment from '../models/Payment.js';
import Reservation from '../models/Reservation.js';
import {
    createPaginationOptions,
    createWhereClause,
    createPaginationResponse,
    createDateRangeFilter
} from '../utils/pagination.js';

// Mock payment gateway function
const simulatePaymentGateway = async () => {
    return {
        success: true,
        transactionId: 'TXN-' + Math.floor(Math.random() * 1000000000),
    };
};

// Initiate a payment
export const initiatePayment = async (req, res) => {
    try {
        const { reservationId, paymentMethod } = req.body;
        const reservation = await Reservation.findByPk(reservationId);

        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        if (reservation.status === 'paid') {
            return res.status(400).json({ message: 'Reservation already paid' });
        }

        const payment = await Payment.create({
            userId: req.user.userId,
            reservationId: reservation.id,
            amount: reservation.amount,
            status: 'pending',
            paymentDate: new Date(),
        });

        const paymentResult = await simulatePaymentGateway();

        if (paymentResult.success) {
            payment.status = 'completed';
            payment.transactionId = paymentResult.transactionId;
            await payment.save();

            reservation.status = 'paid';
            await reservation.save();
        } else {
            payment.status = 'failed';
            await payment.save();
        }

        res.status(200).json({
            message: payment.status === 'completed' ? 'Payment successful' : 'Payment failed',
            payment,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { transactionId } = req.body;

        const payment = await Payment.findOne({ where: { transactionId } });

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        res.status(200).json({ payment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user's payments
export const getUserPayments = async (req, res) => {
    try {
        const { page, limit, offset } = createPaginationOptions(req.query);

        const where = createWhereClause(req.query, {
            searchFields: ['status', 'transactionId'],
            statusField: 'status'
        });

        where.userId = req.user.userId;

        // Add date range filter for paymentDate
        const dateFilter = createDateRangeFilter(req.query, 'paymentDate');
        if (Object.keys(dateFilter).length > 0) {
            Object.assign(where, dateFilter);
        }

        const { count, rows } = await Payment.findAndCountAll({
            where,
            limit,
            offset,
            order: [['paymentDate', 'DESC']],
            include: [
                {
                    model: Reservation,
                    as: 'reservation',
                    attributes: ['startTime', 'endTime', 'status'],
                }
            ]
        });

        res.json(createPaginationResponse(count, page, limit, rows));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all payments (admin only)
export const getAllPayments = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const { page, limit, offset } = createPaginationOptions(req.query);

        const where = createWhereClause(req.query, {
            searchFields: ['status', 'transactionId'],
            statusField: 'status'
        });

        // Add date range filter for paymentDate
        const dateFilter = createDateRangeFilter(req.query, 'paymentDate');
        if (Object.keys(dateFilter).length > 0) {
            Object.assign(where, dateFilter);
        }

        const { count, rows } = await Payment.findAndCountAll({
            where,
            limit,
            offset,
            order: [['paymentDate', 'DESC']],
            include: [
                {
                    model: Reservation,
                    as: 'reservation',
                    attributes: ['startTime', 'endTime', 'status'],
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['firstName', 'lastName', 'email'],
                }
            ]
        });

        res.json(createPaginationResponse(count, page, limit, rows));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};