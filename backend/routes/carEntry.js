import express from 'express';
import { authenticateToken } from '../middleware/authMidleware.js';
import {
    registerCarEntry,
    registerCarExit,
    listCarEntries
} from '../controllers/carEntryController.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CarEntry:
 *       type: object
 *       required:
 *         - plate_number
 *         - parking_code
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the car entry
 *         ticket_number:
 *           type: string
 *           description: Unique ticket number for the entry
 *         plate_number:
 *           type: string
 *           description: Vehicle's plate number
 *         parking_code:
 *           type: string
 *           description: Code of the parking slot
 *         entry_time:
 *           type: string
 *           format: date-time
 *           description: Time when the vehicle entered
 *         exit_time:
 *           type: string
 *           format: date-time
 *           description: Time when the vehicle exited
 *         amount:
 *           type: number
 *           description: Amount charged for parking
 */

/**
 * @swagger
 * /api/car-entries:
 *   get:
 *     summary: Get all car entries
 *     description: Retrieve a list of all car entries with pagination
 *     tags: [Car Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for plate number or parking code
 *     responses:
 *       200:
 *         description: List of car entries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 entries:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CarEntry'
 *   post:
 *     summary: Create a new car entry
 *     description: Register a new vehicle entry into the parking system
 *     tags: [Car Entries]
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
 *               - parking_code
 *             properties:
 *               plate_number:
 *                 type: string
 *               parking_code:
 *                 type: string
 *     responses:
 *       201:
 *         description: Car entry created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 entry:
 *                   $ref: '#/components/schemas/CarEntry'
 */

/**
 * @swagger
 * /api/car-entries/{id}/exit:
 *   put:
 *     summary: Register car exit
 *     description: Record the exit time, calculate the parking fee, and send the receipt via email
 *     tags: [Car Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Car entry ID
 *     responses:
 *       200:
 *         description: Exit registered successfully and receipt sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 bill:
 *                   type: object
 *                   properties:
 *                     duration_hours:
 *                       type: number
 *                     amount:
 *                       type: number
 *                 entry:
 *                   $ref: '#/components/schemas/CarEntry'
 *                 emailSent:
 *                   type: boolean
 *                   description: Whether the receipt email was sent successfully
 */

// Routes
router.get('/', authenticateToken, listCarEntries);
router.post('/', authenticateToken, registerCarEntry);
router.put('/:id/exit', authenticateToken, registerCarExit);

export default router; 