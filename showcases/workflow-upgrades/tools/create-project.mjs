import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const showcase = path.resolve(here, '..');
const variants = new Map([
  ['work-showcase', 'gpt-showcase'],
  ['six-dimension', 'mimo-review'],
]);

function usage() {
  throw new Error('Usage: node create-project.mjs --workflow work-showcase|six-dimension --output <new-directory>');
}

const args = process.argv.slice(2);
const option = (flag) => {
  const index = args.indexOf(flag);
  if (index < 0 || !args[index + 1] || args[index + 1].startsWith('--')) usage();
  return args[index + 1];
};
const variant = option('--workflow');
const sample = variants.get(variant);
if (!sample) usage();
const destination = path.resolve(option('--output'));
if (fs.existsSync(destination)) throw new Error(`Output already exists: ${destination}`);

const source = path.join(showcase, sample);
const assetSource = path.join(source, 'assets');
const assetDestination = path.join(destination, 'assets');
fs.mkdirSync(path.join(assetDestination, 'media'), {recursive: true});
fs.cpSync(path.join(assetSource, 'theme'), path.join(assetDestination, 'theme'), {recursive: true});
for (const file of ['gsap.min.js', 'layout.css', 'layout-motion.js', 'numeral-seal-frame.svg']) {
  fs.copyFileSync(path.join(assetSource, file), path.join(assetDestination, file));
}
const html = fs.readFileSync(path.join(source, 'index.html'), 'utf8');
fs.writeFileSync(path.join(destination, 'index.html'), html);
const config = JSON.parse(fs.readFileSync(path.join(source, 'hyperframes.json'), 'utf8'));
const slug = path.basename(destination).toLowerCase().replace(/[^a-z0-9-]/g, '-') || variant;
config.projectId = `paper-editorial-${slug}`;
config.output = `renders/${slug}.mp4`;
fs.writeFileSync(path.join(destination, 'hyperframes.json'), `${JSON.stringify(config, null, 2)}\n`);

const mediaSlots = [...new Set([...html.matchAll(/\.\/assets\/media\/([^'"\s<>]+)/g)].map(match => match[1]))].sort();
console.log(JSON.stringify({
  project: destination,
  workflow: variant,
  copied: ['index.html', 'hyperframes.json', 'assets/gsap.min.js', 'assets/layout.css', 'assets/layout-motion.js', 'assets/numeral-seal-frame.svg', 'assets/theme/'],
  mediaSlots,
  note: 'Replace every demo media slot, text, fact, score, and timing before rendering a finished video.',
}, null, 2));
