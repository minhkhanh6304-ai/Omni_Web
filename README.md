# Creative Desk

A responsive, Vietnamese TikTok Shop creative tracker for e-commerce performance marketing.

Live: https://minhkhanh6304-ai.github.io/Omni_Web/

The crystal studio theme includes a locally bundled Three.js scene with rose glass, quartz, reflective spheres, pointer parallax and floating glass cards. Motion can be paused, respects reduced-motion preferences and stops rendering when the scene is off screen. Devices without WebGL retain a CSS illustration and the fully usable tracker. Three.js is distributed under its MIT license in `vendor/THREE-LICENSE.txt`.

## Features

- Track videos, KOC/KOL creators, shop products, content pillars and angles.
- Daily ad cost, GMV, impressions, clicks and orders; calculated ROI, CTR and CR.
- Date filters, search, sorting, creator/product summaries and creative insights.
- Configurable Scale / Maintain / Optimize / Stop rules and ROI fatigue signals.
- Edit records, import/export CSV, back up and restore JSON.
- Browser-local persistence with illustrative demo data. No TikTok API connection.

ROI means GMV divided by ad cost, not net profit. Insights are rule-based signals.

## GitHub Pages

Publish the `main` branch from `/ (root)` under **Settings → Pages**. All assets use relative paths, so the app works under the repository path without a build step.

## Data storage

Personal data is stored only in the current browser's local storage. It is not uploaded to this repository. Different domains and browsers have separate storage. Use **Quy tắc đánh giá → Sao lưu JSON**, then **Import data** to move your data to another domain.

## Local preview

Serve this directory with any static HTTP server and open `index.html`.
