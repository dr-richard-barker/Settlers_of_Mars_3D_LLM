# Publishing checklist — GitHub Pages + Zenodo

This repo is set up to (1) serve a website from GitHub Pages and (2) mint a
citable, archived release on Zenodo. Here's the one-time setup and the
per-release routine.

## 1. Turn on GitHub Pages (one time)

The site deploys automatically via GitHub Actions
([`.github/workflows/pages.yml`](.github/workflows/pages.yml)) on every push to
`main`. To activate it:

1. Go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Push to `main` (or run the *Deploy static site to GitHub Pages* workflow from
   the **Actions** tab).

The site goes live at:
**https://dr-richard-barker.github.io/Settlers_of_Mars_3D_LLM/**

> The repo is already **public**, so Pages works on the free plan. `.nojekyll`
> is committed so folders with spaces/underscores (e.g. `STL files/`) serve
> correctly and Jekyll doesn't mangle anything.

## 2. Make it Zenodo-ready (one time)

1. Sign in to <https://zenodo.org> with your GitHub account.
2. Go to **Zenodo → Account → GitHub**, find
   `Settlers_of_Mars_3D_LLM`, and flip the toggle **On**.
3. Fill in the remaining author details:
   - Add your **ORCID** in [`CITATION.cff`](CITATION.cff) and
     [`.zenodo.json`](.zenodo.json).
   - **Credit the original Insight Wisconsin inventors'-club students** as
     co-creators (one author block each). Check consent for any minors before
     publishing names.

## 3. Cut a release (each version)

1. Update the `version:` and `date-released:` in `CITATION.cff`.
2. On GitHub: **Releases → Draft a new release**, tag e.g. `v1.0.0`, publish.
3. Zenodo automatically archives that tag and mints a **DOI**.
4. Add the DOI badge to `README.md` and the "How to cite" section on
   [`about.html`](about.html).

## Large binaries

The 3D-printable **STL files** and images are committed directly (they're small
enough). If the repo ever grows past Zenodo's per-file limits, upload a zipped
release archive to Zenodo manually instead of relying on the GitHub integration.

## Loose ends to close before a "1.0" announcement

See the **Roadmap** in [`README.md`](README.md) for the live list.
