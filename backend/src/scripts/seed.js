const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Crear usuario administrador
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@resi.com' },
    update: {},
    create: {
      email: 'admin@resi.com',
      password: adminPassword,
      role: 'ADMIN',
      name: 'Administrador',
      resident: {
        create: {
          houseNumber: 'ADMIN',
          phone: '555-0001',
          isActive: true
        }
      }
    }
  })

  // Crear usuario residente
  const residentPassword = await bcrypt.hash('residente123', 10)
  const resident = await prisma.user.upsert({
    where: { email: 'residente@resi.com' },
    update: {},
    create: {
      email: 'residente@resi.com',
      password: residentPassword,
      role: 'RESIDENT',
      name: 'Juan Pérez',
      resident: {
        create: {
          houseNumber: 'A-101',
          phone: '555-1234',
          isActive: true
        }
      }
    }
  })

  // Crear más residentes de ejemplo
  const residents = [
    { name: 'María García', email: 'maria@resi.com', houseNumber: 'B-202', phone: '555-1235' },
    { name: 'Carlos López', email: 'carlos@resi.com', houseNumber: 'C-303', phone: '555-1236' },
    { name: 'Ana Martínez', email: 'ana@resi.com', houseNumber: 'D-404', phone: '555-1237' },
    { name: 'Luis Rodríguez', email: 'luis@resi.com', houseNumber: 'E-505', phone: '555-1238' }
  ]

  for (const residentData of residents) {
    const password = await bcrypt.hash('residente123', 10)
    await prisma.user.upsert({
      where: { email: residentData.email },
      update: {},
      create: {
        email: residentData.email,
        password: password,
        role: 'RESIDENT',
        name: residentData.name,
        resident: {
          create: {
            houseNumber: residentData.houseNumber,
            phone: residentData.phone,
            isActive: true
          }
        }
      }
    })
  }

  // Crear pagos de ejemplo
  const paymentTypes = ['MAINTENANCE', 'WATER', 'GATE']
  const paymentStatuses = ['PENDING', 'PAID', 'OVERDUE']
  
  // Obtener todos los residentes
  const allResidents = await prisma.resident.findMany({
    include: { user: true }
  })

  for (const resident of allResidents) {
    // Crear pagos para los últimos 6 meses
    for (let i = 0; i < 6; i++) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      
      for (const type of paymentTypes) {
        const status = Math.random() > 0.7 ? 'PENDING' : 
                      Math.random() > 0.5 ? 'PAID' : 'OVERDUE'
        
        const amount = type === 'MAINTENANCE' ? 1500 : 
                      type === 'WATER' ? 800 : 300
        
        const dueDate = new Date(date)
        dueDate.setDate(dueDate.getDate() + 15)
        
        const paidDate = status === 'PAID' ? new Date(date) : null
        
        await prisma.payment.create({
          data: {
            type: type,
            amount: amount,
            status: status,
            dueDate: dueDate,
            paidDate: paidDate,
            description: `Pago de ${type.toLowerCase()} - ${date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`,
            resident: {
              connect: { id: resident.id }
            },
            user: {
              connect: { id: resident.user.id }
            }
          }
        })
      }
    }
  }

  // Crear notificaciones de ejemplo
  const notifications = [
    {
      title: 'Recordatorio de Pago',
      message: 'Recuerda que tienes pagos pendientes de mantenimiento y agua.',
      type: 'PAYMENT_DUE'
    },
    {
      title: 'Mantenimiento Programado',
      message: 'Se realizará mantenimiento de áreas comunes el próximo lunes.',
      type: 'GENERAL'
    },
    {
      title: 'Pago Confirmado',
      message: 'Tu pago de mantenimiento ha sido confirmado. Gracias.',
      type: 'PAYMENT_RECEIVED'
    }
  ]

  // Usar el primer residente para las notificaciones de ejemplo
  const firstResident = allResidents[0]
  
  for (const notification of notifications) {
    await prisma.notification.create({
      data: {
        title: notification.title,
        message: notification.message,
        type: notification.type,
        user: {
          connect: { id: firstResident.user.id }
        }
      }
    })
  }

  console.log('✅ Seed completado exitosamente!')
  console.log('👤 Usuarios creados:')
  console.log('   - Admin: admin@resi.com / admin123')
  console.log('   - Residente: residente@resi.com / residente123')
  console.log('   - Otros residentes: maria@resi.com, carlos@resi.com, etc. / residente123')
  console.log('💰 Pagos de ejemplo creados para los últimos 6 meses')
  console.log('📢 Notificaciones de ejemplo creadas')
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 