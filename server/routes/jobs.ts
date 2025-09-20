import express from 'express';
import { authenticateToken, requireUserType, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Get all jobs
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, bidding, assigned, in_progress, completed, cancelled]
 *         description: Filter jobs by status
 *       - in: query
 *         name: cropType
 *         schema:
 *           type: string
 *         description: Filter jobs by crop type
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter jobs by location
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of jobs to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of jobs to skip
 *     responses:
 *       200:
 *         description: List of jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Job'
 *                 message:
 *                   type: string
 *                   example: "Jobs retrieved successfully"
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Jobs endpoint working',
    data: []
  });
});

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Create a new job (Farmers only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Corn Harvest Transport"
 *               description:
 *                 type: string
 *                 example: "Need transport for fresh corn harvest"
 *               cropType:
 *                 type: string
 *                 example: "corn"
 *               quantity:
 *                 type: number
 *                 example: 25000
 *               unit:
 *                 type: string
 *                 example: "lbs"
 *               pickupLocation:
 *                 type: string
 *                 example: "Green Valley Farm, Sacramento, CA"
 *               deliveryLocation:
 *                 type: string
 *                 example: "Processing Plant, Stockton, CA"
 *               pickupDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-25T08:00:00Z"
 *               deliveryDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-25T18:00:00Z"
 *               budget:
 *                 type: number
 *                 example: 1200
 *               equipmentRequired:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["bulk", "covered"]
 *               specialInstructions:
 *                 type: string
 *                 example: "Keep dry during transport"
 *             required:
 *               - title
 *               - cropType
 *               - quantity
 *               - unit
 *               - pickupLocation
 *               - deliveryLocation
 *               - pickupDate
 *               - deliveryDate
 *               - budget
 *     responses:
 *       201:
 *         description: Job created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Job'
 *                 message:
 *                   type: string
 *                   example: "Job created successfully"
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Farmer role required
 *       400:
 *         description: Validation error
 */
router.post('/', authenticateToken, requireUserType('farmer'), (req: AuthRequest, res) => {
  res.json({
    success: true,
    message: 'Job creation endpoint (to be implemented)',
    data: null
  });
});

export default router;