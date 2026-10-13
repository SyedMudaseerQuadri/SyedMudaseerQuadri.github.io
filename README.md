# 墨 Syed Mudaseer — Portfolio

Personal portfolio of **Syed Mudaseer Quadri**, Product & UI/UX Designer (Hyderabad, IN).

**Live site:** [syedmudaseerquadri.github.io](https://syedmudaseerquadri.github.io/)

![Theme](https://img.shields.io/badge/theme-sumi--e-111110?style=flat-square)
![Built with](https://img.shields.io/badge/built%20with-HTML%20%2B%20CSS%20%2B%20JS-b3272d?style=flat-square)
![Dependencies](<https://img.shields.io/badge/dependencies-Three.js%20(CDN)-3c3a36?style=flat-square>)

---

## About

A single-page portfolio designed around Japanese _sumi-e_ (ink-wash) aesthetics — washi-paper white, sumi black, and one vermilion _hanko_ seal as the only accent color. The whole site ships as **one self-contained HTML file** with all images embedded, so hosting it is as simple as uploading three files.

## ✒️ The Suminagashi hero

The hero section is an interactive **Suminagashi** (墨流し, "floating ink") simulation — the 12th-century Japanese art of marbling paper with rings of ink dropped on water.

- Real-time **GPU fluid simulation** (Stable Fluids: advection, vorticity confinement, pressure projection) written in GLSL, running on Three.js
- **Move your cursor** to stir the ink · **click / tap** to drop concentric alternating rings, exactly like the traditional technique
- Idle auto-drops keep the pool alive; the sim pauses when off-screen or when the tab is hidden
- Respects `prefers-reduced-motion` and falls back to a static ink-ring background if WebGL is unavailable

## Tech

| Layer           | Choice                                                                                       |
| --------------- | -------------------------------------------------------------------------------------------- |
| Markup / styles | Hand-written HTML + CSS (no framework, no build step)                                        |
| Type            | [Zen Old Mincho](https://fonts.google.com/specimen/Zen+Old+Mincho) + Inter, via Google Fonts |
| Hero simulation | [Three.js r128](https://threejs.org/) (CDN) + custom GLSL shaders                            |
| Animations      | CSS transitions driven by `IntersectionObserver` — no animation library                      |
| Images          | Embedded as base64 (site is a single portable file)                                          |

## Repository structure

```
.
├── index.html            # the entire site — markup, styles, shaders, JS
├── resume.pdf            # served by the "Résumé ↓" download buttons
└── README.md
```

## Running locally

No build step. Either open `index.html` directly, or serve the folder so the
résumé download resolves:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Updating the résumé

The site links to `resume.pdf` by filename — it is **not** embedded in the HTML.
To publish a new résumé, just replace `resume.pdf` with the new file (same name)
and push. Recruiters always download it as `Syed-Mudaseer-UIUX-Resume.pdf`.

## Deploying (GitHub Pages)

1. Push this repo to GitHub
2. **Settings → Pages → Source:** deploy from branch `main`, folder `/ (root)`
3. Your site goes live at `https://<username>.github.io/<repo>/`
   (add a custom domain under the same settings panel if you have one)

## Featured work

**Daily Recall** — a reading-retention app that scans a page you read and turns
it into an AI summary, a word game and spaced flashcards. Researched, designed,
built as a working app and usability-tested end to end. Full case study on the site.

**T Vastra** — a black, premium storefront for an Indian embroidered-tee label.
Built around a signature "venom" colour shift (live SVG tees), micro-interactions
on every product card, and an independent AI code review before handover.
Full case study on the site; the working store is private (demo on request).

## Contact

- ✉️ [syed.designuiux@gmail.com](mailto:syed.designuiux@gmail.com)
- 💼 [linkedin.com/in/syed-mudaseer](https://www.linkedin.com/in/syed-mudaseer/)
- 🏀 [dribbble.com/mudaseer-quadri](https://dribbble.com/mudaseer-quadri)

---

<p align="center">墨 — designed & built by Syed Mudaseer Quadri</p>
