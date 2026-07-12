import * as Minio from 'minio';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
import prisma from '../src/lib/prisma';

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9200'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'skyadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'SkyParking2025'
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'gacha-items';

async function seed() {
  console.log('Starting seed...');

  const exists = await minioClient.bucketExists(BUCKET_NAME);
  if (!exists) {
    await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
    console.log(`Bucket ${BUCKET_NAME} created in MinIO.`);
  }

  const policy = {
    Version: '2012-10-17',
    Statement: [
      {
        Action: ['s3:GetObject'],
        Effect: 'Allow',
        Principal: { AWS: ['*'] },
        Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`]
      }
    ]
  };
  await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));

  console.log('Skipping TRUNCATE due to append-only triggers on point_ledger.');

  const passwordHash = bcrypt.hashSync('galihraka123', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@awanbox.biz.id',
      passwordHash,
      role: 'admin'
    }
  });

  const player1 = await prisma.user.upsert({
    where: { username: 'player1' },
    update: {},
    create: {
      username: 'player1',
      email: 'player1@awanbox.biz.id',
      passwordHash,
      role: 'user',
      wallet: {
        create: { balance: BigInt(0) }
      }
    }
  });

  const player2 = await prisma.user.upsert({
    where: { username: 'player2' },
    update: {},
    create: {
      username: 'player2',
      email: 'player2@awanbox.biz.id',
      passwordHash,
      role: 'user',
      wallet: {
        create: { balance: BigInt(0) }
      }
    }
  });

  const seedLedger = async (userId: string) => {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (wallet && wallet.balance === BigInt(0)) {
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: BigInt(500) }
      });
      await prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          userId: userId,
          sequence: BigInt(1),
          type: 'REGISTRATION_BONUS',
          direction: 'CREDIT',
          amount: BigInt(500),
          balanceBefore: BigInt(0),
          balanceAfter: BigInt(500),
          referenceType: 'seeder',
          description: 'Seeder initial balance',
          prevHash: '0000000000000000000000000000000000000000000000000000000000000000'
        }
      });
    }
  };

  await seedLedger(player1.id);
  await seedLedger(player2.id);

  console.log(`Created 3 users: admin, player1 (500 koin via ledger), player2 (500 koin via ledger).`);

  let event = await prisma.event.findFirst({ where: { name: 'Gacha Legenda Nusantara V1' } });
  if (!event) {
    event = await prisma.event.create({
      data: {
        name: 'Gacha Legenda Nusantara',
        description: 'Koleksi pahlawan dan pusaka dari kerajaan-kerajaan besar Nusantara.',
        costPerPull: 10,
        status: 'active',
        createdBy: admin.id,
        startDate: new Date(),
      }
    });
  }
  console.log(`Created event: ${event.name}`);

  const markdownPath = path.join(process.cwd(), 'card_visualization.md');
  const markdown = fs.readFileSync(markdownPath, 'utf-8');

  const cardRegex = /### \d+\.\s+([^\r\n]+)[\s\S]*?-\s+\*\*Rarity:\*\*\s+([^\r\n]+)[\s\S]*?-\s+\*\*Lore:\*\*\s+([^\r\n]+)/g;

  let match;
  let count = 0;
  const placeholderPath = path.join(process.cwd(), 'public', 'logo.png');
  const imagesDir = path.join(process.cwd(), 'public', 'images');
  const localImages = fs.existsSync(imagesDir) ? fs.readdirSync(imagesDir) : [];

  if (!fs.existsSync(placeholderPath)) {
    throw new Error(`Placeholder image not found at ${placeholderPath}`);
  }

  const items = [];
  while ((match = cardRegex.exec(markdown)) !== null) {
    const name = match[1].trim();
    const rarityText = match[2].trim().toLowerCase();
    const lore = match[3].trim();

    let rarity: any = 'common';
    if (rarityText.includes('legendary') || rarityText.includes('legendaris')) {
      rarity = 'legendary';
    } else if (rarityText.includes('epic') || rarityText.includes('epik')) {
      rarity = 'epic';
    } else if (rarityText.includes('rare')) {
      rarity = 'rare';
    }

    items.push({ name, rarity, description: lore });
  }

  const rarityCounts = {
    legendary: items.filter(i => i.rarity === 'legendary').length || 1,
    epic: items.filter(i => i.rarity === 'epic').length || 1,
    rare: items.filter(i => i.rarity === 'rare').length || 1,
    common: items.filter(i => i.rarity === 'common').length || 1,
  };

  const poolLegendary = 5.0;
  const poolEpic = 15.0;
  const poolRare = 25.0;
  const poolCommon = 55.0;

  let currentSum = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    let dropRate = 0;

    if (item.rarity === 'legendary') dropRate = poolLegendary / rarityCounts.legendary;
    else if (item.rarity === 'epic') dropRate = poolEpic / rarityCounts.epic;
    else if (item.rarity === 'rare') dropRate = poolRare / rarityCounts.rare;
    else if (item.rarity === 'common') dropRate = poolCommon / rarityCounts.common;

    dropRate = Math.floor(dropRate * 1000) / 1000;

    if (i === items.length - 1) {
      dropRate = 100 - currentSum;
      dropRate = Math.round(dropRate * 1000) / 1000;
    }

    currentSum += dropRate;

    const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const minioObjectName = `items/${slug}.png`;

    const normalizedItemName = item.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    let localImagePath = placeholderPath;
    let contentType = 'image/png';

    for (const imgFile of localImages) {
      const normalizedFileName = imgFile.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normalizedFileName.includes(normalizedItemName)) {
        localImagePath = path.join(imagesDir, imgFile);
        contentType = imgFile.endsWith('.jpg') || imgFile.endsWith('.jpeg') ? 'image/jpeg' : 'image/png';
        break;
      }
    }

    await minioClient.fPutObject(BUCKET_NAME, minioObjectName, localImagePath, {
      'Content-Type': contentType
    });

    const minioEndpoint = process.env.NEXT_PUBLIC_MINIO_ENDPOINT || `http://localhost:9000/${BUCKET_NAME}`;
    const imageUrl = `${minioEndpoint}/${minioObjectName}`;

    const existingItem = await prisma.item.findFirst({ where: { name: item.name, eventId: event.id } });

    if (existingItem) {
      await prisma.item.update({
        where: { id: existingItem.id },
        data: {
          description: item.description,
          imageUrl: imageUrl,
          rarity: item.rarity,
          dropRate: dropRate,
          sortOrder: i,
        }
      });
    } else {
      await prisma.item.create({
        data: {
          eventId: event.id,
          name: item.name,
          description: item.description,
          imageUrl: imageUrl,
          rarity: item.rarity,
          dropRate: dropRate,
          sortOrder: i,
        }
      });
    }

    count++;
  }

  console.log(`Seeded ${count} items from card_visualization.md with MinIO images!`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
