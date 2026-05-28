/**
 * Pre-deploy validation for static landing + Vercel serverless API.
 * Ensures required files and asset references exist before Vercel deploy.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const REQUIRED_FILES = [
  'index.html',
  'privacy.html',
  'css/style.css',
  'js/main.js',
  'api/send.js',
  'robots.txt',
  'sitemap.xml',
  'images/favicon.ico',
  'images/apple-touch-icon.png',
  'images/og-image.png',
  'images/master-photo.png',
  'images/work-7.png',
  'images/work-8.png',
  'images/work-9.png',
  'images/work-10.png',
  'videos/process.mp4',
];

const VK_MESSAGES_URL = 'https://vk.com/im/convo/-238183715?entrypoint=community_page&tab=all';
const VK_GROUP_URL = 'https://vk.com/anjelika_tattoo_vrn';

function fail(message) {
  console.error(`\n[build] ERROR: ${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`[build] OK: ${message}`);
}

console.log('[build] Validating project...\n');

for (const file of REQUIRED_FILES) {
  const fullPath = join(root, file);
  if (!existsSync(fullPath)) {
    fail(`Missing required file: ${file}`);
  }
  ok(file);
}

const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');

const assetMatches = [
  ...indexHtml.matchAll(/(?:src|href)=["'](images\/[^"']+)["']/g),
].map((m) => m[1]);

for (const asset of new Set(assetMatches)) {
  if (!existsSync(join(root, asset))) {
    fail(`Broken asset reference in index.html: ${asset}`);
  }
}

ok(`${assetMatches.length} asset references in index.html`);

function extractHrefFromTag(html, className) {
  const tagMatch = html.match(new RegExp(`<a\\s[^>]*class="[^"]*${className}[^"]*"[^>]*>`, 'i'))
    || html.match(new RegExp(`<a\\s[^>]*${className}[^>]*>`, 'i'));
  if (!tagMatch) return null;
  const hrefMatch = tagMatch[0].match(/href=["']([^"']+)["']/);
  return hrefMatch ? hrefMatch[1] : null;
}

function extractHrefFromSection(html, sectionClass, buttonClass) {
  const sectionMatch = html.match(new RegExp(`class="[^"]*${sectionClass}[^"]*"[\\s\\S]*?</div>`, 'i'));
  if (!sectionMatch) return null;
  const buttonMatch = sectionMatch[0].match(new RegExp(`<a\\s[^>]*${buttonClass}[^>]*>`, 'i'));
  if (!buttonMatch) return null;
  const hrefMatch = buttonMatch[0].match(/href=["']([^"']+)["']/);
  return hrefMatch ? hrefMatch[1] : null;
}

const primaryCtaChecks = [
  { name: 'Header CTA', url: extractHrefFromTag(indexHtml, 'nav__link--cta') },
  { name: 'Hero primary CTA', url: extractHrefFromSection(indexHtml, 'hero__actions', 'btn--primary') },
  { name: 'About primary CTA', url: extractHrefFromTag(indexHtml, 'about__cta') },
  { name: 'Final primary CTA', url: extractHrefFromSection(indexHtml, 'cta__actions', 'btn--primary') },
  { name: 'Floating CTA', url: extractHrefFromTag(indexHtml, 'floating-cta__btn') },
];

for (const { name, url } of primaryCtaChecks) {
  if (!url) fail(`Primary CTA not found: ${name}`);
  if (url !== VK_MESSAGES_URL) fail(`${name} must link to VK messages. Found: ${url}`);
}

ok('All primary CTAs point to VK messages');

const secondaryCtaChecks = [
  { name: 'Hero secondary CTA', url: extractHrefFromSection(indexHtml, 'hero__actions', 'btn--cta-secondary') },
  { name: 'About secondary CTA', url: extractHrefFromTag(indexHtml, 'about__cta-secondary') },
  { name: 'Final secondary CTA', url: extractHrefFromSection(indexHtml, 'cta__actions', 'btn--cta-secondary') },
];

for (const { name, url } of secondaryCtaChecks) {
  if (!url) fail(`Secondary CTA not found: ${name}`);
  if (url !== VK_GROUP_URL) fail(`${name} must link to VK group. Found: ${url}`);
}

ok('All secondary CTAs point to VK group');

const seoChecks = [
  { name: 'Meta title', pattern: /<title>Тату мастер Анжелика в Воронеже/ },
  { name: 'Meta description', pattern: /name="description" content="Аккуратные тату в Воронеже/ },
  { name: 'OG title', pattern: /property="og:title" content="Тату мастер Анжелика/ },
  { name: 'OG image', pattern: /property="og:image" content="PLACEHOLDER_URL\/images\/og-image\.png"/ },
  { name: 'Twitter card', pattern: /name="twitter:card" content="summary_large_image"/ },
  { name: 'Aftercare section', pattern: /id="aftercare"/ },
  { name: 'Atmosphere video', pattern: /id="atmosphere"/ },
  { name: 'Real reviews', pattern: /review-card__name">Артём/ },
  { name: 'Floating CTA', pattern: /id="floating-cta"/ },
  { name: 'ProfessionalService schema', pattern: /"@type": "ProfessionalService"/ },
];

for (const { name, pattern } of seoChecks) {
  if (!pattern.test(indexHtml)) fail(`SEO check failed: ${name}`);
  ok(`SEO: ${name}`);
}

if (!indexHtml.includes('css/style.css')) fail('Missing css/style.css link');
if (!indexHtml.includes('js/main.js')) fail('Missing js/main.js script');

ok('HTML entry references CSS and JS');

const sendApi = readFileSync(join(root, 'api/send.js'), 'utf8');
if (!sendApi.includes('export default')) {
  fail('api/send.js must export a default handler for Vercel');
}

ok('Vercel serverless API handler present');

console.log('\n[build] Validation passed. Ready for deploy.\n');
