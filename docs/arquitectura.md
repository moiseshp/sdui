# Arquitectura

Este proyecto mezcla dos capas que **no deben confundirse**:

- `[ARQ]` **Arquitectura**: lo que se lleva al equipo técnico. Debe poder implementarse igual en una app nativa (Swift / Android), en .NET o en un kiosko.
- `[DEMO]` **Implementación de la demo**: Next.js + React usados libremente para avanzar rápido. Son conveniencias, no requisitos.

> Regla para agentes: antes de proponer algo, decide si es `[ARQ]` o `[DEMO]`. Si es `[DEMO]`, úsalo sin culpa pero **no** lo presentes como parte del diseño a replicar.

---

## Principios `[ARQ]`

1. **El cliente no decide qué mostrar.** El backend resuelve *usuario → vista → screen (+ bottom bar)* y entrega una pantalla lista para renderizar. El cliente solo mapea `type` → componente.
2. **Personalización resuelta en backend.** Textos personalizados (p. ej. "¡Hola, Moisés!") llegan ya interpolados. El cliente nunca arma strings con datos del usuario. Tampoco decide qué ve quien no tiene sesión: la Home es pública y el backend responde la vista anónima (D-69).
3. **Cada carga de pantalla pide el screen de nuevo.** Sin caché del screen. Recargar (web) o volver a montar la pantalla (nativo) = nueva petición. Es el mecanismo que hace visibles los cambios del panel.
4. **Contract First.** El contrato (forma del Screen + operaciones de datos) se define antes que el backend. El frontend se desarrolla contra mocks que cumplen el contrato; cambiar al backend real no toca las vistas.
5. **Registry con fallback.** Cada plataforma tiene un registry `type → componente`. Un `type` desconocido o props inválidas **no rompen la pantalla**: la sección se omite o muestra un placeholder.
6. **Versionado por sección.** Cada sección declara `version`; el cliente conoce la versión que soporta.
7. **El layout es del screen, no de las secciones.** `layout` cambia cómo se disponen las secciones (contenedor, columnas), nunca sus props.
8. **Estilos como variantes semánticas.** El contrato dice `variant: "dark"`, nunca `#000000`. El backend decide la variante en las props de cada sección; cada plataforma la traduce a sus tokens de diseño. El layout no decide estilos de las secciones (D-60). Cada sección usa un único eje de estilo propio, `variant` (D-73); el de pantalla es `theme` (principio 9).
9. **El tema es de la pantalla, semántico e independiente del layout.** `theme: "loyalty"` cambia los tokens de toda la pantalla (p. ej. el color de marca); las secciones no saben que existe (D-63).
10. **Feature flags en el backend.** Las iniciativas que compiten por un mismo espacio (la bottom bar) se prenden y apagan en el backend, que elige la ganadora por prioridad y audiencia. El cliente solo pinta lo que llega (D-64).

## Flujo `[ARQ]`

```
Cliente (web / app / kiosko)
   │  1. registerUser(nombreSanitizado)          ← solo al ingresar (opcional)
   │  2. getHomeScreen(userId | null)            ← en cada carga de la Home (`/`), con o sin sesión
   ▼
Backend
   │  sin sesión o usuario desconocido → vista anónima (guest)
   │  con usuario → la vista asignada (al registrarse: logged)
   │  agrega bottomBar con la iniciativa prendida de mayor prioridad para esa vista
   │  interpola {{displayName}} en todo el screen
   ▼
Screen JSON (contrato v1.2)
   ▼
Cliente: valida → ScreenRenderer → tema + header slot + layout + secciones + bottom bar
```

Panel (`/configuracion`): `listUsers()`, `listVariants()`, `assignVariant(userId, variantId)`, `listInitiatives()`, `setInitiativeEnabled(initiativeId, enabled)`. Editor de orden (`/configuracion/[vista]`): `getVariantScreen(variantId)`, `reorderSections(variantId, sectionIds)` (D-74).

## Capa de datos

- `[ARQ]` Las vistas solo conocen las **9 operaciones**: `registerUser`, `listUsers`, `listVariants`, `assignVariant`, `getHomeScreen`, `listInitiatives`, `setInitiativeEnabled`, `getVariantScreen`, `reorderSections` (detalle en `contrato.md`).
- `[ARQ]` Hay **adaptadores intercambiables** detrás de esas operaciones:
  - `mock` → fixtures JSON de `contract/fixtures/` + estado en memoria (Iteración 2).
  - `supabase` → backend real (Iteración 3).
  - Mañana podría ser `dotnet`, sin tocar vistas.
- `[DEMO]` El adaptador se elige con la variable `DATA_SOURCE` (`mock` | `supabase`; tolera mayúsculas y espacios). El panel `/configuracion` muestra un indicador con la fuente activa para evitar dudas durante la demo (D-58).
- `[DEMO]` El adaptador `mock` **simula al backend**: es donde vive la resolución del screen, de la bottom bar y la interpolación cuando no se usa Supabase. Aplica las mismas reglas que `get_home_screen`.
- `[ARQ]` **Respuestas simuladas del backend = `contract/fixtures/`** (D-77). Cuando un endpoint aún no existe, su respuesta se escribe como fixture ahí: es la misma fuente que usa el adaptador `mock` y que genera el seed de Supabase. No existe una carpeta `mocks/` aparte.
- Ubicación: `lib/data/`, **no** `packages/`. `packages/` es compartido entre proyectos de la organización y no debe contener lógica de un único consumidor; usuarios, vistas, iniciativas y Supabase son propios de esta app (D-55). Dependencias: `app/` → `lib/` → `contract/`; ningún paquete importa de `lib/`.

## Excepción consciente: sanitización en el cliente

- La normalización del nombre (`Moisés` → `moises`) se hace en el **frontend**, solo por ser demo. `[DEMO]`
- En una versión productiva debería vivir en el backend para que ninguna plataforma tenga que reimplementarla. `[ARQ]` (registrado como deuda en `decisiones.md`).
- Está aislada en **una sola función** de la capa de datos para que moverla sea trivial.

## Qué usamos de Next.js `[DEMO]`

Se puede usar todo lo que agilice: Server Components, Server Actions, route handlers, redirects del lado servidor, cookies, etc. Condiciones:

- La Home (`/`) y `/configuracion` **sin ningún tipo de caché** (render dinámico, fetch sin caché). Una recarga siempre debe traer lo último.
- Nada de estas features se documenta como requisito para mobile.
- Variables de entorno (D-57): valores reales en `.env.local` (ignorado por git); `.env.example` es plantilla sin valores reales y Next no lo lee. Si falta `.env.local`, `DATA_SOURCE` cae a `mock`.
- Next.js de este repo es **v16** y tiene cambios incompatibles con versiones anteriores: leer `node_modules/next/dist/docs/` antes de escribir código (ver `AGENTS.md`).

## Estructura objetivo del repo

```
app/                         [DEMO] rutas Next
  layout.tsx                 globals KFC
  globals.css                tokens KFC + temas por [data-bdui-theme]
  (home)/                    grupo de ruta: no afecta la URL, solo agrupa
    page.tsx                 Home de la demo (raíz `/`)
    home-bdui-provider.tsx   registry de acciones de la Home
  ingresar/                  login por nombre (page + form + action)
  configuracion/             panel (page + actions + componentes cliente, incl. interruptores de iniciativas)
contract/                    [ARQ] lo que se lleva al equipo técnico
  fixtures/                  respuestas simuladas del backend (Contract First, D-77)
    variants.json            metadatos de las vistas (seed de la tabla `variants`)
    variant-guest.json       una por vista: guest, logged, loyalty, christmas, heavy, birthday
    ...
    initiatives.json         iniciativas de la bottom bar (seed de la tabla `initiatives`)
supabase/                    [ARQ] backend: 01-schema.sql, 02-seed.sql (generado), 03-cleanup.sql
lib/                         lógica propia de ESTA app (no compartida entre proyectos)
  session.ts                 [DEMO] cookie de sesión
  data/                      capa de datos (ver contrato.md §4)
    index.ts, types.ts       [ARQ] las 9 operaciones + interfaz DataSource
    sanitize.ts              [DEMO] sanitización del nombre
    adapters/                mock.ts [DEMO] · supabase.ts [ARQ]
scripts/
  generate-supabase-seed.mjs genera 02-seed.sql desde contract/fixtures/ (npm run db:seed)
packages/
  bdui/                      [ARQ] schema, renderer, registry
  sections/                  una carpeta por sección del catálogo (incluye los headers)
  ui/                        componentes base propios (Radix + cva + Tailwind)
docs/                        esta documentación
config/                      [DEMO] configuración local de la app; NO es contrato ni mock de endpoint (D-77)
  app-config.json            solo marca (logo, D-36); header y anuncio pasan al contrato
```

A eliminar (ya movido a `_legacy/`): `app/example`, `app/kfc/*`, `app/home/` (la Home pasó a la raíz, D-42), `packages/bdui/screens/example`, `packages/layout/` (header y anuncio pasaron a ser secciones), `mocks/bdui-home.json` (reemplazado por los fixtures; la carpeta `mocks/` pasó a `config/`, D-77), `contract/fixtures/variant-{a,b,c,d}-*.json` (presets reemplazados por las vistas de contexto, D-62).
