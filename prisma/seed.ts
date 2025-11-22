import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
        console.log('ADMIN_EMAIL not set in environment variables. Skipping admin creation.');
        return;
    }

    console.log(`Seeding admin user: ${adminEmail}`);

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: { role: 'ADMIN' },
        create: {
            email: adminEmail,
            name: 'Admin User',
            role: 'ADMIN',
        },
    });

    console.log({ admin });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
