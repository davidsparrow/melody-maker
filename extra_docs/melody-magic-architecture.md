# Web App: AI-Assisted Song Section Generator
**Focus:** Lean MVP with a clear path to Post‑MVP.  
**Goal:** Analyze an uploaded song and generate complementary sections (intro, outro, bridge, fills), leveraging audio analysis + generative music APIs.

---

## 1) Product Overview

### 1.1 Problem & Value
- Musicians and creators often need **quick, musically coherent sections** (intros/outros/bridges) that match an existing track’s **key, tempo, and vibe**.
- Existing tools either **generate from scratch** or **don’t analyze the reference track** deeply enough. We combine **song analysis** with **guided generation**.

### 1.2 Core Objectives
- MVP: Upload a single audio file, auto-analyze key/BPM/structure, generate 1–3 complementary sections (intro/outro), preview, and export.
- Post-MVP: Rich editing, multi-section variations, collaborative workflows, DAW integrations, and style transfer.

### 1.3 Assumptions (Adjust as needed)
- Target users: Indie producers, content creators, and hobbyists needing fast results.
- Tone: Consumer-friendly with **one‑click generate** plus **expert controls** (advanced panel).
- Single-stereo audio upload in MVP; stems and multitrack later.
- Cloud-first: web-only MVP; mobile and desktop integrations later.
- Use **3rd‑party generative music APIs** (e.g., Udio/Suno/AIVA).

---

## 2) User Stories

### 2.1 MVP User Stories
- **US1 — Upload & Analyze:** As a user, I can upload MP3/WAV (≤ 10 min, ≤ 50 MB) so the system extracts **BPM**, **key**, **mode**, **basic chord color**, **energy**, and **section segmentation** (verse/chorus/bridge approximations).
- **US2 — Quick Generate:** As a user, I click **“Generate Intro/Outro”** and receive 1–3 suggestions that **match key and tempo** and broadly **match mood/energy**.
- **US3 — Preview:** As a user, I can **audition** each suggestion in an in-browser player and **toggle between versions**.
- **US4 — Basic Controls:** As a user, I can set **length** (e.g., 4–16 bars) and **mood** (calm/energetic/darker/brighter) before generation.
- **US5 — Export:** As a user, I can **download** generated sections as **WAV/MP3** and optionally **auto-stitched preview** (original + generated section) for reference.
- **US6 — Project Save (Light):** As a signed-in user, I can **save a project** with files and settings to revisit later.
- **US7 — Credits & Limits:** As an account holder, I can see my **generation credits** (Stripe plan) and usage limits.

### 2.2 Post‑MVP User Stories
- **US8 — Variations & Regenerate:** Request **N variations** with different intent prompts (e.g., more percussive, more ambient).
- **US9 — In-Browser Editor:** Non-destructive **waveform editor** (cuts, fades, crossfades, gain, snap-to-bars).
- **US10 — Section Types:** Generate **bridge, fills, drops, risers, transitions**; **bar-count precise** outputs.
- **US11 — Advanced Musical Controls:** Explicit **key changes, modality, instrumentation hints**, **swing/groove**, density.
- **US12 — Stems & Multitrack:** Upload stems; generate **instrument-specific** intros/outros (e.g., drums only).
- **US13 — Collaboration:** Invite collaborators, comments, versions, shared libraries.
- **US14 — DAW Integrations:** **Export to Ableton/Logic/FL Studio** packages; VST3/AU **companion plugin** for direct send/receive.
- **US15 — Style Transfer (Ethical):** “In the style of *X*” using legal/ethical models or **style embeddings** trained on user-provided, licensed data.
- **US16 — Presets & Templates:** Curated preset packs by genre; **auto-arranger** suggestions.
- **US17 — Mobile App:** Quick “generate on the go,” cloud-synced projects.
- **US18 — Marketplace:** Share/sell generative templates and presets.

---

## 3) Feature Breakdown (MVP vs Post‑MVP)

| Area | MVP | Post‑MVP |
|---|---|---|
| Upload | MP3/WAV, 10 min/50 MB, single stereo | Longer uploads, more formats (AAC/FLAC), stems |
| Analysis | BPM, key, mode, rough sections, energy | Chord progression, timbre descriptors, beat-grid alignment, key changes detection |
| Generation | Intro/Outro (1–3 suggestions), mood & length | Bridge/fills/drops, multi-variation regen, instrumentation hints, bar-accurate |
| Editing | Basic export; optional auto-stitch preview | Waveform editor (fades, crossfades, gain), arrangement tools |
| Projects | Light save (1 project per user on free) | Full project management, versioning, collaboration |
| Payments | Stripe credits/subscription | Tiered plans, team billing, enterprise SSO |
| Integrations | Single music API (Udio/Suno/AIVA*) | Multi-provider routing, DAW plugins, cloud drives |
| Security | JWT auth, signed URLs for S3 | SOC2-ready controls, audit logs |
| Ops | Basic monitoring & retries | Full observability, queue orchestration, SLA |

\* **Note:** Ensure ToS/commercial usage compliance per provider; add abstraction layer to switch providers.

---

## 4) System Architecture

### 4.1 High-Level Diagram (Textual)
```
[Browser SPA (React/Next)] 
  -> [API Gateway / BFF (Node/Express or Python/FastAPI)]
      -> [Auth (Clerk/Auth0)]
      -> [Project Service (Postgres)]
      -> [Upload Service -> S3/GCS with signed URLs]
      -> [Job Orchestrator (SQS/Rabbit + Worker)]
            -> [Analysis Worker (Python + Librosa/TensorFlow)]
            -> [Generation Worker (Provider SDK/API client)]
      -> [Callback/Webhook Handler (for async generation results)]
  -> [CDN for static & audio streams]
[Monitoring: OpenTelemetry + Grafana/Prometheus/Sentry/CloudWatch]
```

### 4.2 Recommended Stack (MVP)
- **Frontend:** Next.js (React), TypeScript, Vite build for components, **Wavesurfer.js** for waveform preview, Tailwind UI.
- **Auth:** Clerk or Auth0 (email + OAuth).
- **Backend (API/BFF):** **Node.js (Express/Fastify)** for speed, or **Python FastAPI** if tight with ML; expose REST + minimal WebSocket for job status.
- **Workers:** **Python** (Librosa, Essentia, NumPy, PyTorch/TensorFlow-lite if needed). Keep ML in Python workers; orchestrate with **SQS** (or RabbitMQ).
- **Storage:** **S3** for audio + artifacts; **PostgreSQL** (RDS/Supabase) for metadata; **Redis** for cache/jobs (optional).
- **Generation Providers:** Udio / Suno / AIVA via API; wrap with **ProviderAdapter** to allow swap/fallback.
- **Hosting:** Vercel/Netlify (frontend), Fly.io/Render/AWS ECS (API + workers).  
- **Payments:** Stripe (credits/subscriptions, webhooks).

### 4.3 Services & Responsibilities
- **API Gateway/BFF**: AuthN/Z, presigned upload URLs, create project, enqueue jobs, expose job status/result URLs, credit checks.
- **Analysis Worker**: Download source from S3; compute BPM, key, mode, energy; rough segmentation; persist features JSON.
- **Prompt Builder**: Deterministic mapping from features → provider-specific prompt (key=B minor, bpm=128, mood=“calm”, length=8 bars).
- **Generation Worker**: Call provider, poll or handle webhook; store generated audio to S3; emit result events.
- **Stitcher (optional MVP)**: Create preview with original + generated section (non-destructive); render to MP3.
- **Notification**: WebSocket or polling for job completion; email optional.

### 4.4 Data Model (MVP)
**Tables (Postgres):**
- `users(id, email, auth_provider_id, plan, credits, created_at)`  
- `projects(id, user_id, title, status, created_at)`  
- `assets(id, project_id, type, s3_url, duration_sec, format, created_at)`  // types: original, analysis_json, gen_intro, gen_outro, preview_mix  
- `jobs(id, project_id, kind, status, payload_json, result_json, created_at, updated_at)` // kinds: analysis, generate_intro, generate_outro  
- `events(id, job_id, type, payload_json, created_at)`  
- `billing(id, user_id, provider, plan, renew_at, meta_json)`

**Indexes:** by `user_id`, `project_id`, `status`, and `created_at` for job dashboards.

### 4.5 API Endpoints (Illustrative)
- `POST /v1/projects` → create project  
  body: `{title}`  
- `POST /v1/projects/:id/upload-url` → presigned URL  
  body: `{filename, contentType}`  
- `POST /v1/projects/:id/analyze` → enqueue analysis job  
- `POST /v1/projects/:id/generate` → enqueue {type: intro|outro, length_bars, mood}  
- `GET /v1/jobs/:id` → job status/result  
- `GET /v1/projects/:id/artifacts` → list assets  
- `POST /v1/billing/checkout` → Stripe checkout  
- `POST /v1/webhooks/stripe` / `POST /v1/webhooks/provider` → webhooks

**Auth:** JWT (short-lived) + refresh, role=owner basic.  
**Rate Limits:** 10 requests/minute per user; generation enqueue guarded by credits.

---

## 5) ML & Audio Pipeline Details

### 5.1 Feature Extraction (MVP)
- Libraries: **Librosa** (tempo, onset envelope, key/mode estimation), **Essentia** optional for robustness.
- Steps: loudness normalization → STFT → spectral features (MFCC, chroma) → tempo estimation → key/mode → simple segmentation via novelty detection (Foote method) or **tempogram + self-similarity**.
- Output JSON:  
```json
{
  "bpm": 124,
  "key": "F# minor",
  "energy": 0.62,
  "sections": [
    {"label":"intro","start_sec":0,"end_sec":12},
    {"label":"verse","start_sec":12,"end_sec":42},
    {"label":"chorus","start_sec":42,"end_sec":72}
  ]
}
```

### 5.2 Prompt Builder
- Deterministic templates:  
  - “Generate **intro** in **F# minor**, **124 BPM**, **calm** mood, **8 bars**, match timbre broadly; avoid melodic clash.”  
- Provider adapters map to each API’s parameters/DSL. Keep a **capability matrix** (supports key? bpm? duration?).

### 5.3 Generation Orchestration
- **Async jobs** with retries/backoff; idempotency keys per request.  
- **Timeout guards**; if provider fails, attempt fallback provider.  
- **Licensing flags** stored per provider asset: usage rights, attribution requirements.

### 5.4 Quality Heuristics (MVP)
- Verify **length** within ±5%; verify **key compatibility** (relative/parallel accepted); BPM within ±1–2.  
- Optional **crossfade render** preview to check subjective cohesion.

---

## 6) Frontend UX

### 6.1 Pages
- **Home** (pitch, CTA), **Dashboard** (projects), **Project Detail** (upload → analyze → generate → preview → export), **Billing**, **Account**.

### 6.2 Project Detail Flow
1) Upload track → progress bar → analysis chip shows BPM/key/length.  
2) **Generate** card: choose section (intro/outro), set bars & mood → enqueue.  
3) **Suggestions** list: mini-players with waveform, tags (key/bpm), actions (preview, download).  
4) **Auto-Stitch Preview** toggle for quick A/B.  
5) **Export** panel: MP3/WAV; download assets; usage note.

### 6.3 Components
- Uploader (presigned URL), Waveform (Wavesurfer.js), Player, Job Status Badge, Toasts, Credit Meter, Modal for generation settings.

---

## 7) Security, Compliance, and Legal

- **AuthZ**: Users can access only their projects/assets (row-level checks).  
- **Storage**: S3 with **private buckets** + signed URLs (short TTL).  
- **PII** minimal; comply with **GDPR/CCPA** for deletion.  
- **Content Policy**: Disallow unlicensed copyrighted uploads in ToS; add DMCA process.  
- **Provider ToS**: Verify commercial usage rights; persist **license metadata** per rendered asset.  
- **Logging**: Store anonymized metrics; redact IPs where possible.

---

## 8) Observability & Ops

- **Monitoring**: Sentry (errors), Prometheus/Grafana (metrics), OpenTelemetry tracing across API → workers.  
- **Queues**: Visibility timeouts, DLQ for poisoned messages.  
- **Backups**: Nightly DB snapshots; versioned S3 buckets.  
- **Cost Controls**: Budget alarms; throttle generations; batch cleanups of transient files.

---

## 9) Roadmap (Lean, 8–10 weeks)

**Phase 0 — Foundations (Week 1)**  
- Repo setup (mono or poly), CI/CD, envs, auth scaffold, S3 integration, Stripe test mode.

**Phase 1 — Upload & Analysis (Weeks 2–3)**  
- Presigned upload, analysis worker (BPM/key/sections), features JSON UI.

**Phase 2 — Generation (Weeks 4–5)**  
- Provider adapter, prompt builder, job orchestration, suggestions list, basic quality checks.

**Phase 3 — Preview & Export (Weeks 6–7)**  
- Player + waveform, auto-stitch preview, export MP3/WAV, project save, credits.

**Phase 4 — Polish & Beta (Weeks 8–9)**  
- Error states, empty states, docs/ToS, monitoring, billing webhooks, bug bash.

**Phase 5 — Stretch (Week 10)**  
- Variation regen or basic waveform edits (fades), marketing site.

---

## 10) Detailed Tech Choices

- **Frontend:** Next.js, TypeScript, Tailwind, Wavesurfer.js, Zustand/Redux for state; React Query for API cache.  
- **Backend:** Node.js (Fastify) or Python (FastAPI). Choose **Node BFF + Python workers** for clean separation.  
- **Audio/ML:** Python 3.11, Librosa, Essentia (optional), Torch (optional), FFmpeg for transcode.  
- **Jobs:** SQS + simple worker with Celery/RQ if Python-centric or BullMQ if Node-centric (choose one; MVP: SQS + Python RQ).  
- **DB:** PostgreSQL (Supabase or RDS).  
- **Storage/CDN:** S3 + CloudFront.  
- **Auth:** Clerk/Auth0; JWT.  
- **Payments:** Stripe.  
- **Infra:** AWS (ECS/Fargate for workers), Vercel for frontend, Fly.io or Render for API if not on AWS.  
- **Config:** 12‑factor; secrets via AWS Secrets Manager or Doppler.  

---

## 11) Risk & Mitigation

- **Provider Limits/Outages:** Multi-provider adapter, circuit breaker, graceful fallbacks.  
- **Licensing Ambiguity:** Persist license metadata; clear UI labels; legal review.  
- **Analysis Accuracy:** Combine heuristics (Librosa + Essentia); expose manual override later.  
- **Latency/Cost:** Async jobs; credit throttles; batch cleanup; cache features.  
- **Browser Playback Variability:** Provide MP3 fallback; test Safari/Chrome/Firefox.

---

## 12) Acceptance Criteria (MVP Demo)

- Upload MP3/WAV; see BPM & key within 5 seconds of job completion.  
- Click “Generate Intro/Outro” → within provider SLA, receive 1–3 suggestions.  
- Play suggestions inline; **Download** each as MP3/WAV.  
- Auto-stitch preview plays original+generated with acceptable crossfade.  
- Projects persist; credits decrement; Stripe test mode works.  

---

## 13) Next Steps
- Finalize assumptions (formats, duration limits, provider choice).  
- Pick Node vs Python for API (recommend Node BFF + Python workers).  
- Create schema, scaffolds, and a feature flag for Post‑MVP edits.

---

*This document is intended as a working spec. Update as product decisions evolve.*


---

## Supabase Auth & Security (per Supadex best-practices)

This project will adopt Supabase for Auth, Database, and optional Storage following Supadex security recommendations:

- **API Key Hygiene**
  - Never expose the Supabase service_role key or any secret keys in client code. Store them in environment variables and secrets managers (e.g., AWS Secrets Manager, Doppler).
  - Rotate API keys promptly if suspected compromise; restrict usage where possible.
- **Row-Level Security (RLS)**
  - Enable RLS on all tables containing user-sensitive data (profiles, projects, assets, jobs, billing). Implement precise policies such as:
    ```sql
    CREATE POLICY "users_select_own"
      ON profiles FOR SELECT USING (auth.uid() = id);
    ```
  - Test RLS policies thoroughly; use separate policies for SELECT/INSERT/UPDATE/DELETE where needed.
- **Supabase Auth Usage**
  - Enforce email confirmation and consider enabling MFA for paid accounts. Set password strength requirements and limit failed sign-in attempts via rate-limiting middleware or edge functions.
  - Use Supabase's OAuth providers for social login, but map provider identities to canonical user profiles in `profiles` table.
- **Edge Functions for Sensitive Logic**
  - Move sensitive business logic (credit consumption, admin-only tasks, provider API calls requiring service_role) into Edge Functions or backend services so secrets never touch the browser.
- **Secure Storage Configuration**
  - Use private buckets for raw uploads (original audio). Generate **signed URLs** for temporary, client-side downloads/previews with short TTLs.
  - Use different buckets/paths for generated artifacts and preview files; apply appropriate access policies.
  - Validate file types/sizes before accepting uploads (both frontend and edge function checks).
- **Encryption & PII**
  - Leverage Postgres encryption functions or application-level encryption for PII fields (email is managed by Supabase Auth; avoid duplicating sensitive info in plaintext).
  - Ensure SSL/TLS for all connections and verify client use of secure endpoints.
- **Monitoring & Audit**
  - Enable Supabase logs and monitor auth events, storage access, and database queries. Integrate with external monitoring (Datadog, CloudWatch, Sentry) for alerts and audit trails.
- **Principle of Least Privilege**
  - Use anon/public keys for client-side operations that are safe with RLS in place. Reserve service_role key for server-side or Edge Function use only.
- **CI/CD & Secrets**
  - Inject Supabase keys and environment variables via CI/CD secret stores rather than committing them to repos. Use short-lived credentials where supported.
- **Legal & Licensing Flags**
  - Store provider license metadata and asset usage rights in the database; ensure edge functions enforce license checks before download/export actions.
