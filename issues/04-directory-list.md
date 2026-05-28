# Directory Listing Page

**Status:** Open

## Objective
Create the main directory views for `/professionals` and `/events`.

## Tasks
1. Create `app/professionals/page.tsx` and `app/events/page.tsx`.
2. Build reusable UI components for the listing cards (Image, Title, Category, Location).
3. Implement basic server-side filtering using URL search params (e.g., `?category=yoga`).
4. Fetch data directly from Prisma in the React Server Component.

## Constraints
- This depends on the generic Layout from `01-layout-clone.md` and the DB models from `02-data-seeding.md`.
- Keep the UI clean, adhering to the wellness aesthetic.

## Validation
- Navigating to `/professionals` lists the seeded professionals.
- Filtering by a category parameter updates the list.
