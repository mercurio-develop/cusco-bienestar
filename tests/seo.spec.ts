import { test, expect } from '@playwright/test';

test.describe('SEO Engine', () => {
  test('homepage has expected JSON-LD, metadata, and canonical link', async ({ page }) => {
    await page.goto('/');

    // Check title
    await expect(page).toHaveTitle(/Cusco Bienestar/);

    // Check canonical link
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveCount(1);
    
    // Check JSON-LD
    const jsonLdScripts = page.locator('script[type="application/ld+json"]');
    await expect(jsonLdScripts.first()).toBeAttached();
    
    // Extract JSON-LD content and parse it
    const jsonLdContent = await jsonLdScripts.first().textContent();
    expect(jsonLdContent).toBeTruthy();
    const parsed = JSON.parse(jsonLdContent!);
    expect(parsed['@context']).toBe('https://schema.org');
  });

  test('sitemap.xml is generated and valid', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/xml');
    
    const text = await response.text();
    expect(text).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(text).toContain('<urlset');
    expect(text).toContain('<url>');
    expect(text).toContain('<loc>');
  });

  test('robots.txt is generated and valid', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/plain');
    
    const text = await response.text();
    expect(text).toContain('User-Agent: *');
    expect(text).toContain('Sitemap:');
  });
});
