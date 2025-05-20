import express from 'express';
import {
    createVehicle,
    getMyVehicles,
    getAllVehicles,
    getVehicleById,
    updateVehicle,
    deleteVehicle
} from '../controllers/vehicleController.js';
import { authenticateToken } from '../middleware/authMidleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Vehicles
 *   description: User vehicle management
 */

/**
 * @swagger
 * /api/vehicles:
 *   post:
 *     summary: Register a new vehicle
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - plate_number
 *               - brand
 *               - model
 *             properties:
 *               plate_number:
 *                 type: string
 *                 example: "ABC123"
 *               brand:
 *                 type: string
 *                 example: "Toyota"
 *               model:
 *                 type: string
 *                 example: "Corolla"
 *               color:
 *                 type: string
 *                 example: "Red"
 *     responses:
 *       201:
 *         description: Vehicle registered
 *       400:
 *         description: Invalid input
 */
router.post('/', authenticateToken, createVehicle);

/**
 * @swagger
 * /api/vehicles:
 *   get:
 *     summary: Get vehicles - users see their own vehicles, admins see all vehicles
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of vehicles
 */
router.get('/', authenticateToken, (req, res, next) => {
    if (req.user.role === 'admin') return getAllVehicles(req, res, next);
    return getMyVehicles(req, res, next);
});

/**
 * @swagger
 * /api/vehicles/{id}:
 *   get:
 *     summary: Get a vehicle by ID
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vehicle details
 *       404:
 *         description: Vehicle not found
 */
router.get('/:id', authenticateToken, getVehicleById);

/**
 * @swagger
 * /api/vehicles/{id}:
 *   put:
 *     summary: Update a vehicle
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plate_number:
 *                 type: string
 *               brand:
 *                 type: string
 *               model:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: Vehicle updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Vehicle not found
 */
router.put('/:id', authenticateToken, updateVehicle);

/**
 * @swagger
 * /api/vehicles/{id}:
 *   delete:
 *     summary: Delete a vehicle
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vehicle deleted
 *       404:
 *         description: Vehicle not found
 */
router.delete('/:id', authenticateToken, deleteVehicle);

export default router; 