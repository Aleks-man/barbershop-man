import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/passwordHash.js'

const connectionString =
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/barbershop?schema=public'

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
})

async function main() {
  const barbers = await prisma.barber.findMany({
    select: {
      id: true,
      password: true,
      passwordHash: true,
    },
  })

  for (const barber of barbers) {
    if (barber.passwordHash) {
      if (barber.password) {
        await prisma.barber.update({
          where: {
            id: barber.id,
          },
          data: {
            password: '',
          },
        })
      }

      continue
    }

    const password = barber.password || '111111'

    await prisma.barber.update({
      where: {
        id: barber.id,
      },
      data: {
        password: '',
        passwordHash: await hashPassword(password),
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
