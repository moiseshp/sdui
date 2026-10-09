# Contrato `[ARQ]`

Contrato entre backend y cliente. Fuente de verdad para fixtures, schemas Zod y, más adelante, el backend.

Las respuestas simuladas del backend (Contract First: el endpoint todavía no existe o se trabaja sin conexión) viven **solo** en `contract/fixtures/`. No hay otra carpeta de mocks (D-77).

> Regla: cualquier cambio de contrato se hace **en el mismo commit** en tres lugares: este documento, `contract/fixtures/*.json` y los schemas Zod (`packages/bdui/schema`, `packages/sections/*/schema.ts`). Si cambia un fixture, además: `npm run db:seed` y volver a ejecutar `supabase/02-seed.sql`.

---

## 1. Screen v1.2.0

Cambios respecto a v1.1.0: se agregan `theme` y el slot `bottomBar` (D-63, D-64). Ambos son opcionales, así que un payload v1.1.0 o v1.0.0 sigue siendo válido (retrocompatible). v1.1.0 había agregado `layout` y el slot `header`.

Implementado en `packages/bdui/schema/screen.ts` (`ScreenSchema`, `ScreenLayoutSchema`, `ScreenThemeSchema`, `SCHEMA_VERSION = '1.2.0'`).

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
  "actions": { },
  "meta": { "title": "KFC Perú - Inicio" }
}
```

| Campo | Tipo | Notas |
|-------|------|-------|
| `schemaVersion` | string | `"1.2.0"` |
| `screenId` | string | `"kfc_home"` |
| `layout` | `"default"` \| `"kiosk"` | Opcional; si no llega, `"default"`. Cómo se disponen las secciones. Ver §3. |
| `theme` | `"default"` \| `"loyalty"` \| `"christmas"` | Opcional; si no llega, `"default"`. Intención visual de toda la pantalla; cada plataforma la traduce a sus tokens. Ver §3. |
| `header` | Section | Opcional; si no llega, no se pinta header. Slot fijo/sticky fuera del scroll. En nativo = barra de navegación. Tipos: `header_default`, `header_greeting`. Los fixtures siempre lo incluyen. |
| `sections` | Section[] | Cuerpo de la pantalla, en orden. |
| `bottomBar` | Section | Opcional. Barra fija abajo. La llena el backend con la iniciativa ganadora (§4.1); si no hay ninguna, no llega. Tipo: `bottom_bar`. Los fixtures de vistas **no** la incluyen. |
| `actions` | Trigger map | Opcional. Sin uso funcional en la PoC. |
| `meta` | object | Opcional. Título/descripción. |

**Section** (sin cambios respecto al scaffold): `{ id, type, version, actions?, props? }`.

**Secciones ocultas (D-78).** En la **plantilla guardada** de una vista (la que devuelve `getVariantScreen`, no el payload de la Home), una sección del cuerpo puede llevar `hidden: true`. Es un dato de almacenamiento del backend, no del contrato que recibe el cliente: `getHomeScreen` quita esas secciones y el flag antes de responder, así que el cliente nunca decide qué se oculta y el envelope `Section` no cambia. Una sección oculta conserva su posición en `sections`. Solo aplica al cuerpo: `header` y `bottomBar` no se ocultan. Un fixture puede arrancar con una sección oculta escribiendo `"hidden": true`.

## 2. Catálogo de secciones

### Existentes (se mantienen)

| `type` | Props principales | Archivo |
|--------|-------------------|---------|
| `hero_banner` | `items[]` (imageUrl, alt, title?, subtitle?, actions?), `viewportMode: full\|peek`, `showDots`, `autoplay`, `autoplayInterval` | `packages/sections/hero-banner/schema.ts` |
| `featured_products` | `title?`, `layout: carousel\|grid`, `variant: default\|compact`, `items[]` (id, name, description?, imageUrl?, price?, originalPrice?, badge?, actions?), `cta?` | `packages/sections/featured-products/schema.ts` |
| `promo_banner` | `title`, `description?`, `imageUrl?`, `backgroundColor?`, `textColor?`, `badge?`, `actions?` | `packages/sections/promo-banner/schema.ts` |

### Nuevas (Iteración 2)

| `type` | Props | Notas |
|--------|-------|-------|
| `header_default` | `position?: static\|sticky`, `variant?: default\|dark` | Header actual (logo de marca desde `config/app-config.json`, que no es parte del contrato: D-36, D-77). `default` = barra de marca; `dark` = barra oscura (D-60, D-73). |
| `header_greeting` | `title: string`, `subtitle?: string`, `position?`, `variant?: default\|dark` | `title` llega **ya interpolado** ("¡Hola, Moisés!"). Mismas variantes que `header_default`. |
| `announcement_bar` | `message: string`, `variant?: dark\|light` (por defecto `dark`), `isDismissible?: boolean` | Antes vivía en `app-config.json`. Si la sección está presente, se muestra (ya no existe `isVisible`). |
| `coupon_card` | `title`, `description?`, `code`, `validUntilLabel` (texto ya formateado), `badge?`, `cta?: { label, actions }` | Campaña/cupón por segmento. Copiar el código es comportamiento local del componente. |
| `daypart_menu` | `title`, `daypartLabel` (p. ej. "Almuerzo · 12:00–16:00"), `storeLabel?`, `items[]` (id, name, imageUrl?, price?, actions?) | El backend decide la franja; el cliente solo pinta. Hoy ninguna vista la usa; se conserva en el catálogo. |

### Nuevas (Iteración 3.5)

| `type` | Props | Notas |
|--------|-------|-------|
| `bottom_bar` | `title`, `message?`, `cta?: { label, actions? }`, `variant?: brand\|dark\|warning`, `icon?: gift\|map-pin\|warning\|bell`, `isDismissible?` (por defecto `true`) | Solo en el slot `bottomBar`. Variante e ícono son semánticos (D-60): cada plataforma los traduce. Cerrarla es estado local; vuelve en la siguiente carga. Sin `actions`, el botón es decorativo (D-32). `packages/sections/bottom-bar/`. |
| `loyalty_card` | `tierLabel`, `pointsLabel` (texto ya formateado), `progress` (0–100), `progressLabel?` | Estado del programa de lealtad. El cliente no calcula niveles ni puntos (D-12). `packages/sections/loyalty-card/`. |

`promo_banner` sin `backgroundColor`/`textColor` ahora usa el color de marca del tema (`primary`). Los fixtures nuevos ya no envían hex, lo que reduce la deuda D-61.

Todos los textos con formato (precios, fechas, franjas) llegan **formateados desde el backend**.

Todos los strings son **texto plano** (sin HTML ni markdown): el mismo payload debe poder pintarse en web, nativo y kiosko.

**Tokens de personalización** (los reemplaza el backend en cualquier string; el cliente nunca los ve, D-08):

| Token | Valor | Uso |
|-------|-------|-----|
| `{{firstName}}` | Primera palabra del nombre ("Moisés") | Saludos y textos cortos: headers, cupones (D-72). Es el que usan los fixtures. |
| `{{displayName}}` | Nombre completo como se escribió ("Moisés Huaringa") | Cuando haga falta el nombre completo. Hoy ningún fixture lo usa. |

Sin sesión no hay interpolación: la vista anónima no lleva tokens.

**Estilos como variantes semánticas (D-60).** El contrato expresa intención (`variant: "dark"`), nunca valores crudos (`#000000`). Cada plataforma decide qué significa `dark` con sus propios tokens (web: tokens de `app/globals.css`, p. ej. `bg-foreground` para el header `dark`; nativo: tema o asset catalog), así el mismo payload respeta marca, modo oscuro y accesibilidad en cada canal. El estilo de una sección lo decide el backend en las props de **esa** sección; el `layout` no lo infiere (por eso un kiosko puede llevar header claro y una home normal puede llevar header negro). Excepción heredada (deuda, D-61): `promo_banner` todavía recibe `backgroundColor` y `textColor` en hex.

**Un solo eje de estilo por sección (D-73).** Todas las secciones usan **`variant`** para su look propio, con nombres que describen lo que se ve (`dark`, `light`). `default`, cuando existe, significa "el look estándar de esa sección", no un color global (en `header_default` es la barra de marca). El eje de **pantalla** es otro e independiente: `theme` (D-63). `variant` es de sección; `theme` es de pantalla.

## 3. Layouts

| `layout` | Comportamiento esperado |
|----------|-------------------------|
| `default` | Una columna, mobile-first (contenedor `lg:max-w-sm`). |
| `kiosk` | Fondo oscuro, cada sección como panel blanco independiente; en pantallas anchas, 2 columnas y la primera sección a todo el ancho. Debe verse **claramente distinto** a `default` desde un celular. |

El layout solo afecta el contenedor y la disposición; nunca modifica props de secciones. Las secciones se adaptan al ancho disponible por su cuenta (container queries, D-37).

Implementado en `packages/bdui/renderer/screen-renderer.tsx` (`layoutClasses`). En nativo, cada plataforma implementa su propia estrategia por `layout`.

### Temas (v1.2, D-63)

| `theme` | Intención | Web (`app/globals.css`) |
|---------|-----------|-------------------------|
| `default` | Marca KFC. | Tokens de `:root`. |
| `loyalty` | Usuario del programa de lealtad: el rojo de marca pasa a negro, con dorado como acento. | `--primary` negro, `--highlight` dorado. |
| `christmas` | Campaña temática de Navidad. | `--primary` verde, `--highlight` rojo KFC. |

`theme` y `layout` son ejes independientes. El renderer expone el tema como `data-bdui-theme` en la raíz de la pantalla y la plataforma redefine sus tokens ahí. Las secciones **no** leen el tema: usan los tokens de siempre (`primary`, `highlight`) y cambian solas. El estilo propio de una sección sigue decidiéndose en sus props (D-60).

## 4. Operaciones de datos

Las vistas solo usan estas operaciones. Cada adaptador (`mock`, `supabase`, futuro `dotnet`) las implementa.

| Operación | Entrada | Salida | Usada en |
|-----------|---------|--------|----------|
| `registerUser` | `name: string` (sin sanitizar; la operación sanitiza) | `{ id, displayName, isNew }` | `/ingresar` |
| `getHomeScreen` | `userId: string \| null` | `Screen` resuelto (nunca `null`) | `/` (Home) |
| `listUsers` | — | `{ id, displayName, variantId, createdAt }[]` | `/configuracion` |
| `listVariants` | — | `{ id, name, description }[]` | `/configuracion` |
| `assignVariant` | `userId, variantId` | usuario actualizado | `/configuracion` |
| `listInitiatives` | — | `{ id, name, description, priority, audience, enabled }[]` | `/configuracion` |
| `setInitiativeEnabled` | `initiativeId, enabled` | iniciativa actualizada | `/configuracion` |
| `getVariantScreen` | `variantId` | `screen` guardado de la vista, como **plantilla** (sin interpolar, sin `bottomBar` y con las secciones ocultas marcadas `hidden: true`); `null` si no existe | `/configuracion/[vista]` |
| `reorderSections` | `variantId, sectionIds[], hiddenSectionIds[]?` | `{ sectionIds, hiddenSectionIds }` guardados | `/configuracion/[vista]` |

Reglas:

- `registerUser`: si el `id` sanitizado ya existe, **no crea** otro; devuelve el existente con `isNew: false` y **no** sobrescribe `displayName` (gana el primero).
- Usuario nuevo → `variantId: "logged"`: al registrarse, el backend le asigna la vista Logeado (D-69). Desde ahí, las demás vistas se asignan por configuración en el panel.
- `getHomeScreen`: la Home es **pública** (D-69). Sin sesión (`null`) o con un usuario desconocido, devuelve la vista anónima `guest`. Con usuario, la vista que tiene asignada. Le quita las secciones ocultas y el flag `hidden` (D-78), le agrega `bottomBar` según §4.1 y, si hay usuario, reemplaza los tokens `{{displayName}}` y `{{firstName}}` en todos los strings (§2). Nunca devuelve `null`. Devuelve el payload **sin validar**: el cliente valida con `parseScreen`.
- `listUsers`: ordenados por llegada (`createdAt` ascendente).
- `variantId` válidos: `guest`, `logged`, `loyalty`, `christmas`, `heavy`, `birthday` (D-62).
- `listInitiatives`: ordenadas por prioridad (1 primero). `audience: null` = todas las vistas.
- `getVariantScreen`: devuelve el `screen` guardado **tal cual** (plantilla): conserva los tokens `{{…}}`, no agrega `bottomBar` e incluye las secciones ocultas con `hidden: true`. Sirve para que el panel muestre el orden y la visibilidad actuales.
- `reorderSections` (D-74, D-78): guarda el **orden y la visibilidad** de las secciones del cuerpo en una sola operación. Recibe **solo ids**, nunca contenido:
  - `sectionIds`: todas las secciones de la vista en el nuevo orden, ocultas incluidas. El backend exige que sean **exactamente** las secciones de la vista (ninguna de menos, repetida ni desconocida; vacío o nulo se rechazan) y reordena `screen.sections`.
  - `hiddenSectionIds` (opcional): las secciones que quedan ocultas; el resto queda visible. Debe ser un subconjunto de `sectionIds`, sin repetidos. **Si se omite, la visibilidad no cambia**: un cliente que solo reordena nunca vuelve a mostrar nada por accidente.
  - No toca `header`, `theme`, `layout` ni el contenido de las secciones, y `bottomBar` no se guarda en `screen` (§4.1). Aplica a **la vista**, o sea a todas las personas que la tengan asignada. Re-sembrar (`02-seed.sql`) sobrescribe `screen` y restablece el orden y la visibilidad de los fixtures.
  - El nombre se conserva por compatibilidad con D-74, aunque ahora también guarda la visibilidad.
- La asignación masiva del panel («Todos a …») se arma con `assignVariant`; no es una operación del contrato (D-45, D-59, D-66).

### 4.1 Bottom bar: iniciativas como feature flags (D-64)

Una **iniciativa** es una pieza que compite por la bottom bar: invitar a registrarse, pedir la dirección, avisar de una incidencia. Cada una tiene `priority`, `audience` (vistas a las que aplica) y `enabled` (el flag). Al resolver la Home, el backend elige **la iniciativa prendida de menor `priority` cuya audiencia incluye la vista del usuario** y la pone en `bottomBar`. Si ninguna aplica, el payload no trae `bottomBar`.

El cliente no sabe qué iniciativas existen ni cómo se eligió: solo pinta la sección `bottom_bar` que le llega. Prender o apagar una iniciativa no requiere release; se ve al recargar (D-17).

Iniciativas de la demo (`contract/fixtures/initiatives.json`):

| id | Prioridad | Audiencia | Inicial | Qué muestra |
|----|-----------|-----------|---------|-------------|
| `incident` | 1 | Todas | apagada | Aviso de demoras en delivery (`warning`, no se puede cerrar). |
| `address` | 2 | Todas | apagada | «¿Dónde te llevamos tu pedido?» (`dark`). |
| `register` | 3 | `guest` | prendida | «Crea tu cuenta y llévate 10%» (`brand`). Su CTA navega a `/ingresar` (D-70). |

Implementación (`lib/data/`):

| Archivo | Rol |
|---------|-----|
| `types.ts` | `[ARQ]` Tipos y la interfaz `DataSource` que implementa cada backend. |
| `index.ts` | `[ARQ]` Las 9 operaciones públicas. Único punto que importan las vistas. Elige el adaptador con `DATA_SOURCE` (por defecto `mock`). Exporta también `getDataSourceName()`, que el panel usa para mostrar la fuente activa (D-58). |
| `sanitize.ts` | `[DEMO]` Sanitización del nombre (§5). `registerUser` la aplica antes de llamar al backend. |
| `adapters/mock.ts` | `[DEMO]` Simula al backend: estado en memoria, resolución de la bottom bar e interpolación. `DATA_SOURCE=mock` (por defecto). |
| `adapters/supabase.ts` | `[ARQ]` Llama las 9 RPC por HTTP plano (`fetch`, sin SDK): `POST {SUPABASE_URL}/rest/v1/rpc/<funcion>` con la clave pública en `apikey`. Es la referencia de cómo lo consumiría nativo/.NET. Valida el formato de la clave y rechaza la secreta (D-58). `DATA_SOURCE=supabase`. |

Como la sanitización vive en el frontend (D-07), el backend implementa `upsertUser({ id, displayName })` con el nombre ya sanitizado. En producción recibiría el nombre crudo.

Metadatos de las vistas (nombre y descripción): `contract/fixtures/variants.json`; el screen de cada vista: `contract/fixtures/variant-<id>.json`; las iniciativas: `contract/fixtures/initiatives.json`. Son el seed de las tablas `variants` e `initiatives`.

## 5. Sanitización del nombre `[DEMO]`

Se ejecuta en el frontend (ver excepción en `arquitectura.md`), dentro de `registerUser`.

1. `trim`.
2. Normalizar a NFD y eliminar marcas diacríticas (tildes, diéresis; `ñ` → `n`).
3. Minúsculas.
4. Espacios internos → `-`.
5. Eliminar todo lo que no sea `[a-z0-9-]`.
6. Colapsar guiones repetidos y quitar guiones al inicio/fin.
7. Si queda vacío → error de validación en `/ingresar`.

| Entrada | `id` | `displayName` |
|---------|------|---------------|
| `Moisés` | `moises` | `Moisés` |
| `  María José ` | `maria-jose` | `María José` |
| `Peña` | `pena` | `Peña` |
| `Moisés Huaringa` | `moises-huaringa` | `Moisés Huaringa` |
| `!!!` | — | error |

`displayName` = entrada con `trim` y espacios colapsados, sin otros cambios.

Colisiones (dos personas con el mismo `id`) son **aceptadas**: comparten usuario y ven lo mismo.

## 6. Modelo de datos (Supabase) — implementado

Scripts en `supabase/` (ver `supabase/README.md`). Probados contra Postgres 16 con los roles de Supabase.

```
variants                                   -- vistas; seed generado desde contract/fixtures/
  id            text  PK  check ^[a-z][a-z0-9-]*$   -- 'guest' | 'logged' | 'loyalty' | ...
  name          text  not null
  description   text  not null
  screen        jsonb not null              -- Screen v1.2 con tokens {{firstName}}/{{displayName}}, sin bottomBar; secciones ocultas con hidden: true (D-78)

demo_users
  id            text  PK  check ^[a-z0-9]+(-[a-z0-9]+)*$   -- sanitizado
  display_name  text  not null  check 1..60 caracteres
  variant_id    text  not null default 'logged'  FK → variants.id   -- vista asignada al registrarse
  created_at    timestamptz not null default now()

initiatives                                -- bottom bar (feature flags); seed desde initiatives.json
  id                  text  PK
  name, description   text  not null
  priority            int   not null       -- 1 = más alta
  audience            text[]               -- ids de vistas; null = todas
  enabled             boolean not null     -- el flag; el seed no lo pisa
  enabled_by_default  boolean not null     -- estado al que vuelve 03-cleanup.sql
  section             jsonb not null       -- Section bottom_bar que se inyecta en el screen
```

Seguridad: las tres tablas con RLS activo **sin políticas** y sin permisos para `anon`/`authenticated`. La clave pública solo puede invocar 9 funciones RPC (`security definer`), una por operación del contrato (D-49, D-65):

| Operación | RPC | Notas |
|-----------|-----|-------|
| `registerUser` | `upsert_user(p_id, p_display_name)` | `on conflict do nothing`; `isNew` según si insertó. |
| `getHomeScreen` | `get_home_screen(p_user_id)` | Vista (`guest` si `p_user_id` es nulo o desconocido) sin sus secciones ocultas + `bottomBar` ganadora (§4.1) + interpolación de `{{displayName}}` y `{{firstName}}` escapados como string JSON. Nunca `null`. |
| `listUsers` | `list_users()` | Orden por `created_at`. |
| `listVariants` | `list_variants()` | Solo metadatos (sin `screen`), en el orden de `variants.json`. |
| `assignVariant` | `assign_variant(p_user_id, p_variant_id)` | Vista inexistente → error de FK. Usuario inexistente → error `P0002`. |
| `listInitiatives` | `list_initiatives()` | Sin `section`. Orden por prioridad. |
| `setInitiativeEnabled` | `set_initiative_enabled(p_initiative_id, p_enabled)` | Iniciativa inexistente → error `P0002`. |
| `getVariantScreen` | `get_variant_screen(p_variant_id)` | Devuelve `variants.screen` tal cual (plantilla, con `hidden: true` en las ocultas). `null` si la vista no existe. |
| `reorderSections` | `reorder_sections(p_variant_id, p_section_ids, p_hidden_section_ids default null)` | Valida que los ids sean exactamente las secciones de la vista y que los ocultos sean un subconjunto sin repetidos (error `22023` si no). Reordena `screen.sections` con `jsonb_set` y pone o quita `hidden: true`; con `p_hidden_section_ids` nulo conserva la visibilidad. Vista inexistente → error `P0002`. Devuelve `{ sectionIds, hiddenSectionIds }`. |

Las respuestas ya vienen en camelCase con la forma de `lib/data/types.ts`. Cada RPC es un endpoint REST (`POST /rest/v1/rpc/<nombre>`), consumible desde cualquier plataforma.
