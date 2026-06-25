export const phoneMask = '+7 (___) ___-__-__'

export const getPhoneDigits = (value: string) => {
  const digits = value.replace(/\D/g, '')

  if (digits.startsWith('8') || digits.startsWith('7')) {
    return digits.slice(1, 11)
  }

  return digits.slice(0, 10)
}

export const formatPhoneInput = (value: string) => {
  const digits = getPhoneDigits(value)

  if (!digits) {
    return ''
  }

  if (digits.length <= 3) {
    return `+7 (${digits}`
  }

  if (digits.length <= 6) {
    return `+7 (${digits.slice(0, 3)}) ${digits.slice(3)}`
  }

  if (digits.length <= 8) {
    return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`
}

export const normalizePhone = (value: string) => {
  const digits = getPhoneDigits(value)

  if (digits.length !== 10) {
    return ''
  }

  return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`
}
