import { AuditLog } from '../models/AuditLog.js';
import { Op } from 'sequelize';

export const auditLogController = {
    // Get all audit logs with pagination
    getAllLogs: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const { count, rows } = await AuditLog.findAndCountAll({
                limit,
                offset,
                order: [['timestamp', 'DESC']]
            });

            res.json({
                total: count,
                page,
                totalPages: Math.ceil(count / limit),
                logs: rows
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get logs for a specific table
    getTableLogs: async (req, res) => {
        try {
            const { tableName } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const { count, rows } = await AuditLog.findAndCountAll({
                where: { tableName },
                limit,
                offset,
                order: [['timestamp', 'DESC']]
            });

            res.json({
                total: count,
                page,
                totalPages: Math.ceil(count / limit),
                logs: rows
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get logs for a specific record
    getRecordLogs: async (req, res) => {
        try {
            const { tableName, recordId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const { count, rows } = await AuditLog.findAndCountAll({
                where: {
                    tableName,
                    recordId
                },
                limit,
                offset,
                order: [['timestamp', 'DESC']]
            });

            res.json({
                total: count,
                page,
                totalPages: Math.ceil(count / limit),
                logs: rows
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Search logs with filters
    searchLogs: async (req, res) => {
        try {
            const {
                tableName,
                action,
                startDate,
                endDate,
                userId
            } = req.query;

            const where = {};
            if (tableName) where.tableName = tableName;
            if (action) where.action = action;
            if (userId) where.userId = userId;
            if (startDate || endDate) {
                where.timestamp = {};
                if (startDate) where.timestamp[Op.gte] = new Date(startDate);
                if (endDate) where.timestamp[Op.lte] = new Date(endDate);
            }

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const { count, rows } = await AuditLog.findAndCountAll({
                where,
                limit,
                offset,
                order: [['timestamp', 'DESC']]
            });

            res.json({
                total: count,
                page,
                totalPages: Math.ceil(count / limit),
                logs: rows
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}; 