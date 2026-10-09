# 🧱 BDUI — Backend-Driven UI Scaffolding

Una **Proof of Concept (PoC)** de cómo implementar una arquitectura **Backend-Driven UI (BDUI)** sobre Next.js App Router, utilizando el patrón **BFF + Screen + Section Tree**.

---

## 💡 ¿Qué es BDUI?

**Backend-Driven UI** es un enfoque arquitectónico en el que el servidor (BFF) es responsable de decidir **qué se renderiza, cómo se organiza y bajo qué condiciones**, en lugar de dejar ese control completamente en el cliente.

El cliente recibe un contrato declarativo (schema JSON/TS) que describe la pantalla y sus secciones, y simplemente ejecuta el mapeo hacia componentes React. Esto permite:

- **Cambios de UI sin redeploy del frontend** — el BFF puede cambiar qué secciones aparecen y en qué orden.
- **A/B testing y personalización server-side** — el BFF entrega variantes distintas según segmento de usuario.
- **Consistencia cross-plataforma** — el mismo schema puede ser consumido por web, iOS y Android.
- **UI desacoplada de la lógica de negocio** — el frontend es un motor de renderizado declarativo.

> **Referencias:**
>
> - [Airbnb Ghost Platform — Server-Driven UI](https://medium.com/airbnb-engineering/a-deep-dive-into-airbnbs-server-driven-ui-system-842244c5f5)

---

## 🔄 BFF — Backend for Frontend

El **BFF (Backend for Frontend)** es una capa intermedia entre los servicios de backend y el cliente. En este proyecto actúa como el **orquestador del schema BDUI**: consolida datos de múltiples fuentes, aplica lógica de negocio y personalización, y retorna al cliente un árbol de secciones listo para renderizar.

El BFF no expone los servicios internos directamente — traduce, agrega y filtra según las necesidades de cada pantalla del frontend.

---

## 🌲 Patrón: Screen + Section Tree

Este es el patrón central de la PoC, inspirado en la **Ghost Platform de Airbnb**.

### ¿Cómo funciona?

El BFF retorna un objeto `Screen` que contiene un árbol de `Section[]`. Cada sección describe:

- **`type`**: el nombre del componente a renderizar (`hero-banner`, `promo-banner`, etc.).
- **`data`**: los props hidratados que el componente necesita.
- **`actions`**: acciones declarativas que el componente puede disparar (`navigate`, `apiCall`, `track`).

```
Screen
 └── sections[]
      ├── { type: "hero_banner",        data: {...}, actions: [...] }
      ├── { type: "featured_products",  data: {...}, actions: [...] }
      └── { type: "promo_banner",       data: {...}, actions: [...] }
```

### Flujo de renderizado

```
BFF retorna Screen JSON
        │
        ▼
   ScreenRenderer (Server Component)
        │
        ├─► SectionRenderer → mapea type → componente React
        │         └─► HeroBanner      (packages/sections)
        ├─► SectionRenderer → mapea type → componente React
        │         └─► FeaturedProducts (packages/sections)
        └─► SectionRenderer → mapea type → componente React
                  └─► PromoBanner     (packages/sections)
```

El cliente **no decide qué renderizar** — simplemente ejecuta el mapeo del schema. La lógica de negocio vive en el BFF.

> **Referencia:** [Airbnb — A Deep Dive into Server-Driven UI](https://medium.com/airbnb-engineering/a-deep-dive-into-airbnbs-server-driven-ui-system-842244c5f5)

---

## 📦 Estructura de Paquetes

```
packages/
├── bdui/          # Core del sistema BDUI
├── layout/        # Chrome estructural de la aplicación
├── lib/           # Wrappers e integraciones de terceros
├── sections/      # Organismos de contenido (rendereables por BDUI)
├── ui/            # Componentes base del design system
└── utils/         # Utilidades cross-proyecto
```

### `packages/bdui`

**El corazón del sistema.** Todo lo concerniente al dominio Backend-Driven UI vive aquí, organizado de forma domain-driven.

```
packages/bdui/
├── schema/        # Tipos TypeScript del contrato BFF ↔ cliente
│   ├── screen.ts  # Definición de Screen (raíz del árbol)
│   ├── section.ts # Definición de Section y sus variantes
│   └── action.ts  # Definición de Actions (navigate, apiCall, track...)
├── renderers/     # Mapeo de type → componente React
├── actions/       # Procesamiento de acciones declarativas
└── providers/     # Contexto y configuración del sistema BDUI
```

| Sub-módulo   | Responsabilidad                                                            |
| ------------ | -------------------------------------------------------------------------- |
| `schema/`    | Contrato TypeScript validado con Zod entre BFF y cliente                   |
| `renderers/` | Mapea cada `section.type` a su componente React correspondiente            |
| `actions/`   | Ejecuta las acciones declaradas en el schema (`navigate`, `apiCall`, etc.) |
| `providers/` | Registry de componentes y configuración global del sistema                 |

### `packages/layout`

**Chrome estructural de la aplicación.** Componentes que conforman la envolvente persistente de cada página: `AnnouncementBar`, `Header`, etc. Existen con independencia de la ruta activa y no forman parte del contenido renderizado por BDUI.

### `packages/sections`

**Organismos de contenido renderizables.** Los componentes candidatos a ser registrados en el sistema BDUI: `HeroBanner`, `FeaturedProducts`, `PromoBanner`, etc. No realizan fetching propio — reciben sus datos como props hidratados desde el BFF a través del schema.

### `packages/ui`

**Componentes base sin lógica de negocio.** Átomos y moléculas del design system: `Button`, `Input`, `Badge`, `Card`, etc. No conocen conceptos de negocio ni el sistema BDUI.

### `packages/lib`

**Wrappers e integraciones de terceros.** Encapsula dependencias externas con comportamiento específico del proyecto: manejo de moneda, GTM, pasarelas de pago, etc. A diferencia de `utils`, `lib` siempre requiere una dependencia externa.

### `packages/utils`

**Utilidades transversales.** Funciones puras reutilizables (formatters, parsers, helpers) y configuraciones compartidas de tooling (TypeScript base, ESLint, Prettier). Sin dependencias de dominio.

---

## 🗂️ Jerarquía de dependencias

Las dependencias solo fluyen en una dirección — ningún paquete importa de un paquete que lo consume:

```
utils
  └─► lib
  └─► ui
        └─► layout
        └─► sections
                └─► bdui  ◄── consume sections como renderers
```

---

## 🚀 Tecnologías

| Tecnología             | Uso                                           |
| ---------------------- | --------------------------------------------- |
| **Next.js App Router** | Framework base, Server Components por defecto |
| **TypeScript**         | Tipado estricto del schema BDUI               |
| **Zod**                | Validación del schema en runtime              |
| **React**              | Motor de renderizado declarativo              |

---

## 🧪 Resumen

Este repositorio es una demostración técnica. El objetivo es validar:

1. La viabilidad del patrón Screen + Section Tree en Next.js App Router.
2. Cómo estructurar un registry de componentes desacoplado.
3. El contrato de tipos entre BFF y renderer.
4. La separación entre lógica de negocio (BFF) y presentación (packages/sections).
