# Data Seeding (Spiritual & Wellness)

**Status:** Open

## Objective
Filter the `businesses-export.json` file to only include categories `spiritual` and `wellness` and seed our local Supabase/Prisma database.

## Tasks
1. Review `prisma/schema.prisma` and ensure `Professional` and `Category` models exist.
2. Write a script `scripts/seed-wellness.ts` that reads `businesses-export.json`.
3. Filter businesses where `category` or `es_category` is 'spiritual' or 'wellness'.
4. Insert these businesses and their sub-categories into the database using Prisma.
5. Add a package.json command `npm run db:seed` to execute this script.

## Validation
- Running `npm run db:seed` should populate the database without errors.
- Verify records in Prisma Studio or using a simple script.
