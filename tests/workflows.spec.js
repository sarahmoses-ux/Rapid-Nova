import { test, expect } from '@playwright/test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createApp } from '../backend/src/app.js';
import { hashPassword } from '../backend/src/auth.js';
import { startTestMongo, testDatabaseName } from '../backend/tests/mongo.js';

let app, directory, mongo;
const base = 'http://127.0.0.1:3107';
const password = 'browser-test-password-123';
test.beforeAll(async () => {
  directory = mkdtempSync(join(tmpdir(), 'rapid-nova-browser-'));
  mongo = await startTestMongo();
  app = await createApp({ mongoUri: mongo.getUri(), databaseName: testDatabaseName(), distDir: resolve('dist'), admin: { email: 'team@example.test', passwordHash: await hashPassword(password) }, publicOrigin: base });
  await new Promise(done => app.server.listen(3107, '127.0.0.1', done));
});
test.afterAll(async () => { await app?.close(); await mongo?.stop(); if (directory) rmSync(directory, { recursive: true, force: true }); });

test('publish a job, apply with a CV, submit enquiries, and review in admin', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${base}/admin`);
  await page.getByLabel('Email address').fill('team@example.test');
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.getByRole('button', { name: /Vacancies/ }).click();
  await page.getByRole('button', { name: 'Create Vacancy' }).click();
  await page.getByLabel('Job title').fill('Travel Registered Nurse');
  await page.getByLabel('Location', { exact: false }).fill('Test City');
  await page.getByLabel('Description and requirements').fill('A test vacancy for a qualified registered nurse.');
  await page.getByRole('button', { name: 'Save Vacancy' }).click();
  await expect(page.getByRole('heading', { name: 'Travel Registered Nurse' })).toBeVisible();
  await page.goto(`${base}/careers`);
  await expect(page.getByRole('heading', { name: 'Travel Registered Nurse' })).toBeVisible();
  await page.getByRole('link', { name: 'Apply for this role' }).click();
  const application = page.locator('#apply');
  await expect(application.getByText('Applying for Travel Registered Nurse', { exact: false })).toBeVisible();
  await application.getByLabel('Full name').fill('Browser Candidate');
  await application.getByLabel('Email address').fill('candidate@example.test');
  await application.getByLabel('Preferred location').fill('Test City');
  await application.getByLabel('Your CV').setInputFiles({ name: 'candidate.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF') });
  await application.getByRole('checkbox').check();
  await application.getByRole('button', { name: 'Submit Application' }).click();
  await expect(application.getByText('Thank you. Your submission has been received.')).toBeVisible();
  await page.goto(`${base}/contact`);
  const contact = page.locator('#contact');
  await contact.getByLabel('Your name').fill('Browser Facility');
  await contact.getByLabel('Email address').fill('facility@example.test');
  await contact.getByLabel('Facility or organisation').fill('Test Clinic');
  await contact.getByLabel('Role needed').fill('Allied Health');
  await contact.getByLabel('Facility location').fill('Test City');
  await contact.getByRole('checkbox').check();
  await contact.getByRole('button', { name: 'Submit Staffing Request' }).click();
  await expect(contact.getByText('Thank you. Your submission has been received.')).toBeVisible();
  await contact.getByRole('button', { name: 'General Enquiry' }).click();
  await contact.getByLabel('Your name').fill('Browser Contact');
  await contact.getByLabel('Email address').fill('contact@example.test');
  await contact.getByLabel('Your message').fill('Please contact me about your services.');
  await contact.getByRole('checkbox').check();
  await contact.getByRole('button', { name: 'Send Message' }).click();
  await expect(contact.getByText('Thank you. Your submission has been received.')).toBeVisible();
  await page.goto(`${base}/admin`);
  await expect(page.getByRole('heading', { name: 'Browser Candidate' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Browser Facility' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Browser Contact' })).toBeVisible();
  const candidate = page.locator('article').filter({ has: page.getByRole('heading', { name: 'Browser Candidate' }) });
  await candidate.locator('summary').click();
  await candidate.getByLabel('Status').selectOption('contacted');
  await candidate.getByLabel('Internal notes').fill('Ready for a call.');
  await candidate.getByRole('button', { name: 'Save Changes' }).click();
  await expect(candidate.getByText('Changes saved.')).toBeVisible();
  const downloadPromise = page.waitForEvent('download'); await candidate.getByRole('link', { name: 'Download CV (PDF)' }).click();
  expect((await downloadPromise).suggestedFilename()).toMatch(/^cv-.*\.pdf$/);
  await page.reload(); await candidate.locator('summary').click(); await expect(candidate.getByLabel('Status')).toHaveValue('contacted'); await expect(candidate.getByLabel('Internal notes')).toHaveValue('Ready for a call.');
  await page.getByLabel('Search submissions on this page').fill('no-matching-person');
  await expect(page.getByRole('heading', { name: 'No matching submissions' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await page.getByLabel('Submission type').selectOption('staffing');
  await expect(page.getByRole('heading', { name: 'Browser Facility' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Browser Candidate' })).toHaveCount(0);
  await page.getByLabel('Submission type').selectOption('all');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: 'test-results/admin-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/admin-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Sign Out' }).click();
  await expect(page.getByRole('heading', { name: 'Team Sign In' })).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.screenshot({ path: 'test-results/admin-signin.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByLabel('Password', { exact: true }).fill('visibility-check');
  await page.getByRole('button', { name: 'Show password' }).click();
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Hide password' }).click();
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'password');
  expect(errors).toEqual([]);
});

test('mobile layout fits the screen and navigation reaches application form', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto(base);
  await page.getByRole('button', { name: 'Toggle menu' }).click();
  await page.getByRole('link', { name: 'Apply Now', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Toggle menu' })).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('heading', { name: 'Apply with Rapid Nova' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/mobile-application.png' });
});

test('international career information, accessible navigation, and responsive layouts', async ({ page }) => {
  await page.goto(base);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your calling.Your next chapter.A world of possibility.');
  await page.locator('.rn-menu').getByRole('link', { name: 'International nursing', exact: true }).click();
  await expect(page).toHaveURL(/\/international-nursing$/);
  await expect(page.locator('#international').getByRole('link', { name: 'Start your international enquiry' })).toBeVisible();
  const question = page.locator('#faq details').filter({ hasText: 'Are visa sponsorship and relocation included?' });
  await question.locator('summary').click();
  await expect(question.locator('p')).toBeVisible();
  await expect(question.locator('p')).toContainText('depend on the employer');
  await question.locator('summary').click();
  await expect(question.locator('p')).toBeHidden();
  await page.goto(base);
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    if (width === 390 || width === 1440) await page.screenshot({ path: `test-results/refined-home-${width}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  const menu = page.getByRole('button', { name: 'Toggle menu' });
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeFocused();
  await page.locator('.rn-career-card').filter({ hasText: 'Registered nurses' }).click();
  await expect(page.getByRole('textbox', { name: 'Healthcare role or specialty' })).toHaveValue('Registered Nurse');
  await expect(page.getByRole('textbox', { name: 'Healthcare role or specialty' })).toBeFocused();
});

test('distinct pages support direct visits, refresh, and browser history', async ({ page }) => {
  for (const path of ['/careers', '/international-nursing', '/staffing', '/about', '/resources', '/apply', '/contact']) {
    const response = await page.goto(`${base}${path}`);
    expect(response.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.reload();
    await expect(page).toHaveURL(`${base}${path}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await page.locator('main #apply').count()).toBe(path === '/apply' ? 1 : 0);
    expect(await page.locator('main #contact').count()).toBe(path === '/contact' ? 1 : 0);
  }
  await page.goto(base);
  await page.locator('.rn-menu').getByRole('link', { name: 'For professionals' }).click();
  await expect(page).toHaveURL(`${base}/careers`);
  await expect(page.locator('.rn-menu a[aria-current="page"]')).toHaveText('For professionals');
  await page.goBack();
  await expect(page).toHaveURL(`${base}/`);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Your calling.');
  await page.goto(`${base}/staffing#pricing`);
  await expect(page.locator('#pricing')).toBeInViewport();
});

test('motion animates normally and stays visible with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(base);
  await expect(page.locator('.rn-photo-card')).toHaveCSS('animation-name', 'rn-float');
  await page.locator('#about').scrollIntoViewIfNeeded();
  await expect(page.locator('#about')).toHaveClass(/rn-visible/);
  await expect(page.locator('#about')).toHaveCSS('opacity', '1');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.rn-photo-card')).toHaveCSS('animation-name', 'none');
  await page.goto(`${base}/international-nursing`);
  await expect(page.locator('.rn-orbit-one')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('#international')).toHaveCSS('opacity', '1');
});

test('photo-led career paths, placement tabs, specialty searches, and guides work', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto(`${base}/careers`);
  await expect(page.locator('.rn-photo-path')).toHaveCount(3);
  const tab = page.getByRole('tab', { name: 'Local & per diem' });
  await tab.click();
  await expect(tab).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toContainText('Your skills. Your community.');
  await tab.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Permanent roles' })).toBeFocused();
  await expect(page.getByRole('tabpanel')).toContainText('Put down roots. Keep growing.');
  const searched = page.waitForResponse(response => new URL(response.url()).pathname === '/api/jobs' && new URL(response.url()).searchParams.get('q') === 'Intensive Care');
  await page.locator('.rn-specialty-links').getByRole('link', { name: 'Intensive Care' }).click();
  expect((await searched).status()).toBe(200);
  await expect(page.getByRole('textbox', { name: 'Healthcare role or specialty' })).toHaveValue('Intensive Care');
  await page.goto(`${base}/resources`);
  const guide = page.locator('#cv-guide');
  await guide.locator('summary').click();
  await expect(guide.locator('ul')).toBeVisible();
  await expect(guide.locator('ul')).toContainText('Save a clear PDF under 3 MB');
  for (const path of ['/careers', '/international-nursing', '/resources']) {
    await page.goto(`${base}${path}`);
    await page.setViewportSize({ width: 390, height: 844 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.evaluate(async () => {
      document.querySelectorAll('main img').forEach(img => { img.loading = 'eager'; });
      await Promise.all([...document.querySelectorAll('main img')].map(img => img.decode()));
    });
    expect(await page.locator('main img').evaluateAll(images => images.every(img => img.naturalWidth > 0))).toBe(true);
    await page.screenshot({ path: `test-results/photo-${path.slice(1)}-mobile.png`, fullPage: true });
  }
  await page.goto(`${base}/careers`);
  await page.setViewportSize({ width: 1440, height: 960 });
  const imageResponse = await page.request.get(await page.locator('.rn-heading-photo img').evaluate(img => img.src));
  expect(imageResponse.headers()['content-type']).toBe('image/jpeg');
  await page.screenshot({ path: 'test-results/photo-careers-hero.png' });
  await page.screenshot({ path: 'test-results/photo-careers-desktop.png', fullPage: true });
});
