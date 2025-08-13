const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { auth, adminAuth } = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

const router = express.Router();

// Obtener documentos del residente
router.get('/my-documents', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      residentId: req.user.resident.id
    };

    if (type) where.type = type;

    const documents = await prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    const total = await prisma.document.count({ where });

    res.json({
      documents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error obteniendo documentos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Generar factura de agua (solo admin)
router.post('/generate-water-invoice', adminAuth, [
  body('residentId').notEmpty(),
  body('amount').isFloat({ min: 0 }),
  body('dueDate').isISO8601(),
  body('consumption').optional().isFloat({ min: 0 }),
  body('period').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { residentId, amount, dueDate, consumption, period } = req.body;

    const resident = await prisma.resident.findUnique({
      where: { id: residentId },
      include: {
        user: true
      }
    });

    if (!resident) {
      return res.status(404).json({ error: 'Residente no encontrado' });
    }

    // Generar PDF
    const fileName = `water-invoice-${resident.houseNumber}-${Date.now()}.pdf`;
    const filePath = path.join(process.env.UPLOAD_PATH || 'uploads', fileName);

    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Contenido del PDF
    doc.fontSize(20).text('FACTURA DE AGUA', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Residencial: ${resident.houseNumber}`);
    doc.text(`Residente: ${resident.user.name}`);
    doc.text(`Email: ${resident.user.email}`);
    doc.moveDown();
    doc.text(`Período: ${period}`);
    doc.text(`Consumo: ${consumption || 'N/A'} m³`);
    doc.text(`Monto: $${amount}`);
    doc.text(`Fecha de vencimiento: ${moment(dueDate).format('DD/MM/YYYY')}`);
    doc.moveDown();
    doc.text('Por favor realice el pago antes de la fecha de vencimiento para evitar recargos.');

    doc.end();

    stream.on('finish', async () => {
      // Crear documento en la base de datos
      const document = await prisma.document.create({
        data: {
          residentId,
          type: 'INVOICE',
          title: `Factura de Agua - ${period}`,
          content: `Factura de agua por $${amount} para el período ${period}`,
          filePath: fileName,
          userId: req.user.id
        }
      });

      // Crear notificación
      await prisma.notification.create({
        data: {
          userId: resident.userId,
          title: 'Nueva factura de agua',
          message: `Se ha generado una nueva factura de agua por $${amount}`,
          type: 'DOCUMENT_SENT'
        }
      });

      res.status(201).json({
        message: 'Factura generada exitosamente',
        document,
        filePath: fileName
      });
    });
  } catch (error) {
    console.error('Error generando factura:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Generar factura de mantenimiento (solo admin)
router.post('/generate-maintenance-invoice', adminAuth, [
  body('residentId').notEmpty(),
  body('amount').isFloat({ min: 0 }),
  body('dueDate').isISO8601(),
  body('description').optional().trim(),
  body('period').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { residentId, amount, dueDate, description, period } = req.body;

    const resident = await prisma.resident.findUnique({
      where: { id: residentId },
      include: {
        user: true
      }
    });

    if (!resident) {
      return res.status(404).json({ error: 'Residente no encontrado' });
    }

    // Generar PDF
    const fileName = `maintenance-invoice-${resident.houseNumber}-${Date.now()}.pdf`;
    const filePath = path.join(process.env.UPLOAD_PATH || 'uploads', fileName);

    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Contenido del PDF
    doc.fontSize(20).text('FACTURA DE MANTENIMIENTO', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Residencial: ${resident.houseNumber}`);
    doc.text(`Residente: ${resident.user.name}`);
    doc.text(`Email: ${resident.user.email}`);
    doc.moveDown();
    doc.text(`Período: ${period}`);
    doc.text(`Monto: $${amount}`);
    doc.text(`Fecha de vencimiento: ${moment(dueDate).format('DD/MM/YYYY')}`);
    if (description) {
      doc.moveDown();
      doc.text(`Descripción: ${description}`);
    }
    doc.moveDown();
    doc.text('Este cargo incluye los servicios de mantenimiento general del residencial.');

    doc.end();

    stream.on('finish', async () => {
      // Crear documento en la base de datos
      const document = await prisma.document.create({
        data: {
          residentId,
          type: 'INVOICE',
          title: `Factura de Mantenimiento - ${period}`,
          content: `Factura de mantenimiento por $${amount} para el período ${period}`,
          filePath: fileName,
          userId: req.user.id
        }
      });

      // Crear notificación
      await prisma.notification.create({
        data: {
          userId: resident.userId,
          title: 'Nueva factura de mantenimiento',
          message: `Se ha generado una nueva factura de mantenimiento por $${amount}`,
          type: 'DOCUMENT_SENT'
        }
      });

      res.status(201).json({
        message: 'Factura generada exitosamente',
        document,
        filePath: fileName
      });
    });
  } catch (error) {
    console.error('Error generando factura:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Generar recibo de pago (solo admin)
router.post('/generate-receipt', adminAuth, [
  body('paymentId').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { paymentId } = req.body;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
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

    if (payment.status !== 'PAID') {
      return res.status(400).json({ error: 'El pago debe estar marcado como pagado' });
    }

    // Generar PDF
    const fileName = `receipt-${payment.id}-${Date.now()}.pdf`;
    const filePath = path.join(process.env.UPLOAD_PATH || 'uploads', fileName);

    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Contenido del PDF
    doc.fontSize(20).text('RECIBO DE PAGO', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Residencial: ${payment.resident.houseNumber}`);
    doc.text(`Residente: ${payment.resident.user.name}`);
    doc.text(`Email: ${payment.resident.user.email}`);
    doc.moveDown();
    doc.text(`Tipo de pago: ${payment.type}`);
    doc.text(`Monto: $${payment.amount}`);
    doc.text(`Fecha de pago: ${moment(payment.paidDate).format('DD/MM/YYYY HH:mm')}`);
    doc.text(`Fecha de vencimiento: ${moment(payment.dueDate).format('DD/MM/YYYY')}`);
    if (payment.description) {
      doc.moveDown();
      doc.text(`Descripción: ${payment.description}`);
    }
    doc.moveDown();
    doc.text('¡Gracias por su pago!');

    doc.end();

    stream.on('finish', async () => {
      // Crear documento en la base de datos
      const document = await prisma.document.create({
        data: {
          residentId: payment.residentId,
          type: 'RECEIPT',
          title: `Recibo de Pago - ${payment.type}`,
          content: `Recibo de pago de ${payment.type.toLowerCase()} por $${payment.amount}`,
          filePath: fileName,
          userId: req.user.id
        }
      });

      // Crear notificación
      await prisma.notification.create({
        data: {
          userId: payment.resident.userId,
          title: 'Recibo de pago disponible',
          message: `Su recibo de pago de ${payment.type.toLowerCase()} está disponible`,
          type: 'DOCUMENT_SENT'
        }
      });

      res.status(201).json({
        message: 'Recibo generado exitosamente',
        document,
        filePath: fileName
      });
    });
  } catch (error) {
    console.error('Error generando recibo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Descargar documento
router.get('/download/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        resident: true
      }
    });

    if (!document) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    // Verificar que el usuario puede acceder al documento
    if (req.user.role !== 'ADMIN' && document.residentId !== req.user.resident?.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    if (!document.filePath) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    const filePath = path.join(process.env.UPLOAD_PATH || 'uploads', document.filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo no encontrado en el servidor' });
    }

    // Marcar como leído si es el residente
    if (req.user.role === 'RESIDENT') {
      await prisma.document.update({
        where: { id },
        data: { isRead: true }
      });
    }

    res.download(filePath);
  } catch (error) {
    console.error('Error descargando documento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Marcar documento como leído
router.put('/:id/read', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.findUnique({
      where: { id }
    });

    if (!document) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    if (req.user.role !== 'ADMIN' && document.residentId !== req.user.resident?.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    await prisma.document.update({
      where: { id },
      data: { isRead: true }
    });

    res.json({ message: 'Documento marcado como leído' });
  } catch (error) {
    console.error('Error marcando documento como leído:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener todos los documentos (solo admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, residentId } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (type) where.type = type;
    if (residentId) where.residentId = residentId;

    const documents = await prisma.document.findMany({
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

    const total = await prisma.document.count({ where });

    res.json({
      documents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error obteniendo documentos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router; 