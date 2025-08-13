const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { auth, adminAuth } = require('../middleware/auth');
const moment = require('moment');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

// Obtener pagos del residente
router.get('/my-payments', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      residentId: req.user.resident.id
    };

    if (status) where.status = status;
    if (type) where.type = type;

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
      orderBy: { createdAt: 'desc' },
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    const total = await prisma.payment.count({ where });

    res.json({
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error obteniendo pagos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener resumen de pagos del residente
router.get('/my-summary', auth, async (req, res) => {
  try {
    const residentId = req.user.resident.id;

    const [totalPending, totalPaid, totalOverdue, recentPayments] = await Promise.all([
      prisma.payment.count({
        where: {
          residentId,
          status: 'PENDING'
        }
      }),
      prisma.payment.count({
        where: {
          residentId,
          status: 'PAID'
        }
      }),
      prisma.payment.count({
        where: {
          residentId,
          status: 'OVERDUE'
        }
      }),
      prisma.payment.findMany({
        where: { residentId },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    const pendingAmount = await prisma.payment.aggregate({
      where: {
        residentId,
        status: { in: ['PENDING', 'OVERDUE'] }
      },
      _sum: { amount: true }
    });

    res.json({
      summary: {
        totalPending,
        totalPaid,
        totalOverdue,
        pendingAmount: pendingAmount._sum.amount || 0
      },
      recentPayments
    });
  } catch (error) {
    console.error('Error obteniendo resumen:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Registrar pago (solo admin)
router.post('/', adminAuth, [
  body('residentId').notEmpty(),
  body('type').isIn(['MAINTENANCE', 'WATER', 'GATE']),
  body('amount').isFloat({ min: 0 }),
  body('dueDate').isISO8601(),
  body('description').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { residentId, type, amount, dueDate, description } = req.body;

    // Verificar que el residente existe
    const resident = await prisma.resident.findUnique({
      where: { id: residentId }
    });

    if (!resident) {
      return res.status(404).json({ error: 'Residente no encontrado' });
    }

    const payment = await prisma.payment.create({
      data: {
        residentId,
        type,
        amount: parseFloat(amount),
        dueDate: new Date(dueDate),
        description,
        userId: req.user.id
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
        title: 'Nuevo pago registrado',
        message: `Se ha registrado un nuevo pago de ${type.toLowerCase()} por $${amount}`,
        type: 'PAYMENT_DUE'
      }
    });

    res.status(201).json({
      message: 'Pago registrado exitosamente',
      payment
    });
  } catch (error) {
    console.error('Error registrando pago:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Marcar pago como pagado (solo admin)
router.put('/:id/mark-paid', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        resident: {
          include: {
            user: true
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        status: 'PAID',
        paidDate: new Date()
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
        userId: payment.resident.userId,
        title: 'Pago confirmado',
        message: `Su pago de ${payment.type.toLowerCase()} por $${payment.amount} ha sido confirmado`,
        type: 'PAYMENT_RECEIVED'
      }
    });

    res.json({
      message: 'Pago marcado como pagado',
      payment: updatedPayment
    });
  } catch (error) {
    console.error('Error marcando pago como pagado:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar pagos vencidos (cron job)
router.post('/update-overdue', adminAuth, async (req, res) => {
  try {
    const today = new Date();

    const overduePayments = await prisma.payment.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          lt: today
        }
      },
      include: {
        resident: {
          include: {
            user: true
          }
        }
      }
    });

    const updatePromises = overduePayments.map(payment =>
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'OVERDUE' }
      })
    );

    const notificationPromises = overduePayments.map(payment =>
      prisma.notification.create({
        data: {
          userId: payment.resident.userId,
          title: 'Pago vencido',
          message: `Su pago de ${payment.type.toLowerCase()} por $${payment.amount} está vencido`,
          type: 'PAYMENT_DUE'
        }
      })
    );

    await Promise.all([...updatePromises, ...notificationPromises]);

    res.json({
      message: `${overduePayments.length} pagos marcados como vencidos`
    });
  } catch (error) {
    console.error('Error actualizando pagos vencidos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener todos los pagos (solo admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type, residentId } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (residentId) where.residentId = residentId;

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
      orderBy: { createdAt: 'desc' },
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    const total = await prisma.payment.count({ where });

    res.json({
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error obteniendo pagos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener estadísticas de pagos (solo admin)
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [totalPayments, totalPending, totalPaid, totalOverdue] = await Promise.all([
      prisma.payment.count(),
      prisma.payment.count({ where: { status: 'PENDING' } }),
      prisma.payment.count({ where: { status: 'PAID' } }),
      prisma.payment.count({ where: { status: 'OVERDUE' } })
    ]);

    const totalAmount = await prisma.payment.aggregate({
      _sum: { amount: true }
    });

    const pendingAmount = await prisma.payment.aggregate({
      where: { status: { in: ['PENDING', 'OVERDUE'] } },
      _sum: { amount: true }
    });

    const paidAmount = await prisma.payment.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true }
    });

    res.json({
      stats: {
        totalPayments,
        totalPending,
        totalPaid,
        totalOverdue,
        totalAmount: totalAmount._sum.amount || 0,
        pendingAmount: pendingAmount._sum.amount || 0,
        paidAmount: paidAmount._sum.amount || 0
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear intent de pago con Stripe
router.post('/create-payment-intent', auth, [
  body('paymentId').notEmpty(),
  body('paymentMethodId').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { paymentId, paymentMethodId } = req.body;

    // Verificar que el pago existe y pertenece al usuario
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        residentId: req.user.resident.id,
        status: { in: ['PENDING', 'OVERDUE'] }
      }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Pago no encontrado o ya pagado' });
    }

    // Crear PaymentIntent con Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(payment.amount * 100), // Stripe usa centavos
      currency: 'mxn',
      payment_method: paymentMethodId,
      confirm: true,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payments/success`,
      metadata: {
        paymentId: payment.id,
        residentId: req.user.resident.id,
        type: payment.type
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creando PaymentIntent:', error);
    res.status(500).json({ error: 'Error procesando el pago' });
  }
});

// Marcar pago como pagado (para residentes)
router.post('/mark-as-paid', auth, [
  body('paymentId').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { paymentId } = req.body;

    // Verificar que el pago existe y pertenece al usuario
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        residentId: req.user.resident.id,
        status: { in: ['PENDING', 'OVERDUE'] }
      }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Pago no encontrado o ya pagado' });
    }

    // Actualizar el pago en la base de datos
    const updatedPayment = await prisma.payment.update({
      where: {
        id: paymentId,
        residentId: req.user.resident.id
      },
      data: {
        status: 'PAID',
        paidDate: new Date()
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

    // Crear notificación de pago exitoso
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        title: 'Pago exitoso',
        message: `Su pago de ${updatedPayment.type.toLowerCase()} por $${updatedPayment.amount} ha sido procesado exitosamente`,
        type: 'PAYMENT_RECEIVED'
      }
    });

    res.json({
      message: 'Pago marcado como pagado exitosamente',
      payment: updatedPayment
    });
  } catch (error) {
    console.error('Error marcando pago como pagado:', error);
    res.status(500).json({ error: 'Error marcando el pago como pagado' });
  }
});

// Confirmar pago exitoso
router.post('/confirm-payment', auth, [
  body('paymentIntentId').notEmpty(),
  body('paymentId').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { paymentIntentId, paymentId } = req.body;

    // Verificar el PaymentIntent con Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'El pago no fue exitoso' });
    }

    // Actualizar el pago en la base de datos
    const updatedPayment = await prisma.payment.update({
      where: {
        id: paymentId,
        residentId: req.user.resident.id
      },
      data: {
        status: 'PAID',
        paidDate: new Date(),
        stripePaymentIntentId: paymentIntentId
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

    // Crear notificación de pago exitoso
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        title: 'Pago exitoso',
        message: `Su pago de ${updatedPayment.type.toLowerCase()} por $${updatedPayment.amount} ha sido procesado exitosamente`,
        type: 'PAYMENT_RECEIVED'
      }
    });

    res.json({
      message: 'Pago confirmado exitosamente',
      payment: updatedPayment
    });
  } catch (error) {
    console.error('Error confirmando pago:', error);
    res.status(500).json({ error: 'Error confirmando el pago' });
  }
});

// Obtener pagos pendientes del residente para mostrar en el frontend
router.get('/pending-payments', auth, async (req, res) => {
  try {
    const pendingPayments = await prisma.payment.findMany({
      where: {
        residentId: req.user.resident.id,
        status: { in: ['PENDING', 'OVERDUE'] }
      },
      orderBy: { dueDate: 'asc' }
    });

    res.json({ payments: pendingPayments });
  } catch (error) {
    console.error('Error obteniendo pagos pendientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Webhook para Stripe (para manejar eventos de pago)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Error verificando webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar el evento
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful:', paymentIntent.id);
      
      // Aquí podrías actualizar el estado del pago en tu base de datos
      // si no lo has hecho ya en el endpoint de confirmación
      break;
      
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('PaymentIntent failed:', failedPayment.id);
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router; 