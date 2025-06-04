import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10); // Şifreniz
  await prisma.user.upsert({
    where: { email: 'admin@servisline.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@servisline.com',
      password,
      role: 'ADMIN'
    }
  });
  console.log('Admin user created!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect()); 