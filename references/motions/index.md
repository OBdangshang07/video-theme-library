# Motion Reference

Import `themes/paper-editorial/motions.js` and pass the project's single paused GSAP timeline into each helper.

```js
import { paperEditorialMotions, countUp } from "./themes/paper-editorial/motions.js";

const tl = gsap.timeline({ paused: true });
paperEditorialMotions.inkSlam(tl, "#scene-1 .headline", 0.25);
paperEditorialMotions.paperRise(tl, "#scene-1 .panel", 0.75, 0.08);
countUp(tl, document.querySelector("#metric"), 72, 1.0);
window.__timelines = { main: tl };
```

All helpers use explicit start times and finite tweens. If you extend this file, retain seek safety.
