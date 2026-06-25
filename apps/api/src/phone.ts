const getRussianPhoneDigits = (value: string) => {
  const digits = value.replace(/\D/g, '')

  if (digits.startsWith('8') || digits.startsWith('7')) {
    return digits.slice(1, 11)
  }

  return digits.slice(0, 10)
}

export const normalizeRussianPhone = (value: string) => {
  const digits = getRussianPhoneDigits(value)

  if (digits.length !== 10) {
    return ''
  }

  return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`
}
