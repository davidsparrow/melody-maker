# MVP Directory Structures & Architecture Notes

This document describes the expected directory structures for the **React Frontend (Next.js)** and the **Backend (Node BFF + Python Workers)** of the **Song Section Generator MVP**, along with scaling notes.

---

## 1) Frontend Directory Structure (React + Next.js)

```plaintext
song-section-generator-frontend/
├── public/                     # Static assets (favicons, logo, etc.)
│   ├── favicon.ico
│   └── robots.txt
│
├── src/
│   ├── app/                    # Next.js App Router (pages if CRA)
│   │   ├── layout.tsx          # Global layout (nav, footer, providers)
│   │   ├── page.tsx            # Landing page
│   │   ├── dashboard/
│   │   │   └── page.tsx        # User dashboard (list projects)
│   │   ├── project/
│   │   │   └── [id]/page.tsx   # Project detail (upload, analyze, generate)
│   │   ├── account/page.tsx    # Account settings (auth, billing)
│   │   └── billing/page.tsx    # Stripe checkout UI
│   │
│   ├── components/             # Shared UI components
│   │   ├── ui/                 # Buttons, modals, forms, cards
│   │   ├── audio/              # Player, waveform (Wavesurfer.js wrapper)
│   │   ├── upload/             # File uploader w/ progress
│   │   ├── jobs/               # Job status chips, progress spinners
│   │   └── navigation/         # Header, footer, sidebar
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useCredits.ts
│   │   └── useJobStatus.ts
│   │
│   ├── lib/                    # Frontend utilities
│   │   ├── api.ts              # Axios/Fetch wrapper
│   │   ├── auth.ts             # Clerk/Auth0 helpers
│   │   ├── formatters.ts       # Time/size format helpers
│   │   └── config.ts           # Env config
│   │
│   ├── store/                  # State management (Zustand/Redux)
│   │   ├── projectStore.ts
│   │   └── uiStore.ts
│   │
│   ├── styles/                 # Tailwind base + overrides
│   │   ├── globals.css
│   │   └── theme.css
│   │
│   └── types/                  # Shared TypeScript interfaces
│       ├── api.d.ts
│       ├── project.d.ts
│       └── job.d.ts
│
├── .env.local                  # Local env vars
├── next.config.js              # Next.js config
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

---

## 2) Backend Directory Structure (Node BFF + Python Workers)

```plaintext
song-section-generator-backend/
├── api/                        # Node.js BFF (Fastify/Express)
│   ├── src/
│   │   ├── index.ts            # Entry point
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── projects.ts
│   │   │   ├── uploads.ts
│   │   │   ├── analysis.ts
│   │   │   ├── generation.ts
│   │   │   └── billing.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── rateLimiter.ts
│   │   ├── services/
│   │   │   ├── projectService.ts
│   │   │   ├── jobService.ts
│   │   │   └── billingService.ts
│   │   ├── lib/
│   │   │   ├── s3.ts
│   │   │   ├── db.ts
│   │   │   └── stripe.ts
│   │   └── types/
│   │       ├── project.d.ts
│   │       └── job.d.ts
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── workers/                    # Python workers for analysis & generation
│   ├── analysis_worker/
│   │   ├── main.py             # Worker entry point
│   │   ├── analysis.py         # Librosa/Essenetia processing
│   │   ├── models.py           # Feature extraction models (if needed)
│   │   ├── utils.py            # Audio I/O helpers (ffmpeg wrappers)
│   │   └── requirements.txt
│   │
│   ├── generation_worker/
│   │   ├── main.py             # Worker entry point
│   │   ├── provider_client.py  # Adapter for Udio/Suno/AIVA API
│   │   ├── prompt_builder.py   # Map features -> provider prompts
│   │   ├── stitcher.py         # Optional: merge generated + original
│   │   └── requirements.txt
│   │
│   └── common/                 # Shared code for workers
│       ├── s3_utils.py
│       ├── db_utils.py
│       └── schemas.py
│
├── docker/                     # Containerization setup
│   ├── Dockerfile.api
│   ├── Dockerfile.worker
│   └── docker-compose.yml
│
├── .env                        # Env vars for backend
├── package.json                # For API
└── README.md
```

---

## 3) MVP Scaling Notes

- **State Management:** Keep minimal. Use **React Query** for server data fetching and caching; use **Zustand** (lightweight) for local UI state. Avoid Redux unless complexity grows.
- **Audio Components:** Place in `components/audio` because waveform/preview/generation will evolve heavily. Encapsulation avoids refactor pain later.
- **API Contracts:** Maintain shared TypeScript definitions (`src/types`) and backend typings (`api/src/types`) to avoid drift. If possible, generate types from OpenAPI spec.
- **Workers:** Separation between **Node API (routing, auth, billing)** and **Python workers (analysis, ML, audio)** ensures each uses best ecosystem.
- **Async Jobs:** Queue orchestrator (SQS, BullMQ, Celery) keeps user requests non-blocking and improves UX responsiveness.
- **Infrastructure:** Start with managed hosting (Vercel for frontend, Render/Fly.io for API, AWS ECS for workers). Optimize later.
- **Team Workflow:** Each directory can be owned by different contributors (frontend, backend API, ML/audio workers).
- **Testing:** Focus MVP testing on file uploads, job orchestration, and generation pipeline reliability (happy-path). Expand to unit/integration tests post-MVP.

---

## 4) Summary

This structure balances **clarity** (small teams can navigate easily) with **scalability** (clear separation of frontend, API, and ML/audio workers).  
It supports a **fast MVP demo** while keeping a foundation for **post-MVP features** such as waveform editing, DAW integrations, and collaboration.



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
