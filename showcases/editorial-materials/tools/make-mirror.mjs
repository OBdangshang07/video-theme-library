import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const around = (count, radius, markup) => Array.from({ length: count }, (_, i) => {
  const angle = i * 360 / count;
  return `<g transform="rotate(${angle.toFixed(3)} 500 500)">${markup(radius, i)}</g>`;
}).join("\n");
const rays = around(96, 430, (r, i) =>
  `<path d="M500 ${500-r}v${i % 4 === 0 ? 30 : 17}" stroke-width="${i % 4 === 0 ? 5 : 2}"/>`);
const petals = around(20, 0, () =>
  `<path d="M500 171 C462 203 466 251 500 274 C534 251 538 203 500 171Z" stroke-width="4"/>`);
const dots = around(64, 0, (_, i) =>
  `<circle cx="500" cy="${i % 2 ? 126 : 136}" r="${i % 4 === 0 ? 5 : 3}" fill="#20262c" stroke="none"/>`);
const waves = Array.from({length:12}, (_, i) => {
  const y = 590 + i * 16;
  return `<path d="M310 ${y} Q365 ${y-13} 420 ${y} T530 ${y} T640 ${y} T695 ${y}" stroke-width="${i % 3 === 0 ? 4 : 2}"/>`;
}).join("\n");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
<g fill="none" stroke="#20262c" stroke-linejoin="round" stroke-linecap="round">
<circle cx="500" cy="500" r="464" stroke-width="9"/>
<circle cx="500" cy="500" r="448" stroke-width="3"/>
<circle cx="500" cy="500" r="406" stroke-width="7"/>
<circle cx="500" cy="500" r="390" stroke-width="2"/>
<circle cx="500" cy="500" r="356" stroke-width="3"/>
<circle cx="500" cy="500" r="304" stroke-width="7"/>
${rays}
${dots}
${petals}
<path d="M299 594 L390 451 L442 520 L510 329 L581 490 L636 422 L708 594" stroke-width="14"/>
<path d="M333 583 L390 484 L441 548 M470 476 L510 363 L550 476 M606 482 L636 453 L677 568" stroke-width="4"/>
<path d="M317 573 Q385 549 444 581 M451 575 Q515 542 577 575 M587 575 Q652 544 689 568" stroke-width="2"/>
${waves}
<path d="M327 777 Q500 810 673 777 M348 799 Q500 824 652 799" stroke-width="3"/>
</g>
</svg>`;
const output = path.join(project, "assets/mirror.svg");
fs.writeFileSync(output, svg, "utf8");
console.log(output);
