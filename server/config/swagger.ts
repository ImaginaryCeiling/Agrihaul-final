import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AgriHaul API',
      version: '1.0.0',
      description: 'API for AgriHaul - Agricultural Logistics Platform connecting farmers with carriers',
      contact: {
        name: 'AgriHaul Support',
        email: 'support@agrihaul.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5001',
        description: 'Development server',
      },
      {
        url: 'https://api.agrihaul.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique user identifier',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            userType: {
              type: 'string',
              enum: ['farmer', 'carrier'],
              description: 'Type of user account',
            },
            profile: {
              oneOf: [
                { $ref: '#/components/schemas/FarmerProfile' },
                { $ref: '#/components/schemas/CarrierProfile' },
              ],
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        FarmerProfile: {
          type: 'object',
          properties: {
            farmName: {
              type: 'string',
              description: 'Name of the farm',
            },
            farmSize: {
              type: 'number',
              description: 'Size of farm in acres',
            },
            farmLocation: {
              type: 'string',
              description: 'Farm location address',
            },
            primaryCrops: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of primary crops grown',
            },
            contactPhone: {
              type: 'string',
              description: 'Contact phone number',
            },
            rating: {
              type: 'number',
              minimum: 0,
              maximum: 5,
              description: 'Average rating from carriers',
            },
            totalJobs: {
              type: 'integer',
              description: 'Total number of jobs posted',
            },
          },
          required: ['farmName', 'farmSize', 'farmLocation', 'primaryCrops', 'contactPhone'],
        },
        CarrierProfile: {
          type: 'object',
          properties: {
            companyName: {
              type: 'string',
              description: 'Name of the carrier company',
            },
            vehicleType: {
              type: 'string',
              description: 'Type of vehicle used for transport',
            },
            vehicleCapacity: {
              type: 'number',
              description: 'Vehicle capacity in pounds',
            },
            serviceAreas: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Areas where services are provided',
            },
            contactPhone: {
              type: 'string',
              description: 'Contact phone number',
            },
            rating: {
              type: 'number',
              minimum: 0,
              maximum: 5,
              description: 'Average rating from farmers',
            },
            totalDeliveries: {
              type: 'integer',
              description: 'Total number of completed deliveries',
            },
            equipmentTypes: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Types of equipment available',
            },
          },
          required: ['companyName', 'vehicleType', 'vehicleCapacity', 'serviceAreas', 'contactPhone', 'equipmentTypes'],
        },
        Job: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            farmerId: {
              type: 'string',
              format: 'uuid',
            },
            title: {
              type: 'string',
              description: 'Job title',
            },
            description: {
              type: 'string',
              description: 'Detailed job description',
            },
            cropType: {
              type: 'string',
              description: 'Type of crop to be transported',
            },
            quantity: {
              type: 'number',
              description: 'Quantity to be transported',
            },
            unit: {
              type: 'string',
              description: 'Unit of measurement (lbs, tons, etc.)',
            },
            pickupLocation: {
              type: 'string',
              description: 'Pickup address',
            },
            deliveryLocation: {
              type: 'string',
              description: 'Delivery address',
            },
            pickupDate: {
              type: 'string',
              format: 'date-time',
              description: 'Pickup date and time',
            },
            deliveryDate: {
              type: 'string',
              format: 'date-time',
              description: 'Required delivery date and time',
            },
            budget: {
              type: 'number',
              description: 'Budget for the job in USD',
            },
            equipmentRequired: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Required equipment types',
            },
            specialInstructions: {
              type: 'string',
              description: 'Special handling instructions',
            },
            status: {
              type: 'string',
              enum: ['open', 'bidding', 'assigned', 'in_progress', 'completed', 'cancelled'],
              description: 'Current job status',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Bid: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            jobId: {
              type: 'string',
              format: 'uuid',
            },
            carrierId: {
              type: 'string',
              format: 'uuid',
            },
            bidAmount: {
              type: 'number',
              description: 'Bid amount in USD',
            },
            estimatedDuration: {
              type: 'integer',
              description: 'Estimated duration in hours',
            },
            message: {
              type: 'string',
              description: 'Message from carrier to farmer',
            },
            status: {
              type: 'string',
              enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
              description: 'Current bid status',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indicates if the request was successful',
            },
            data: {
              type: 'object',
              description: 'Response data (when successful)',
            },
            error: {
              type: 'string',
              description: 'Error message (when unsuccessful)',
            },
            message: {
              type: 'string',
              description: 'Additional message',
            },
          },
          required: ['success'],
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  $ref: '#/components/schemas/User',
                },
                token: {
                  type: 'string',
                  description: 'JWT authentication token',
                },
              },
            },
            message: {
              type: 'string',
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            password: {
              type: 'string',
              minLength: 8,
              description: 'Password (min 8 chars, must contain uppercase, lowercase, and number)',
            },
            userType: {
              type: 'string',
              enum: ['farmer', 'carrier'],
              description: 'Type of user account',
            },
            profile: {
              oneOf: [
                { $ref: '#/components/schemas/FarmerProfile' },
                { $ref: '#/components/schemas/CarrierProfile' },
              ],
            },
          },
          required: ['email', 'password', 'userType', 'profile'],
        },
        LoginRequest: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            password: {
              type: 'string',
              description: 'User password',
            },
          },
          required: ['email', 'password'],
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              example: 'Validation failed',
            },
            message: {
              type: 'string',
              example: 'Email is required, Password must be at least 8 characters',
            },
          },
        },
        UnauthorizedError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              example: 'Invalid email or password',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints',
      },
      {
        name: 'Jobs',
        description: 'Job management endpoints',
      },
      {
        name: 'Users',
        description: 'User profile management',
      },
      {
        name: 'Bids',
        description: 'Bid management endpoints',
      },
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
    ],
  },
  apis: ['./server/routes/*.ts', './server/controllers/*.ts', './server/app.ts'], // paths to files containing OpenAPI definitions
};

export const specs = swaggerJsdoc(options);