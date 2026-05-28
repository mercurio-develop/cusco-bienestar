# Detail Page & Direct Contact

**Status:** Open

## Objective
Build the detail view for individual professionals/events and include direct contact links.

## Tasks
1. Create `app/professionals/[slug]/page.tsx` and `app/events/[slug]/page.tsx`.
2. Query the specific entity using the slug/id via Prisma.
3. Build the page layout to display full details (description, images, location).
4. Add direct contact buttons that link to the professional's WhatsApp and Instagram.

## Validation
- Detail pages render correctly.
- Contact buttons link to the correct WhatsApp/Instagram URLs.
