// Import necessary modules
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import express from 'express';

// Define Swagger options
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Vehicle Parking Management System API',
            version: '1.0.0',
            description: 'API documentation for the Vehicle Parking Management System',
        },
        servers: [
            {
                url: 'http://localhost:5000',
            },
        ],
        components: {
            schemas: {
                Address: {
                    type: 'object',
                    properties: {
                        street: { type: 'string', example: '123 Main St' },
                        city: { type: 'string', example: 'Kigali' },
                        state: { type: 'string', example: 'Kigali City' },
                        postalCode: { type: 'string', example: '00001' },
                        country: { type: 'string', example: 'Rwanda' },
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: '60d0fe4f5311236168a109ca' },
                        username: { type: 'string', example: 'johndoe' },
                        email: { type: 'string', example: 'johndoe@example.com' },
                        firstName: { type: 'string', example: 'John' },
                        lastName: { type: 'string', example: 'Doe' },
                        phoneNumber: { type: 'string', example: '+250788123456' },
                        address: { $ref: '#/components/schemas/Address' },
                        role: { type: 'string', enum: ['admin', 'user', 'staff'], example: 'user' },
                        isVerified: { type: 'boolean', example: false },
                        lastLogin: { type: 'string', format: 'date-time', example: '2025-05-17T01:11:01Z' },
                        profileImage: { type: 'string', example: 'https://example.com/images/profile.jpg' },
                        createdAt: { type: 'string', format: 'date-time', example: '2025-05-17T01:11:01Z' },
                        updatedAt: { type: 'string', format: 'date-time', example: '2025-05-17T01:11:01Z' },
                    },
                },
                RegisterUserInput: {
                    type: 'object',
                    required: ['username', 'email', 'password'],
                    properties: {
                        username: { type: 'string', example: 'johndoe' },
                        email: { type: 'string', example: 'johndoe@example.com' },
                        password: { type: 'string', example: 'securePassword123' },
                        firstName: { type: 'string', example: 'John' },
                        lastName: { type: 'string', example: 'Doe' },
                        phoneNumber: { type: 'string', example: '+250788123456' },
                        address: { $ref: '#/components/schemas/Address' },
                    },
                },
                LoginUserInput: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', example: 'johndoe@example.com' },
                        password: { type: 'string', example: 'securePassword123' },
                    },
                },
                VerifyOtpInput: {
                    type: 'object',
                    required: ['email', 'otp'],
                    properties: {
                        email: {
                            type: 'string',
                            example: 'johndoe@example.com',
                        },
                        otp: {
                            type: 'string',
                            example: '123456',
                        },
                    },
                },
                Payment: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            example: '664780ff8e64e130b9a5e923'
                        },
                        user: {
                            type: 'string',
                            example: '66477e6d2b8aefb4daecb21c'
                        },
                        reservation: {
                            type: 'string',
                            example: '66477f932b8aefb4daecb225'
                        },
                        amount: {
                            type: 'number',
                            example: 2500
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'completed', 'failed'],
                            example: 'completed'
                        },
                        paymentMethod: {
                            type: 'string',
                            enum: ['card', 'mobile_money', 'cash'],
                            example: 'mobile_money'
                        },
                        transactionId: {
                            type: 'string',
                            example: 'TXN - 123456789'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date - time',
                            example: '2025-05 - 17T12: 34: 56Z'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date - time',
                            example: '2025-05 - 17T12: 36: 22Z'
                        },
                    }
                },

                VerifyPaymentInput: {
                    type: 'object',
                    required:
                        - 'transactionId',
                    properties: {
                        transactionId: {
                            type: 'string',
                            example: 'TXN-123456789'
                        }
                    },
                },

                Notification: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string'
                        },
                        user: {
                            type: 'string'
                        },
                        message: {
                            type: 'string'
                        },
                        isRead: {
                            type: 'boolean'
                        },
                        type: {
                            type: 'string',
                            enum: ['reservation', 'payment', 'admin', 'otp', 'other'],
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        },
                    },
                },

                AuditLog: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        tableName: { type: 'string', example: 'users' },
                        recordId: { type: 'integer', example: 123 },
                        action: {
                            type: 'string',
                            enum: ['INSERT', 'UPDATE', 'DELETE'],
                            example: 'UPDATE'
                        },
                        oldData: {
                            type: 'object',
                            example: { name: 'John', email: 'john@example.com' }
                        },
                        newData: {
                            type: 'object',
                            example: { name: 'John Doe', email: 'john@example.com' }
                        },
                        userId: { type: 'integer', example: 456 },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-03-21T10:30:00Z'
                        }
                    }
                },
                PaginatedAuditLogs: {
                    type: 'object',
                    properties: {
                        total: { type: 'integer', example: 100 },
                        page: { type: 'integer', example: 1 },
                        totalPages: { type: 'integer', example: 10 },
                        logs: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/AuditLog' }
                        }
                    }
                }
            },
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },

    },
    apis: ['./routes/*.js'],
};


// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options);

// Function to setup Swagger UI
const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default setupSwagger;
