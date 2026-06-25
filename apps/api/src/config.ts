import 'dotenv/config'

const isEnabled = (value: string | undefined) =>
  value === '1' || value === 'true' || value === 'yes'

export const config = {
  adminPassword: process.env.ADMIN_PASSWORD ?? 'admin',
  adminTokenSecret: process.env.ADMIN_TOKEN_SECRET ?? 'dev-admin-token-secret',
  protectDefaultStaff: isEnabled(process.env.PROTECT_DEFAULT_STAFF),
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
}
