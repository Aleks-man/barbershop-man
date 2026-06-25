import type { Prisma } from '@prisma/client'

export const adminAppointmentSelect = {
  id: true,
  customerName: true,
  customerPhone: true,
  startsAt: true,
  endsAt: true,
  status: true,
  barber: {
    select: {
      id: true,
      name: true,
    },
  },
  service: {
    select: {
      id: true,
      title: true,
    },
  },
} satisfies Prisma.AppointmentSelect

export const adminNotificationSelect = {
  id: true,
  createdAt: true,
  readAt: true,
  recipientRole: true,
  barberId: true,
  appointment: {
    select: adminAppointmentSelect,
  },
} satisfies Prisma.AdminNotificationSelect

export const adminTimeOffSelect = {
  id: true,
  reason: true,
  startsAt: true,
  endsAt: true,
  barber: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.BarberTimeOffSelect

export const adminBarberSelect = {
  description: true,
  experience: true,
  id: true,
  isActive: true,
  name: true,
  password: true,
  photoUrl: true,
  role: true,
} satisfies Prisma.BarberSelect
