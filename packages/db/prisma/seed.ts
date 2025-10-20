import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a test user
  const testUser = await prisma.user.upsert({
    where: { phone: '+970591234567' },
    update: {},
    create: {
      phone: '+970591234567',
      passwordHash: await argon2.hash('password123'),
      name: 'Test User',
    },
  });

  console.log('✓ Created test user:', testUser.phone);

  // Create a test farm
  const testFarm = await prisma.farm.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Test Farm',
      ownerId: testUser.id,
      settings: {
        tagColorMap: {
          RAM: 'blue',
          EWE: 'pink',
          LAMB: 'yellow',
        },
      },
    },
  });

  console.log('✓ Created test farm:', testFarm.name);

  // Add user as farm owner
  await prisma.farmMember.upsert({
    where: {
      farmId_userId: {
        farmId: testFarm.id,
        userId: testUser.id,
      },
    },
    update: {},
    create: {
      farmId: testFarm.id,
      userId: testUser.id,
      role: 'OWNER',
    },
  });

  console.log('✓ Added user as farm owner');

  // Create some test animals
  const ram = await prisma.animal.create({
    data: {
      farmId: testFarm.id,
      tagNumber: 'R001',
      type: 'RAM',
      sex: 'MALE',
      status: 'ACTIVE',
      dob: new Date('2022-01-15'),
    },
  });

  const ewe1 = await prisma.animal.create({
    data: {
      farmId: testFarm.id,
      tagNumber: 'E001',
      type: 'EWE',
      sex: 'FEMALE',
      status: 'ACTIVE',
      dob: new Date('2021-03-20'),
    },
  });

  const ewe2 = await prisma.animal.create({
    data: {
      farmId: testFarm.id,
      tagNumber: 'E002',
      type: 'EWE',
      sex: 'FEMALE',
      status: 'ACTIVE',
      dob: new Date('2021-04-10'),
    },
  });

  console.log('✓ Created test animals:', {
    ram: ram.tagNumber,
    ewe1: ewe1.tagNumber,
    ewe2: ewe2.tagNumber,
  });

  // Create a breeding cycle for ewe1
  const breedingCycle = await prisma.breedingCycle.create({
    data: {
      farmId: testFarm.id,
      eweId: ewe1.id,
      ins1Date: new Date('2024-10-01'),
      status: 'OPEN',
    },
  });

  console.log('✓ Created breeding cycle for', ewe1.tagNumber);

  // Create a breeding event (INS1)
  await prisma.breedingEvent.create({
    data: {
      farmId: testFarm.id,
      cycleId: breedingCycle.id,
      eweId: ewe1.id,
      type: 'INS1',
      date: new Date('2024-10-01'),
      createdBy: testUser.id,
      payload: {
        ramId: ram.id,
        notes: 'First insemination',
      },
    },
  });

  console.log('✓ Created INS1 breeding event');

  // Create test inventory items
  const feedItem = await prisma.inventoryItem.create({
    data: {
      farmId: testFarm.id,
      name: 'Barley Feed',
      category: 'FEED',
      unit: 'kg',
      reorderLevel: 100,
    },
  });

  console.log('✓ Created inventory item:', feedItem.name);

  // Create a supplier
  const supplier = await prisma.supplier.create({
    data: {
      farmId: testFarm.id,
      name: 'Local Feed Supplier',
      phone: '+970599876543',
    },
  });

  console.log('✓ Created supplier:', supplier.name);

  // Create an inventory batch
  await prisma.inventoryBatch.create({
    data: {
      farmId: testFarm.id,
      itemId: feedItem.id,
      batchCode: 'BATCH001',
      quantity: 500,
      unitCost: 2.5,
      purchaseDate: new Date('2024-10-01'),
      supplierId: supplier.id,
    },
  });

  console.log('✓ Created inventory batch');

  console.log('');
  console.log('🎉 Database seed completed successfully!');
  console.log('');
  console.log('Test credentials:');
  console.log('  Phone: +970591234567');
  console.log('  Password: password123');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

