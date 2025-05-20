import Vehicle from '../models/Vehicle.js';
import {
    createPaginationOptions,
    createWhereClause,
    createPaginationResponse
} from '../utils/pagination.js';

export const createVehicle = async (req, res) => {
    try {
        const { plate_number, brand, model, color } = req.body;
        if (!plate_number || !brand || !model) {
            return res.status(400).json({ error: 'plate_number, brand, and model are required' });
        }
        const vehicle = await Vehicle.create({
            userId: req.user.userId,
            plate_number,
            brand,
            model,
            color,
        });
        res.status(201).json(vehicle);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Plate number must be unique for this user' });
        }
        res.status(500).json({ error: error.message });
    }
};

export const getMyVehicles = async (req, res) => {
    try {
        const { page, limit, offset } = createPaginationOptions(req.query);
        const where = createWhereClause(req.query, {
            searchFields: ['plate_number', 'brand', 'model', 'color'],
        });
        where.userId = req.user.userId;
        const { count, rows } = await Vehicle.findAndCountAll({
            where,
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });
        res.json(createPaginationResponse(count, page, limit, rows));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllVehicles = async (req, res) => {
    try {
        const { page, limit, offset } = createPaginationOptions(req.query);
        const where = createWhereClause(req.query, {
            searchFields: ['plate_number', 'brand', 'model', 'color'],
        });
        const { count, rows } = await Vehicle.findAndCountAll({
            where,
            limit,
            offset,
            order: [['createdAt', 'DESC']],
        });
        res.json(createPaginationResponse(count, page, limit, rows));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getVehicleById = async (req, res) => {
    try {
        const vehicle = await Vehicle.findByPk(req.params.id);
        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }
        // Only owner or admin can view
        if (req.user.role !== 'admin' && vehicle.userId !== req.user.userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        res.json(vehicle);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateVehicle = async (req, res) => {
    try {
        const { plate_number, brand, model, color } = req.body;
        const vehicle = await Vehicle.findByPk(req.params.id);
        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }
        if (vehicle.userId !== req.user.userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        await vehicle.update({ plate_number, brand, model, color });
        res.json(vehicle);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Plate number must be unique for this user' });
        }
        res.status(500).json({ error: error.message });
    }
};

export const deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findByPk(req.params.id);
        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }
        if (vehicle.userId !== req.user.userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        await vehicle.destroy();
        res.json({ message: 'Vehicle deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
