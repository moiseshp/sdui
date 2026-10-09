# 🧱 BDUI — Backend-Driven UI

**Backend-Driven UI (BDUI)** is an architectural pattern where the server decides **what to render, in what order, and under which conditions** — instead of hardcoding that logic in the frontend.

The client receives a JSON schema (called a `Screen`) from the BFF, and simply maps each section to a React component. The frontend acts as a **declarative rendering engine** — no business logic, no layout decisions.

This enables:

- **UI changes without frontend redeploys** — the BFF controls what sections appear and in what order.
- **Server-side A/B testing & personalization** — deliver different UI variants per user segment.
- **Cross-platform consistency** — the same schema can drive web, iOS, and Android.
- **Clean separation of concerns** — business logic lives in the BFF, presentation in the client.

> **Inspired by:** [Airbnb Ghost Platform — Server-Driven UI](https://medium.com/airbnb-engineering/a-deep-dive-into-airbnbs-server-driven-ui-system-842244c5f5)

---

## 🔄 How it works

The **BFF (Backend for Frontend)** returns a `Screen` object — a tree of `Section[]` plus optional `header` and `bottomBar` slots. Each section describes:

- **`type`** — the component name to render (`hero_banner`, `promo_banner`, etc.).
- **`props`** — the validated data the component needs to render.
- **`actions`** — declarative triggers the component can fire (`NAVIGATE`, `TRACK_EVENT`, etc.).

```
BFF JSON Response
       │
       ▼
  parseScreen()         ← validates with Zod
       │
       ▼
  ScreenRenderer        ← theme + header slot + layout + sections + bottom bar
       │
       ├─► SectionSlot  → resolves type → HeroBanner
       ├─► SectionSlot  → resolves type → FeaturedProducts
       └─► SectionSlot  → resolves type → PromoBanner
```

The client **does not decide what to render** — it simply executes the schema. All layout and personalization decisions live in the BFF.

---

## 📂 Package Structure

```
packages/bdui/
├── schema/       # Zod schemas for the BFF ↔ client contract
├── renderer/     # ScreenRenderer, SectionSlot and fallbacks
├── providers/    # Context providers for the BDUI system
├── hooks/        # React hooks for consuming BDUI context
├── utils/        # Internal helpers (registries, action factories)
└── screens/      # One folder per screen: section registry + thin wrapper
```

| Module        | Responsibility                                                              |
| ------------- | --------------------------------------------------------------------------- |
| `schema/`     | TypeScript + Zod contracts. Validates `Screen`, `Section`, and `Action` shapes from the BFF. |
| `renderer/`   | `ScreenRenderer` applies theme and layout and renders the slots; `SectionSlot` resolves each `type` to a component, with fallbacks for unknown types or invalid props. |
| `providers/`  | `ScreenProvider` injects the `ActionRegistry` into the tree via React context. |
| `hooks/`      | `useActionHandler`, `useScreenActions`, `useSectionActions` — consume the action registry in components. |
| `utils/`      | `defineSection` and `createActionRegistry` — authoring helpers with full type inference. |
| `screens/`    | Each screen owns its section registry. **Screens never own mock data**: the screen arrives as a prop from the consuming app. |

Section components are **not** in this package: they live in `packages/sections/<name>/` (`index.tsx` + `schema.ts`) and are consumed here through the registry.

---

## 🗂️ Screen folder structure

Each screen under `screens/` follows this layout (real example: `screens/home`):

```
screens/home/
├── index.tsx              # Client wrapper: binds the registry to ScreenRenderer
└── section-registry.ts    # Maps section types to lazy-loaded components + Zod schemas
```

Everything else is the consuming app's job:

- **Fetching the screen.** In this repo, the page asks `lib/data` (`getHomeScreen`). The data layer picks an adapter: the real backend, or the `mock` adapter that simulates it.
- **Mock responses.** When an endpoint does not exist yet, its response is written as a fixture in `contract/fixtures/` (Contract First). There is no `mocks/` folder inside screens or packages (docs/decisiones.md, D-77).
- **Action handlers.** The app maps action types to concrete handlers (router, analytics…).

---

## 📚 Implementation walkthrough

Based on the Home of this repo.

### 1. BFF Response

This is the shape the backend returns (Screen v1.2). In this repo the simulated responses live in `contract/fixtures/variant-<id>.json`; the full contract is in `docs/contrato.md`.

```json
{
  "schemaVersion": "1.2.0",
  "screenId": "kfc_home",
  "layout": "default",
  "theme": "loyalty",
  "header": {
    "id": "home_header",
    "type": "header_greeting",
    "version": 1,
    "props": { "title": "¡Hola, Moisés!" }
  },
  "sections": [
    { "id": "home_hero", "type": "hero_banner", "version": 1, "props": { } }
  ],
  "bottomBar": {
    "id": "bottom_bar_register",
    "type": "bottom_bar",
    "version": 1,
    "props": { "title": "Crea tu cuenta y llévate 10% en tu primer pedido", "variant": "brand" }
  },
  "meta": { "title": "KFC Perú - Inicio" }
}
```

---

### 2. Section schema + component

Each section lives in `packages/sections/<name>/` and defines its own **Zod schema** (the contract) next to the **React component**. Styles travel as semantic variants, never raw values.

```ts
// packages/sections/header-default/schema.ts
import * as z from 'zod';

export const headerPositionSchema = z.enum(['static', 'sticky']);
export const headerVariantSchema = z.enum(['default', 'dark']);

export const headerDefaultPropsSchema = z.object({
  position: headerPositionSchema.optional().default('sticky'),
  variant: headerVariantSchema.optional().default('default'),
});
export type HeaderDefaultProps = z.infer<typeof headerDefaultPropsSchema>;
```

The component (`index.tsx`) receives validated props and maps each variant to the platform's own tokens.

---

### 3. Section Registry

The registry binds each `section.type` string to a **lazy-loaded component**, its **Zod schema** and the **version** this client understands. Header and bottom bar slots use the same registry as the body.

```ts
// packages/bdui/screens/home/section-registry.ts (excerpt)
export const sectionRegistry = {
  header_default: defineSection({
    schema: headerDefaultPropsSchema,
    version: 1,
    component: React.lazy(() => import('@/packages/sections/header-default').then(m => ({ default: m.HeaderDefault }))),
  }),
  hero_banner: defineSection({
    schema: heroBannerPropsSchema,
    version: 1,
    component: React.lazy(() => import('@/packages/sections/hero-banner').then(m => ({ default: m.HeroBanner }))),
  }),
  // ...
} as const satisfies SectionRegistry;
```

> **Versioning:** `version` tracks the contract version this client understands. If the BFF bumps a section version, the renderer can surface a mismatch and apply a graceful fallback.

---

### 4. Screen wrapper

A thin **client** component that binds the registry to the generic renderer. It receives the already parsed screen; it never fetches or imports data.

```tsx
// packages/bdui/screens/home/index.tsx
'use client';

import type { Screen } from '../../schema/screen';
import { ScreenRenderer } from '../../renderer/screen-renderer';
import { sectionRegistry } from './section-registry';

export function Home({ screen }: { screen: Screen }) {
  return <ScreenRenderer screen={screen} sectionRegistry={sectionRegistry} />;
}
```

---

### 5. Actions provider (consuming app)

The app maps action types to concrete handlers and injects them with `ScreenProvider`.

```tsx
// app/(home)/home-bdui-provider.tsx
'use client';

import { ScreenProvider } from '@/packages/bdui/providers/screen-provider';
import { createActionRegistry } from '@/packages/bdui/utils/action-registry';
import { useRouter } from 'next/navigation';
import { useMemo, type ReactNode } from 'react';

export function HomeScreenProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const registry = useMemo(
    () =>
      createActionRegistry({
        NAVIGATE: ({ url, replace }) => (replace ? router.replace(url) : router.push(url)),
        TRACK_EVENT: ({ name, id, params }) => {
          console.log('[KFC] Track:', name, { id, ...params });
        },
        EXTERNAL_LINK: ({ url, target = '_blank' }) => window.open(url, target, target === '_blank' ? 'noopener,noreferrer' : undefined),
      }),
    [router],
  );

  return <ScreenProvider registry={registry}>{children}</ScreenProvider>;
}
```

---

### 6. Page (consuming app)

The page asks the data layer for the resolved screen, validates it and renders it. No cache: every load requests the screen again.

```tsx
// app/(home)/page.tsx
import { getSessionUserId } from '@/lib/session';
import { getHomeScreen } from '@/lib/data';
import { Home } from '@/packages/bdui/screens/home';
import { parseScreen } from '@/packages/bdui/schema/screen';
import { HomeScreenProvider } from './home-bdui-provider';

export default async function HomePage() {
  const userId = await getSessionUserId();

  // parseScreen() throws a ZodError if the BFF response doesn't match the schema
  const screen = parseScreen(await getHomeScreen(userId));

  return (
    <HomeScreenProvider>
      <Home screen={screen} />
    </HomeScreenProvider>
  );
}
```

---

## 🔑 Core Actions

The following action types are built into the system. You register handlers for them in your actions provider.

| Action type      | Payload fields                              | Description                              |
| ---------------- | ------------------------------------------- | ---------------------------------------- |
| `NAVIGATE`       | `url`, `replace?`                           | Client-side navigation via Next.js router |
| `TRACK_EVENT`    | `name`, `id?`, `params?`                    | Analytics / telemetry event              |
| `EXTERNAL_LINK`  | `url`, `target?`                            | Opens a URL in a new tab or same tab     |
| `API_CALL`       | `endpoint`, `method?`, `body?`, `headers?`  | Fires an API request                     |
| `SHOW_LOADING`   | `fullScreen?`, `message?`                   | Shows a loading state                    |
| `HIDE_LOADING`   | —                                           | Hides the loading state                  |

---

## 🔗 References

- [Airbnb — A Deep Dive into Server-Driven UI](https://medium.com/airbnb-engineering/a-deep-dive-into-airbnbs-server-driven-ui-system-842244c5f5)
