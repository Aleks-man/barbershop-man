import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/passwordHash.js'

const connectionString =
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/barbershop?schema=public'

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
})

const barbers = [
  {
    name: 'Антон',
    phone: '+7 (978) 111-22-33',
    role: 'Классические стрижки',
    description: 'Точность, аккуратность и внимание к деталям.',
  },
  {
    name: 'Макс',
    phone: '+7 (978) 222-33-44',
    role: 'Фейды и современные техники',
    description: 'Чистые переходы и уверенный современный стиль.',
  },
  {
    name: 'Денис',
    phone: '+7 (978) 333-44-55',
    role: 'Борода и бритье',
    description: 'Безупречная форма и аккуратная работа с контуром.',
  },
  {
    name: 'Алекс',
    phone: '+7 (978) 444-55-66',
    role: 'Классические стрижки',
    description: 'Классические формы, точная техника и стабильный результат.',
  },
]

const services = [
  {
    title: 'Классическая стрижка',
    description: 'Индивидуальная форма, внимание к деталям и стиль.',
    durationMin: 55,
    priceCents: 320000,
  },
  {
    title: 'Стрижка + оформление бороды',
    description: 'Полноценный уход за стрижкой и бородой в один визит.',
    durationMin: 95,
    priceCents: 490000,
  },
  {
    title: 'Оформление бороды',
    description: 'Проработка формы и контуров для аккуратного образа.',
    durationMin: 40,
    priceCents: 240000,
  },
  {
    title: 'Фейд',
    description: 'Аккуратный фейд с естественным переходом.',
    durationMin: 70,
    priceCents: 360000,
  },
  {
    title: 'Окантовка бороды',
    description: 'Четкий контур и быстрая коррекция формы.',
    durationMin: 25,
    priceCents: 120000,
  },
  {
    title: 'Камуфляж головы',
    description: 'Мягкая коррекция оттенка волос.',
    durationMin: 35,
    priceCents: 220000,
  },
  {
    title: 'Камуфляж бороды',
    description: 'Естественное тонирование бороды без резкого эффекта.',
    durationMin: 30,
    priceCents: 200000,
  },
  {
    title: 'Мужское окрашивание',
    description: 'Подбор оттенка и аккуратное окрашивание.',
    durationMin: 75,
    priceCents: 450000,
  },
  {
    title: 'Детская стрижка',
    description: 'Аккуратная стрижка для юных гостей.',
    durationMin: 45,
    priceCents: 220000,
  },
  {
    title: 'Окантовка головы',
    description: 'Быстрая коррекция линии роста и контура.',
    durationMin: 20,
    priceCents: 100000,
  },
  {
    title: 'Мытье головы и укладка',
    description: 'Финальный уход и аккуратная укладка.',
    durationMin: 25,
    priceCents: 120000,
  },
]

async function main() {
  await prisma.appointment.deleteMany()
  await prisma.barber.deleteMany()
  await prisma.service.deleteMany()

  const defaultPasswordHash = await hashPassword('111111')

  await prisma.barber.createMany({
    data: barbers.map((barber) => ({
      ...barber,
      password: '',
      passwordHash: defaultPasswordHash,
    })),
  })
  await prisma.service.createMany({ data: services })
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
