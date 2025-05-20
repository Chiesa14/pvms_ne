// controllers/notificationController.js
import Notification from '../models/Notification.js';
import {
    createPaginationOptions,
    createWhereClause,
    createPaginationResponse
} from '../utils/pagination.js';

export const getUserNotifications = async (req, res) => {
    try {
        const { page, limit, offset } = createPaginationOptions(req.query);

        const where = {
            userId: req.user.userId,
            ...createWhereClause(req.query, {
                searchFields: ['title', 'message'],
                statusField: 'isRead'
            })
        };

        const { count, rows } = await Notification.findAndCountAll({
            where,
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        res.json(createPaginationResponse(count, page, limit, rows));
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            message: 'Error fetching notifications',
            error: error.message
        });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByPk(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        if (notification.userId !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to update this notification' });
        }

        await notification.update({ isRead: true });
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            message: 'Error marking notification as read',
            error: error.message
        });
    }
};
