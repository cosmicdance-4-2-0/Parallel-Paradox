# Project Identity (Evidence-based)
- Repository centers on swarm/phase simulations (PhaseCube and Lyriel/Kairi themes) with numerous browser-based prototypes and Python variants. Evidence: `README.md`, `docs/Parallel-Paradox-Design.md`, `prototypes/Readme.md`.
- Dominant languages/frameworks: JavaScript/HTML (multiple canvas simulations), Python (simulation/test suites), and some CUDA experimentation. Evidence: `prototypes/AI_Deltas/.../*.js`, `prototypes/AI_Deltas/.../*.py`, `prototypes/Lightshor.cu`.
- Primary entry points today are per-prototype web pages and package-level scripts rather than a unified app: examples include `prototypes/AI_Deltas/Os1scz3t2mkt/index.html`, `prototypes/AI_Deltas/LKB/DX7F9L2Q1A3B/index.html`, `prototypes/AI_Deltas/LKB/LKBDLT24A1B7/src/phasecube_delta/cli.py`, and documentation-led orientation via `docs/Parallel-Paradox-Design.md`.

# How to Build / Run (If possible)
- Not currently discoverable from repo contents as a unified process: there is no root-level package manifest or build script defining a default entrypoint for mobile or desktop targets. Individual prototypes suggest ad-hoc usage (open HTML files in a browser, run Python scripts/tests in variant folders) but no central build orchestration is defined. Missing pieces include a cross-platform build toolchain, consolidated dependency manifest, and run scripts that target Apple/Android builds.

# Architecture Snapshot (What exists today)
- Prototype families: many per-variant simulations under `prototypes/AI_Deltas/` and `prototypes/LKB_POCs/`, each containing configs (`config.js`), grid/phase logic modules (`grid.js`, `phaseGrid.js`), renderers (`renderer.js`), and optional audio/UI layers, indicating modular browser-first experiments.
- Python variants mirror similar structure with packages under `prototypes/AI_Deltas/LKB/.../src/` using bias/grid/lens modules and CLI runners (`run.py`, `cli.py`), plus unit tests in sibling `tests/` directories.
- Documentation and design guidance are centralized in `docs/Parallel-Paradox-Design.md` and thematic markdowns (`Minimalaiagi.md`, `Minimalnode...wait...minimal.md`), but no architecture is codified into a buildable mobile framework.
- CI/automation: a single GitHub Actions workflow `/.github/workflows/python-publish.yml` exists for publishing Python packages on release, but it targets generic dist builds rather than the prototypes or a mobile pipeline.

# Readiness Gaps (Blockers vs Non-blockers)
- BLOCKERS:
  - No unified dependency management or root build tooling for a mobile or device-agnostic app; prototypes are isolated HTML/JS or Python scripts without shared package manifests. Evidence: absence of root package files vs scattered `package.json` and `requirements.txt` files inside `prototypes/AI_Deltas/LKB/...`.
  - No mobile-ready framework or project structure (iOS/Android) defined; existing assets are browser-first and lack native build configs. Evidence: only HTML/JS canvases such as `prototypes/AI_Deltas/Os1scz3t2mkt/index.html` and Python CLIs like `prototypes/AI_Deltas/LKB/LKBDLT24A1B7/src/phasecube_delta/cli.py`.
  - Running instructions are per-prototype and often implicit (open HTML/run tests) with no documented top-level commands, leaving iteration pathways unclear. Evidence: lack of root README build steps and disparate test folders (`prototypes/AI_Deltas/LKB/DX7F9L2Q1A3B/tests/`).
- NON-BLOCKERS:
  - Documentation could be consolidated and aligned with any future code scaffold; currently thematic docs (`Minimalaiagi.md`, `Minimalnode...wait...minimal.md`) and prototype readmes are fragmented. Evidence: multiple standalone markdowns under repo root and `docs/`.
  - CI coverage is minimal; expanding workflows beyond PyPI publishing to lint/test JS and Python variants would improve quality once a structure exists. Evidence: only `/.github/workflows/python-publish.yml` present.
  - Testing exists in silos (per-variant test suites) but lacks integration; harmonizing testing strategy will be needed after selecting a framework. Evidence: scattered `tests/` across `prototypes/AI_Deltas/LKB/...`.

# Minimal Modular Framework Proposal (Mobile + device-agnostic)
- **Option A: React Native (Expo-managed)**
  - Fit: Supports iOS/Android with shared JS/TS code, aligns with existing browser JS prototypes for quicker porting.
  - Layout: `app/` (screens/components), `src/core/` (grid/phase logic ported from `prototypes/AI_Deltas/...`), `src/modules/audio/`, `src/modules/controls/`, `src/state/` (store), `assets/` (images). Expo config for device APIs.
  - Hello world milestone: render a canvas-like view showing a minimal phase grid with touch controls on both platforms using stubbed data.
  - Risks/tradeoffs: Performance limits for large grids without native modules; requires refactoring JS to React components and possibly WebGL bindings.
- **Option B: Flutter**
  - Fit: Single Dart codebase with strong rendering performance; good for custom visuals and modular layers.
  - Layout: `lib/main.dart`, `lib/modules/grid/` (PhaseGrid port), `lib/modules/render/` (CustomPainter), `lib/modules/input/`, `lib/modules/audio/`, `test/` for unit tests; `assets/` for config presets derived from `prototypes/Readme.md` settings.
  - Hello world milestone: display a small animated grid with tap-to-perturb interactions on iOS/Android.
  - Risks/tradeoffs: Requires full rewrite from JS/Python; team needs Dart expertise and platform setup.
- **Option C: Kotlin Multiplatform + SwiftUI/Compose shells**
  - Fit: Shared simulation core in Kotlin for Android/iOS with platform-native UIs; good for high-performance math while keeping native feel.
  - Layout: `shared/` (KMP module with grid/bias/lens logic), `androidApp/` (Jetpack Compose UI), `iosApp/` (SwiftUI UI), shared tests under `shared/src/commonTest` reflecting existing `prototypes/AI_Deltas/LKB/.../tests/` logic.
  - Hello world milestone: shared module computes a small grid tick; both UIs render points and allow a tap to perturb.
  - Risks/tradeoffs: Higher setup complexity; dual UI stacks to maintain; requires mapping JS/Python logic into Kotlin.

# “Next Iteration” Checklist (Actionable)
- Choose and commit to a cross-platform framework (React Native/Flutter/KMP) and create a minimal scaffold in a new top-level app directory (new work to be introduced).
- Centralize configuration by extracting shared parameters from `prototypes/Readme.md` and representative `config.js` files (e.g., `prototypes/AI_Deltas/Os1scz3t2mkt/config.js`) into the new project’s config module.
- Port a minimal PhaseGrid core (plasma/liquid/solid update logic) from a JS variant such as `prototypes/AI_Deltas/LKB/DX7F9L2Q1A3B/src/grid.js` or Python equivalents into the chosen framework’s language, with unit tests mirroring existing `tests/` behaviors.
- Implement a simple renderer and input layer for the mobile scaffold that replicates basic canvas interactions seen in `prototypes/AI_Deltas/.../renderer.js`, ensuring touch/gesture support (new work to be introduced).
- Establish unified tooling: add root-level dependency manifest, lint/test scripts, and CI workflow extending beyond `/.github/workflows/python-publish.yml` to cover the new app and select prototype tests.
