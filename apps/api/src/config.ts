import 'dotenv/config'

export const config = {
  adminPassword: process.env.ADMIN_PASSWORD ?? 'admin',
  adminTokenSecret: process.env.ADMIN_TOKEN_SECRET ?? 'dev-admin-token-secret',
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
}
