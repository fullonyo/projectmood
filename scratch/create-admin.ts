import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@mood.com'
  const password = 'admin'
  const username = 'admin'
  const hashedPassword = await bcrypt.hash(password, 10)

  console.log('--- Criando Usuário Admin ---')
  
  const user = await prisma.user.upsert({
    where: { email },
    update: {
        role: 'ADMIN',
        username: 'admin'
    },
    create: {
      email,
      username,
      name: 'Administrador',
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true
    }
  })

  console.log('Usuário criado:', user.email)

  // Criar sala primária se não existir
  const room = await prisma.room.upsert({
      where: { slug: 'admin' },
      update: {},
      create: {
          userId: user.id,
          title: 'Meu Espaço Admin',
          slug: 'admin',
          isPrimary: true,
          theme: 'dark',
          uiTheme: 'dark'
      }
  })

  console.log('Sala criada:', room.slug)
  console.log('--- Sucesso! ---')
  console.log('Email:', email)
  console.log('Senha:', password)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
