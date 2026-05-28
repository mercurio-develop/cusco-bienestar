# SEO Engine

**Status:** Open

## Objective
Set up the technical SEO foundation for the directory.

## Tasks
1. Create a generic SEO component to output JSON-LD (`<script type="application/ld+json">`).
2. Create a dynamic `app/sitemap.ts` that will eventually fetch all events and professionals from the database to generate the XML sitemap. For now, mock the DB call or connect it to Prisma.
3. Add a `app/robots.txt` generator.
4. Ensure default `generateMetadata` exports are present in `app/layout.tsx` and `app/page.tsx`.

## Validation
- Inspecting page source should show correct meta tags.
- Accessing `/sitemap.xml` should render valid XML.
