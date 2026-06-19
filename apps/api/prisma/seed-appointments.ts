import { PrismaPg } from '@prisma/adapter-pg'
import { AppointmentStatus, PrismaClient } from '@prisma/client'

const connectionString =
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/barbershop?schema=public'

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
})

const customerNames = [
  'Игорь Смирнов',
  'Артем Волков',
  'Дмитрий Орлов',
  'Кирилл Морозов',
  'Никита Соколов',
  'Максим Егоров',
  'Павел Козлов',
  'Сергей Лебедев',
  'Алексей Новиков',
  'Роман Федоров',
]

const statuses = [
  AppointmentStatus.CONFIRMED,
  AppointmentStatus.CONFIRMED,
  AppointmentStatus.PENDING,
  AppointmentStatus.CANCELLED,
  AppointmentStatus.CONFIRMED,
  AppointmentStatus.PENDING,
  AppointmentStatus.COMPLETED,
  AppointmentStatus.CONFIRMED,
  AppointmentStatus.PENDING,
  AppointmentStatus.CONFIRMED,
]

const getAppointmentStart = (index: number) => {
  const date = new Date()
  date.setDate(date.getDate() + (index < 4 ? -4 + index : Math.floor((index - 4) / 3) + 1))
  date.setHours(10 + (index % 5) * 2, index % 2 === 0 ? 0 : 30, 0, 0)

  return date
}

async function main() {
  const [barbers, services] = await Promise.all([
    prisma.barber.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    }),
    prisma.service.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        title: 'asc',
      },
    }),
  ])

  if (barbers.length === 0 || services.length === 0) {
    throw new Error('Run prisma:seed before prisma:seed:appointments')
  }

  await prisma.appointment.deleteMany({
    where: {
      customerPhone: {
        startsWith: '+79780000',
      },
    },
  })

  for (let index = 0; index < 10; index += 1) {
    const service = services[index % services.length]
    const barber = barbers[index % barbers.length]
    const startsAt = getAppointmentStart(index)
    const endsAt = new Date(startsAt.getTime() + service.durationMin * 60 * 1000)

    await prisma.appointment.create({
      data: {
        barberId: barber.id,
        customerName: customerNames[index],
        customerPhone: `+79780000${String(index).padStart(3, '0')}`,
        endsAt,
        serviceId: service.id,
        startsAt,
        status: statuses[index],
      },
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error: unknown) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
