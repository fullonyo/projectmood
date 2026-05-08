import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const count = await prisma.user.count()
  console.log('User count:', count)
  const users = await prisma.user.findMany({ take: 5, select: { email: true, username: true } })
  console.log('Sample users:', users)
}
main().finally(() => prisma.$disconnect())
