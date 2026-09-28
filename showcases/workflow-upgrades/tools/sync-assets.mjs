import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const showcase = path.resolve(here, '..');
const theme = path.join(root, 'themes/paper-editorial');
const files = [
  'tokens.css', 'components.css', 'motions.js', 'material-utils.js',
  'ink-form.js', 'movable-type.js', 'rubbing-reveal.js', 'paper-cutaway.js',
  'fonts/source-han-serif-medium.otf',
];

for (const project of ['gpt-showcase', 'mimo-review']) {
  const target = path.join(showcase, project, 'assets/theme');
  for (const file of files) {
    const destination = path.join(target, file);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(path.join(theme, file), destination);
  }
  fs.copyFileSync(path.join(root, 'showcases/editorial-materials/assets/gsap.min.js'),
    path.join(showcase, project, 'assets/gsap.min.js'));
  const sansFont = path.join(root, 'motion-reel/assets/fonts/source-han-sans-regular.otf');
  const frozenSansFont = path.join(target, 'fonts/source-han-sans-regular.otf');
  if (fs.existsSync(sansFont)) fs.copyFileSync(sansFont, frozenSansFont);
  else if (!fs.existsSync(frozenSansFont)) throw new Error(`Missing source and frozen font: ${sansFont}`);
  for (const file of ['layout.css', 'layout-motion.js', 'numeral-seal-frame.svg']) {
    fs.copyFileSync(path.join(showcase, 'shared', file),
      path.join(showcase, project, 'assets', file));
  }
}

for (const [project, name] of [
  ['gpt-showcase', 'gpt-logo-user.png'],
  ['mimo-review', 'mimo-logo-user.png'],
]) {
  fs.copyFileSync(path.join(showcase, 'reference', name),
    path.join(showcase, project, 'assets/media', name));
}
console.log('Workflow demo theme assets and supplied marks synced.');
