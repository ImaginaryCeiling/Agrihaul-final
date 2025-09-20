import express from 'express';
import { body } from 'express-validator';
import { register, login } from '../controllers/authController';

const router = express.Router();

// Registration validation
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('userType')
    .isIn(['farmer', 'carrier'])
    .withMessage('User type must be either farmer or carrier'),
  body('profile')
    .isObject()
    .withMessage('Profile is required')
];

// Login validation
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           examples:
 *             farmer:
 *               summary: Farmer registration
 *               value:
 *                 email: "farmer@example.com"
 *                 password: "Password123"
 *                 userType: "farmer"
 *                 profile:
 *                   farmName: "Green Valley Farm"
 *                   farmSize: 150
 *                   farmLocation: "Sacramento, CA"
 *                   primaryCrops: ["corn", "soybeans"]
 *                   contactPhone: "+1-555-0123"
 *                   rating: 0
 *                   totalJobs: 0
 *             carrier:
 *               summary: Carrier registration
 *               value:
 *                 email: "carrier@example.com"
 *                 password: "Password123"
 *                 userType: "carrier"
 *                 profile:
 *                   companyName: "Valley Transport"
 *                   vehicleType: "Semi-truck"
 *                   vehicleCapacity: 80000
 *                   serviceAreas: ["California", "Nevada"]
 *                   contactPhone: "+1-555-0123"
 *                   rating: 0
 *                   totalDeliveries: 0
 *                   equipmentTypes: ["refrigerated", "bulk"]
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "User with this email already exists"
 *       500:
 *         description: Internal server error
 */
router.post('/register', registerValidation, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "test@example.com"
 *             password: "Password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       500:
 *         description: Internal server error
 */
router.post('/login', loginValidation, login);

export default router;