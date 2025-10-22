const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');

const prisma = new PrismaClient();

async function testLogin() {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { phone: '+970591234567' }
    });

    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    console.log('✅ User found:', {
      id: user.id,
      phone: user.phone,
      name: user.name,
      passwordHash: user.passwordHash.substring(0, 20) + '...'
    });

    // Test password
    const isValid = await argon2.verify(user.passwordHash, 'password123');
    console.log('Password verification:', isValid ? '✅ Valid' : '❌ Invalid');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();



