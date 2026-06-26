import type { AdminAppointmentPayload } from './adminSelects.js'
import { config } from './config.js'

const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')

const formatAppointmentDate = (value: Date) => dateTimeFormatter.format(value)

export const notifyAdminTelegramAppointmentCreated = async (
  appointment: AdminAppointmentPayload,
) => {
  if (!config.telegramBotToken || !config.telegramAdminChatId) {
    return
  }

  const text = [
    '<b>Новая запись</b>',
    '',
    `Запись: ${escapeHtml(formatAppointmentDate(appointment.startsAt))}`,
    `Мастер: ${escapeHtml(appointment.barber.name)}`,
    `Услуга: ${escapeHtml(appointment.service.title)}`,
    '',
    `Клиент: ${escapeHtml(appointment.customerName)}`,
    `Телефон: ${escapeHtml(appointment.customerPhone)}`,
  ].join('\n')

  const response = await fetch(
    `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`,
    {
      body: JSON.stringify({
        chat_id: config.telegramAdminChatId,
        disable_web_page_preview: true,
        parse_mode: 'HTML',
        text,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    },
  )

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`Telegram notification failed: ${response.status} ${errorText}`)
  }
}
