import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)
const keyLength = 64
const passwordHashPrefix = 'scrypt'

export const hashPassword = async (password: string) => {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = (await scryptAsync(password, salt, keyLength)) as Buffer

  return `${passwordHashPrefix}:${salt}:${derivedKey.toString('hex')}`
}

export const generateTemporaryPassword = () =>
  `GR-${randomBytes(6).toString('base64url')}`

export const verifyPasswordHash = async (password: string, passwordHash: string) => {
  const [algorithm, salt, storedKey] = passwordHash.split(':')

  if (algorithm !== passwordHashPrefix || !salt || !storedKey) {
    return false
  }

  const derivedKey = (await scryptAsync(password, salt, keyLength)) as Buffer
  const storedKeyBuffer = Buffer.from(storedKey, 'hex')

  return (
    storedKeyBuffer.length === derivedKey.length &&
    timingSafeEqual(storedKeyBuffer, derivedKey)
  )
}
