import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

interface BusinessExport {
  id: string;
  name: string;
  category: string;
  locationSlug: string;
  es_category?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
}

async function main() {
  console.log('=== Seeding Spiritual & Wellness Businesses ===');

  const filePath = join(process.cwd(), 'businesses-export.json');
  const businesses: BusinessExport[] = JSON.parse(readFileSync(filePath, 'utf-8'));

  const filtered = businesses.filter((b) => {
    const cat = b.category?.toLowerCase();
    const esCat = b.es_category?.toLowerCase();
    return (
      cat === 'spiritual' ||
      cat === 'wellness' ||
      esCat === 'spiritual' ||
      esCat === 'wellness'
    );
  });

  console.log(`Found ${filtered.length} spiritual/wellness businesses to seed\n`);

  let upserted = 0;
  let failed = 0;
  const usedSlugs = new Set<string>();

  for (const b of filtered) {
    const baseSlug = slugify(`${b.name}-${b.locationSlug}`);
    let slug = baseSlug;

    if (usedSlugs.has(slug)) {
      slug = `${baseSlug}-${b.id.slice(0, 8)}`;
    }
    usedSlugs.add(slug);

    const category =
      b.category.charAt(0).toUpperCase() + b.category.slice(1).toLowerCase();

    try {
      await prisma.business.upsert({
        where: { slug },
        update: {},
        create: {
          slug,
          name: b.name,
          category,
          locationSlug: b.locationSlug,
        },
      });
      console.log(`  [+] ${b.name} (${b.locationSlug})`);
      upserted++;
    } catch (err) {
      console.error(`  [!] Failed: ${b.name} — ${err}`);
      failed++;
    }
  }

  console.log(`\n=== Done: ${upserted} upserted, ${failed} failed ===`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
