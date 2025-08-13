const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { adminAuth } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Obtener todos los residentes
router.get('/residents', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, isActive, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
        { houseNumber: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const residents = await prisma.resident.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            payments: true,
            documents: true
          }
        }
      },
      orderBy: { houseNumber: 'asc' },
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    const total = await prisma.resident.count({ where });

    res.json({
      residents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error obteniendo residentes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener estadísticas generales
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [
      totalResidents,
      activeResidents,
      totalUsers,
      totalPayments,
      totalDocuments,
      totalNotifications
    ] = await Promise.all([
      prisma.resident.count(),
      prisma.resident.count({ where: { isActive: true } }),
      prisma.user.count(),
      prisma.payment.count(),
      prisma.document.count(),
      prisma.notification.count()
    ]);

    const paymentStats = await prisma.payment.groupBy({
      by: ['status'],
      _count: { status: true },
      _sum: { amount: true }
    });

    const documentStats = await prisma.document.groupBy({
      by: ['type'],
      _count: { type: true }
    });

    res.json({
      stats: {
        totalResidents,
        activeResidents,
        totalUsers,
        totalPayments,
        totalDocuments,
        totalNotifications,
        paymentStats,
        documentStats
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear usuario administrador
router.post('/create-admin', adminAuth, [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 2 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuario administrador
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN'
      }
    });

    res.status(201).json({
      message: 'Administrador creado exitosamente',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Error creando administrador:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar estado de residente
router.put('/residents/:id/status', adminAuth, [
  body('isActive').isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { isActive } = req.body;

    const resident = await prisma.resident.findUnique({
      where: { id }
    });

    if (!resident) {
      return res.status(404).json({ error: 'Residente no encontrado' });
    }

    const updatedResident = await prisma.resident.update({
      where: { id },
      data: { isActive },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      message: `Residente ${isActive ? 'activado' : 'desactivado'} exitosamente`,
      resident: updatedResident
    });
  } catch (error) {
    console.error('Error actualizando estado de residente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener detalles de un residente
router.get('/residents/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const resident = await prisma.resident.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        documents: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!resident) {
      return res.status(404).json({ error: 'Residente no encontrado' });
    }

    res.json({ resident });
  } catch (error) {
    console.error('Error obteniendo detalles de residente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Enviar notificación masiva
router.post('/send-mass-notification', adminAuth, [
  body('title').trim().isLength({ min: 1 }),
  body('message').trim().isLength({ min: 1 }),
  body('type').isIn(['PAYMENT_DUE', 'DOCUMENT_SENT', 'GENERAL']),
  body('residentIds').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, message, type, residentIds } = req.body;

    let residents;
    if (residentIds && residentIds.length > 0) {
      residents = await prisma.resident.findMany({
        where: {
          id: { in: residentIds },
          isActive: true
        },
        include: {
          user: true
        }
      });
    } else {
      residents = await prisma.resident.findMany({
        where: { isActive: true },
        include: {
          user: true
        }
      });
    }

    const notificationPromises = residents.map(resident =>
      prisma.notification.create({
        data: {
          userId: resident.userId,
          title,
          message,
          type
        }
      })
    );

    await Promise.all(notificationPromises);

    res.json({
      message: `Notificación enviada a ${residents.length} residentes`,
      sentCount: residents.length
    });
  } catch (error) {
    console.error('Error enviando notificación masiva:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear pago para un residente
router.post('/create-payment', adminAuth, [
  body('residentId').isString().notEmpty(),
  body('type').isIn(['MAINTENANCE', 'WATER', 'GATE']),
  body('amount').isFloat({ min: 0 }),
  body('dueDate').isISO8601(),
  body('description').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { residentId, type, amount, dueDate, description } = req.body;

    // Verificar que el residente existe
    const resident = await prisma.resident.findUnique({
      where: { id: residentId },
      include: {
        user: true
      }
    });

    if (!resident) {
      return res.status(404).json({ error: 'Residente no encontrado' });
    }

    if (!resident.isActive) {
      return res.status(400).json({ error: 'No se pueden crear pagos para residentes inactivos' });
    }

    // Crear el pago
    const payment = await prisma.payment.create({
      data: {
        residentId,
        userId: resident.userId,
        type,
        amount: parseFloat(amount),
        dueDate: new Date(dueDate),
        status: 'PENDING',
        description: description || `Pago de ${type.toLowerCase()} - ${new Date(dueDate).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`
      },
      include: {
        resident: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    // Crear notificación para el residente
    await prisma.notification.create({
      data: {
        userId: resident.userId,
        title: 'Nuevo Pago Asignado',
        message: `Se ha asignado un nuevo pago de ${type.toLowerCase()} por $${amount} con fecha de vencimiento ${new Date(dueDate).toLocaleDateString('es-ES')}`,
        type: 'PAYMENT_DUE'
      }
    });

    res.status(201).json({
      message: 'Pago creado exitosamente',
      payment
    });
  } catch (error) {
    console.error('Error creando pago:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear pagos masivos para todos los residentes activos
router.post('/create-mass-payments', adminAuth, [
  body('type').isIn(['MAINTENANCE', 'WATER', 'GATE']),
  body('amount').isFloat({ min: 0 }),
  body('dueDate').isISO8601(),
  body('description').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, amount, dueDate, description } = req.body;

    // Obtener todos los residentes activos
    const activeResidents = await prisma.resident.findMany({
      where: { isActive: true },
      include: {
        user: true
      }
    });

    if (activeResidents.length === 0) {
      return res.status(400).json({ error: 'No hay residentes activos para asignar pagos' });
    }

    // Crear pagos para todos los residentes activos
    const paymentPromises = activeResidents.map(resident =>
      prisma.payment.create({
        data: {
          residentId: resident.id,
          userId: resident.userId,
          type,
          amount: parseFloat(amount),
          dueDate: new Date(dueDate),
          status: 'PENDING',
          description: description || `Pago de ${type.toLowerCase()} - ${new Date(dueDate).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`
        }
      })
    );

    const payments = await Promise.all(paymentPromises);

    // Crear notificaciones para todos los residentes
    const notificationPromises = activeResidents.map(resident =>
      prisma.notification.create({
        data: {
          userId: resident.userId,
          title: 'Nuevo Pago Asignado',
          message: `Se ha asignado un nuevo pago de ${type.toLowerCase()} por $${amount} con fecha de vencimiento ${new Date(dueDate).toLocaleDateString('es-ES')}`,
          type: 'PAYMENT_DUE'
        }
      })
    );

    await Promise.all(notificationPromises);

    res.status(201).json({
      message: `Pagos creados exitosamente para ${activeResidents.length} residentes`,
      paymentsCount: payments.length,
      type,
      amount,
      dueDate
    });
  } catch (error) {
    console.error('Error creando pagos masivos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener reporte de pagos
router.get('/payments-report', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate, type, status } = req.query;

    const where = {};
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }
    if (type) where.type = type;
    if (status) where.status = status;

    const payments = await prisma.payment.findMany({
      where,
      include: {
        resident: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const paidAmount = payments
      .filter(payment => payment.status === 'PAID')
      .reduce((sum, payment) => sum + payment.amount, 0);

    res.json({
      payments,
      summary: {
        totalPayments: payments.length,
        totalAmount,
        paidAmount,
        pendingAmount: totalAmount - paidAmount
      }
    });
  } catch (error) {
    console.error('Error generando reporte de pagos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router; 