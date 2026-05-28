# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: seo.spec.ts >> SEO Engine >> sitemap.xml is generated and valid
- Location: tests/seo.spec.ts:25:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 500
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('SEO Engine', () => {
  4  |   test('homepage has expected JSON-LD, metadata, and canonical link', async ({ page }) => {
  5  |     await page.goto('/');
  6  | 
  7  |     // Check title
  8  |     await expect(page).toHaveTitle(/Cusco Bienestar|UNLOCKCUSCO/);
  9  | 
  10 |     // Check canonical link
  11 |     const canonical = page.locator('link[rel="canonical"]');
  12 |     await expect(canonical).toHaveCount(1);
  13 |     
  14 |     // Check JSON-LD
  15 |     const jsonLdScripts = page.locator('script[type="application/ld+json"]');
  16 |     await expect(jsonLdScripts.first()).toBeAttached();
  17 |     
  18 |     // Extract JSON-LD content and parse it
  19 |     const jsonLdContent = await jsonLdScripts.first().textContent();
  20 |     expect(jsonLdContent).toBeTruthy();
  21 |     const parsed = JSON.parse(jsonLdContent!);
  22 |     expect(parsed['@context']).toBe('https://schema.org');
  23 |   });
  24 | 
  25 |   test('sitemap.xml is generated and valid', async ({ request }) => {
  26 |     const response = await request.get('/sitemap.xml');
> 27 |     expect(response.status()).toBe(200);
     |                               ^ Error: expect(received).toBe(expected) // Object.is equality
  28 |     expect(response.headers()['content-type']).toContain('application/xml');
  29 |     
  30 |     const text = await response.text();
  31 |     expect(text).toContain('<?xml version="1.0" encoding="UTF-8"?>');
  32 |     expect(text).toContain('<urlset');
  33 |     expect(text).toContain('<url>');
  34 |     expect(text).toContain('<loc>');
  35 |   });
  36 | 
  37 |   test('robots.txt is generated and valid', async ({ request }) => {
  38 |     const response = await request.get('/robots.txt');
  39 |     expect(response.status()).toBe(200);
  40 |     expect(response.headers()['content-type']).toContain('text/plain');
  41 |     
  42 |     const text = await response.text();
  43 |     expect(text).toContain('User-Agent: *');
  44 |     expect(text).toContain('Sitemap:');
  45 |   });
  46 | });
  47 | 
```