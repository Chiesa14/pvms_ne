import ParkingSlot from '../models/ParkingSlot.js';
import {
    createPaginationOptions,
    createWhereClause,
    createPaginationResponse
} from '../utils/pagination.js';

export const createSlot = async (req, res) => {
    try {
        const { code, name, available_spaces, location, fee_per_hour } = req.body;

        // Validate required fields
        if (!code || !name || available_spaces == null || !location || fee_per_hour == null) {
            return res.status(400).json({ error: 'All fields (code, name, available_spaces, location, fee_per_hour) are required' });
        }

        // Create the slot with the provided data
        const slot = await ParkingSlot.create({
            code,
            name,
            available_spaces,
            location,
            fee_per_hour
        });

        res.status(201).json(slot);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Code must be unique' });
        }
        res.status(400).json({ error: error.message });
    }
};

export const getAllSlots = async (req, res) => {
    try {
        const { page, limit, offset } = createPaginationOptions(req.query);

        const where = createWhereClause(req.query, {
            searchFields: ['code', 'name', 'location'],
        });

        const { count, rows } = await ParkingSlot.findAndCountAll({
            where,
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        res.json(createPaginationResponse(count, page, limit, rows));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch parking slots' });
    }
};

export const getSlotById = async (req, res) => {
    try {
        const slot = await ParkingSlot.findByPk(req.params.id);
        if (!slot) {
            return res.status(404).json({ error: 'Slot not found' });
        }
        res.json(slot);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch parking slot' });
    }
};

export const updateSlot = async (req, res) => {
    try {
        const { code, name, available_spaces, location, fee_per_hour } = req.body;
        const slot = await ParkingSlot.findByPk(req.params.id);

        if (!slot) {
            return res.status(404).json({ error: 'Slot not found' });
        }

        // Update the slot
        await slot.update({
            code,
            name,
            available_spaces,
            location,
            fee_per_hour
        });

        res.json(slot);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Code must be unique' });
        }
        res.status(400).json({ error: error.message });
    }
};

export const deleteSlot = async (req, res) => {
    try {
        const slot = await ParkingSlot.findByPk(req.params.id);
        if (!slot) {
            return res.status(404).json({ error: 'Slot not found' });
        }

        await slot.destroy();
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete parking slot' });
    }
};
