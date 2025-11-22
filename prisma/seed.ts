import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
        console.log('ADMIN_EMAIL not set, skipping seed');
        return;
    }

    console.log(`Seeding admin user: ${adminEmail}`);

    // Note: stackId will be set when admin first signs in with Stack Auth
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: { role: 'ADMIN' },
        create: {
            stackId: `temp-${Date.now()}`, // Temporary ID, will be updated on first sign-in
            email: adminEmail,
            name: 'Admin',
            role: 'ADMIN',
        },
    });

    console.log('Admin user created/updated:', admin);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
