import express from 'express';
import { generateOutgoingCarsReport, generateEnteredCarsReport } from '../controllers/reportsController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMidleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Parking system reports and analytics
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     OutgoingCarsReport:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             outgoingCars:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   plate_number:
 *                     type: string
 *                   ticket_number:
 *                     type: string
 *                   entry_time:
 *                     type: string
 *                     format: date-time
 *                   exit_time:
 *                     type: string
 *                     format: date-time
 *                   amount:
 *                     type: number
 *                   ParkingSlot:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       location:
 *                         type: string
 *             summary:
 *               type: object
 *               properties:
 *                 totalCars:
 *                   type: integer
 *                 totalAmount:
 *                   type: string
 *                 dateRange:
 *                   type: object
 *                   properties:
 *                     start:
 *                       type: string
 *                       format: date-time
 *                     end:
 *                       type: string
 *                       format: date-time
 *             pagination:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 */

/**
 * @swagger
 * /api/reports/outgoing:
 *   get:
 *     summary: Generate report of outgoing cars with total amount charged
 *     description: Get a detailed report of all cars that exited the parking between two dates, including total amount charged
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OutgoingCarsReport'
 *       400:
 *         description: Invalid date parameters
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/outgoing', authenticateToken, authorizeRoles('admin'), generateOutgoingCarsReport);

/**
 * @swagger
 * components:
 *   schemas:
 *     EnteredCarsReport:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             enteredCars:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   plate_number:
 *                     type: string
 *                   ticket_number:
 *                     type: string
 *                   entry_time:
 *                     type: string
 *                     format: date-time
 *                   exit_time:
 *                     type: string
 *                     format: date-time
 *                   amount:
 *                     type: number
 *                   ParkingSlot:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       location:
 *                         type: string
 *             summary:
 *               type: object
 *               properties:
 *                 totalCars:
 *                   type: integer
 *                 activeCars:
 *                   type: integer
 *                 exitedCars:
 *                   type: integer
 *                 totalRevenue:
 *                   type: string
 *                 dateRange:
 *                   type: object
 *                   properties:
 *                     start:
 *                       type: string
 *                       format: date-time
 *                     end:
 *                       type: string
 *                       format: date-time
 *             pagination:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 */

/**
 * @swagger
 * /api/reports/entered:
 *   get:
 *     summary: Generate report of entered cars
 *     description: Get a detailed report of all cars that entered the parking between two dates, including active and exited cars
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EnteredCarsReport'
 *       400:
 *         description: Invalid date parameters
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/entered', authenticateToken, authorizeRoles('admin'), generateEnteredCarsReport);

export default router; 