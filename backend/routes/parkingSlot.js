import express from 'express';
import {
    createSlot,
    getAllSlots,
    getSlotById,
    updateSlot,
    deleteSlot,
} from '../controllers/parkingSlotController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMidleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ParkingSlots
 *   description: Parking slot management
 */

/**
 * @swagger
 * /api/slots:
 *   get:
 *     summary: Get all parking slots
 *     tags: [ParkingSlots]
 *     responses:
 *       200:
 *         description: List of slots
 */
router.get('/', getAllSlots);

/**
 * @swagger
 * /api/slots:
 *   post:
 *     summary: Create a parking slot
 *     tags: [ParkingSlots]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *               - available_spaces
 *               - location
 *               - fee_per_hour
 *             properties:
 *               code:
 *                 type: string
 *                 example: "A1"
 *               name:
 *                 type: string
 *                 example: "Main Lot A1"
 *               available_spaces:
 *                 type: integer
 *                 example: 10
 *               location:
 *                 type: string
 *                 example: "Downtown"
 *               fee_per_hour:
 *                 type: number
 *                 format: float
 *                 example: 2.5
 *     responses:
 *       201:
 *         description: Parking slot created
 *       400:
 *         description: Invalid input
 */
router.post('/', authenticateToken, authorizeRoles('admin'), createSlot);

/**
 * @swagger
 * /api/slots/{id}:
 *   get:
 *     summary: Get a slot by ID
 *     tags: [ParkingSlots]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Parking slot details
 *       404:
 *         description: Slot not found
 */
router.get('/:id', getSlotById);

/**
 * @swagger
 * /api/slots/{id}:
 *   put:
 *     summary: Update a parking slot
 *     tags: [ParkingSlots]
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
 *             required:
 *               - code
 *               - name
 *               - available_spaces
 *               - location
 *               - fee_per_hour
 *             properties:
 *               code:
 *                 type: string
 *                 example: "A1"
 *               name:
 *                 type: string
 *                 example: "Main Lot A1"
 *               available_spaces:
 *                 type: integer
 *                 example: 10
 *               location:
 *                 type: string
 *                 example: "Downtown"
 *               fee_per_hour:
 *                 type: number
 *                 format: float
 *                 example: 2.5
 *     responses:
 *       200:
 *         description: Parking slot updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Slot not found
 */
router.put('/:id', authenticateToken, authorizeRoles('admin'), updateSlot);

/**
 * @swagger
 * /api/slots/{id}:
 *   delete:
 *     summary: Delete a parking slot
 *     tags: [ParkingSlots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Parking slot deleted
 *       404:
 *         description: Slot not found
 */
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteSlot);

export default router;
