# Roadmap y estado

## Estado actual del scaffold (diagnóstico de la Iteración 1)

Lo que **ya sirve** `[ARQ]`:
- Envelope `Screen → Section[]` validado con Zod (`packages/bdui/schema/`).
- Registry `type → componente` con carga diferida (`packages/bdui/screens/home/section-registry.ts`, `utils/section-registry.ts`).
- Fallback por sección: tipo desconocido o props inválidas no rompen la pantalla (`renderer/section-slot.tsx`, `unknown-section.tsx`, `section-error.tsx`).
- Versionado por sección y triggers declarativos (`onMount`, `onView`, `onPress`).
- Secciones `hero_banner`, `featured_products`, `promo_banner` con su schema.
- Contenedor mobile-first (`lg:max-w-sm`), ideal para que la audiencia use su celular.

Lo que **faltaba o cambiaba** (histórico: resuelto en la Iteración 2, salvo la deriva de los README):
- `app/kfc/(main)/(home)/page.tsx` importa `mocks/bdui-home.json` estático en build → debe pedir el screen por usuario en cada carga.
- `app/kfc/(main)/layout.tsx` arma `Header` y `AnnouncementBar` desde `mocks/app-config.json` → pasan al contrato (slot `header` + sección `announcement_bar`).
- `ScreenSchema` no tiene `layout` ni `header` → subir a v1.1.
- `ScreenRenderer` solo itera secciones → debe pintar header slot y aplicar `layout`.
- No existe concepto de usuario ni capa de datos.
- El comentario de `SectionSlot` menciona reglas de visibilidad que no existen → ignorar (D-12).
- README raíz y `packages/README.md` describen `renderers/`, `actions/`, `packages/lib` y `packages/layout`, que no existen en el repo (la carpeta real es `renderer/`; `layout` se retiró a `_legacy/`) → **sigue pendiente**; corregir solo si se muestra el código.
- Hay rutas/ejemplos a eliminar: `app/example`, `app/kfc/(main)/example`, `packages/bdui/screens/example`. → **Hecho** en Iteración 2 (movidos a `_legacy/`).

## `_legacy/`

Carpeta temporal con lo retirado en la Iteración 2 (las herramientas del agente no pueden borrar archivos). Excluida de `tsconfig.json` y ESLint. **No importar nada desde aquí.** El responsable la borra a mano tras revisar.

---

## Iteraciones

### ✅ Iteración 1 — Ideación y diseño
Cerrada. Resultado: esta carpeta `docs/`.

### ✅ Iteración 2 — Frontend con mocks (Contract First)
Checklist sugerido (en este orden):

1. [x] Reestructurar `app/`: `layout.tsx` (globals KFC), `page.tsx` → `/home`, `ingresar/`, `home/`, `configuracion/`. Eliminar `app/example` y `app/kfc`. *(Luego la Home se movió a `/`, ver D-42 en el paso 7.)*
   - `/home` aún renderiza `mocks/bdui-home.json` estático con el layout de header/anuncio en `app/home/layout.tsx` (se migra en pasos 7–9).
   - `/ingresar` y `/configuracion` son placeholders (paso 9).
   - Conocido: las acciones `NAVIGATE` del mock apuntan a `/kfc/example` (404). Se corrige en el paso 4.
2. [x] Eliminar `packages/bdui/screens/example`.
3. [x] Subir `ScreenSchema` a v1.1 (`layout`, `header`). `layout` y `header` opcionales → retrocompatible con v1.0.
4. [x] Crear `contract/fixtures/variant-{a,b,c,d}-*.json` partiendo de `mocks/bdui-home.json`.
   - `/home` todavía lee `mocks/bdui-home.json`; pasa a los fixtures en los pasos 8–9. Hasta entonces sigue el 404 de `/kfc/example`.
   - C y D referencian secciones que aún no existen; el fallback las mostrará como desconocidas hasta el paso 6.
5. [x] ~~Inicializar shadcn/ui~~ → Descartado (D-35). Los componentes base que falten (Card, Badge, Input, Table) se crean a mano en `packages/ui` dentro de los pasos 6 y 9.
6. [x] Secciones nuevas: `header_default`, `header_greeting`, `announcement_bar`, `coupon_card`, `daypart_menu` + registro en el registry de home.
   - [x] Corregido bug en `featured_products`: ahora `originalPrice` va tachado y `price` es el precio final.
   - Cada sección vive en `packages/sections/<nombre>/{index.tsx,schema.ts}`.
7. [x] `ScreenRenderer`: header slot + layouts `default` y `kiosk`.
   - Header slot con wrapper `display: contents` para que el `sticky` funcione (D-39). `SectionSlot` acepta `className`.
   - `kiosk`: lienzo oscuro con secciones como paneles blancos; en pantallas anchas, 2 columnas (D-40).
   - Movidos a `_legacy/`: `app/home/layout.tsx`, `packages/layout/`, `mocks/bdui-home.json`. `mocks/app-config.json` queda solo con `brand`.
   - TEMPORAL: la Home lee fixtures directo con `?preset=a|b|c|d` para validar (D-41). Se reemplaza en el paso 9.
   - [x] **Cambio posterior (D-42):** la Home pasó de `/home` a la raíz `/`. La Home vive en `app/(home)/page.tsx` (grupo de ruta que no afecta la URL) junto a `home-bdui-provider.tsx`; antes `app/page.tsx` solo redirigía. `app/home/` y el redirect viejo se movieron a `_legacy/`. El `?preset=` temporal ya no existe (D-41 cerrada).
8. [x] `lib/data` (antes `packages/data`, movido por D-55): interfaz de operaciones, `sanitize`, adaptador `mock` (fixtures + estado en memoria + interpolación `{{displayName}}`).
   - Estado del mock en `globalThis` para sobrevivir al hot reload del dev server.
   - Metadatos de presets en `contract/fixtures/variants.json` (D-44).
9. [x] Vistas:
   - [x] `/configuracion`: mobile-first, tarjeta por persona con `<select>` nativo, "Actualizar lista" y asignación masiva "Todos a A/B/C/D" (D-43, D-45, D-59). Sin caché con `connection()`; cambios con Server Actions + `refresh()`.
   - [x] `/ingresar`: formulario con `useActionState` + Server Action; cookie `bdui_demo`; redirige a `/` (D-48).
   - [x] Home en `/`: guard de sesión → `/ingresar`, `getHomeScreen`, sin caché (cookie). Eliminado `?preset` y los imports de fixtures (D-41 cerrada). Usuario inexistente → `/ingresar` (D-47).
10. [ ] Prueba manual (local, `npm run dev`):
    1. Navegador normal: abrir `/` → debe redirigir a `/ingresar`. Ingresar "Moisés" → Home A.
    2. Ventana incógnito (otra sesión): ingresar "María José" → Home A.
    3. Abrir `/configuracion`: deben aparecer `moises` y `maria-jose`. Asignar C a Moisés y D a María José.
    4. Recargar cada ventana: Moisés ve "¡Hola, Moisés!" y el cupón con su nombre; María José ve el kiosko.
    5. "Todos a A" → recargar → ambos vuelven a A.
    6. Casos borde: ingresar "!!!" → error en el form; ingresar "moises" desde otra ventana → comparte usuario con Moisés (saluda "Moisés", gana el primer nombre); reiniciar el server → recargar la Home → vuelve a `/ingresar`.
11. [x] Actualizar `roadmap.md` y `decisiones.md`.

Advertencia: el estado en memoria del mock funciona en local, pero **no es confiable en Vercel** (cada instancia tiene su propia memoria). La presentación en vivo requiere la Iteración 3.

### ⏭️ Iteración 3 — Backend Supabase
- [x] Confirmar D-23 (RPC `get_home_screen`) y el modelo de `contrato.md` §6. → Cerrado: 5 RPC, tablas cerradas (D-49).
- [x] Scripts en `supabase/`: `01-schema.sql` (tablas, seguridad, RPC), `02-seed.sql` (generado con `npm run db:seed`, D-50), `03-cleanup.sql`. Probados en Postgres 16 local; re-verificados tras la traducción a inglés (D-56).
- [ ] **Responsable:** ejecutar en el SQL Editor de Supabase: `npm run db:seed` → `01-schema.sql` → `02-seed.sql`. Verificar con `select public.list_variants();`.
- [x] Adaptador `supabase` en `lib/data/adapters/supabase.ts` (llama las 5 RPC por `fetch`, D-52); selección con `DATA_SOURCE=supabase`. Probado contra PostgREST 12 local (el servidor de `/rest/v1` de Supabase).
- [x] `.env.example` con las variables (versionado: excepción en `.gitignore`).
- [x] Diagnóstico de "veo el mock": faltaba `.env.local` (los valores estaban en `.env.example`) y la clave tenía un `=` duplicado (D-57). Salvaguardas en D-58. `.env.local` fue creado por el asistente.
- [x] Kiosko: el header del preset D es negro vía `variant: dark` (D-60). La decisión vive en el contrato (fixture); el layout no la infiere.
- [x] Un solo eje de estilo `variant` por sección: `announcement_bar.colorScheme` pasa a `variant: dark|light` y `floating` se retira de los headers (D-73). Fixtures migrados: `birthday`, `christmas`, `heavy`, `logged`, `loyalty`.
- [ ] **Responsable (por D-56, D-60 y D-73):** los ids de los fixtures se tradujeron al inglés, el preset D cambió (header `dark`) y `announcement_bar` usa ahora `variant`. Con `DATA_SOURCE=supabase` el cambio solo se ve tras `npm run db:seed` + volver a ejecutar `supabase/02-seed.sql` en Supabase (con `mock` se ve al instante). Opcional: re-ejecutar `01-schema.sql` (solo cambian mensajes de error y comentarios).
- [ ] **Responsable:** reiniciar `npm run dev`, confirmar que `/configuracion` muestra el indicador verde «Supabase» y repetir la prueba manual del paso 10 de la Iteración 2; verificar en el Table Editor que `demo_users` se llena.
- [ ] Variables de entorno en Vercel (las mismas tres).
- [ ] Deploy en Vercel.
- [ ] Ensayo con 4 dispositivos reales.

### Iteración 3.6 — Orden de secciones por vista
Pedido del responsable: reordenar con drag and drop las secciones de cada vista, desde el panel de escritorio. Decisiones D-74 a D-76.
- [x] Backend: funciones `get_variant_screen` y `reorder_sections` en `supabase/01-schema.sql`, con sus permisos. Probadas en Postgres 16 como `anon`: reordena sin tocar el contenido, rechaza ids faltantes, repetidos, desconocidos, lista vacía, nula y vista inexistente, y re-sembrar restablece el orden.
- [x] Capa de datos: `getVariantScreen` y `reorderSections` en `types.ts`, `index.ts`, `adapters/supabase.ts` y `adapters/mock.ts` (el mock guarda el orden en memoria). Mock probado con las seis vistas reales.
- [x] UI: las vistas de la leyenda del panel son enlaces; editor en `app/configuracion/[variantId]/` (arrastre nativo, filas bloqueadas para header y bottom bar, «Guardar orden»).
- [ ] **Responsable:** volver a ejecutar `supabase/01-schema.sql` en el SQL Editor de Supabase (idempotente; crea las dos funciones nuevas). Sin esto el editor falla con `DATA_SOURCE=supabase`.
- [ ] **Responsable:** `npx tsc --noEmit` y `npm run dev`; abrir `/configuracion`, tocar una vista, arrastrar, guardar y recargar la Home con una persona que tenga esa vista. Probar también que tras re-sembrar el orden vuelve al original.
- Reset entre presentaciones: `npm run db:seed` + `02-seed.sql` (restablece el orden). `03-cleanup.sql` no lo hace.
- Descartado por ahora: botón «Restablecer» en el panel (D-74), «Descartar cambios» (D-75), `@dnd-kit` (D-76).
- Posible siguiente paso (fuera de alcance): vista previa en vivo de la Home a un costado del editor, ya que el escritorio tiene espacio.

### Mantenimiento — Una sola ubicación para mocks (D-77)
- [x] `mocks/` renombrada a `config/` (solo contiene `app-config.json`, configuración local de marca). Las respuestas simuladas del backend siguen en `contract/fixtures/`.
- [x] Imports actualizados: `packages/sections/header-default/index.tsx` y `app/ingresar/page.tsx` → `@/config/app-config.json`.
- [x] Docs: `arquitectura.md` (estructura, regla de fixtures y conteo de 9 operaciones), `contrato.md`, `decisiones.md` (D-36, D-77), `AGENTS.md` y `packages/bdui/README.md` (ya no describe `screens/*/mocks/` ni el ejemplo retirado).
- [ ] **Responsable:** `npx tsc --noEmit` y `npm run dev`; verificar que el logo se ve en la Home y en `/ingresar`.

### Backlog — mejoras del panel de experimentación (próxima sesión)
El responsable trae ideas propias para iterar (P-5). Candidatas ya propuestas por el asistente, todas construibles sobre las 5 operaciones existentes (sin tocar el contrato):
1. **Experimento A vs B con reparto aleatorio 50/50:** elegir dos presets y repartir a las personas al azar. Es el corazón de un A/B real: el negocio reparte tráfico, no elige persona por persona.
2. **Barra de distribución en vivo:** "A 25% · B 50% · C 25%", recalculada con cada cambio.
3. **«Rollback instantáneo»:** reencuadrar «Todos a A» con el mensaje "si la variante falla, se apaga en un segundo sin release".

Restricciones vigentes: sin métricas (D-13), sin tiempo real ni polling (D-18), sin editor de JSON (D-24), panel mobile-first (D-43), código en inglés y wording en español (D-56).

### Iteración 3.5 — Vistas de contexto y bottom bar
Pedido del responsable: presentación dirigida a producto; foco en **contexto + layout** y en prender/apagar iniciativas. Decisiones D-62 a D-68.

- [x] Presets A–D movidos a `_legacy/contract/fixtures/` (D-30, D-62).
- [x] Seis fixtures de vista (`variant-{guest,logged,loyalty,christmas,heavy,birthday}.json`) + `variants.json`. Validados contra los schemas Zod del registry.
- [x] Screen v1.2: `theme` y slot `bottomBar` (`packages/bdui/schema/screen.ts`, renderer, `globals.css` con temas y token `--highlight`) (D-63, D-64).
- [x] Secciones nuevas `bottom_bar` y `loyalty_card` + registro. `promo_banner` sin colores sigue al tema.
- [x] `initiatives.json` (incidencia P1, dirección P2, registro P3 solo `guest`).
- [x] `lib/data`: nuevas vistas, `DEFAULT_VARIANT_ID` (hoy `'logged'`, D-69) y `ANONYMOUS_VARIANT_ID = 'guest'`, operaciones `listInitiatives` y `setInitiativeEnabled` en mock y Supabase (D-65). El mock resuelve la bottom bar con la misma regla que el SQL (probado).
- [x] Panel: leyenda con emoji, «Todos a …» por vista y sección Bottom bar con interruptores (D-66).
- [x] Supabase: tabla `initiatives`, `get_home_screen` con la bottom bar, 2 RPC nuevas, migración desde A–D, `03-cleanup.sql` resetea iniciativas (D-67). Probado contra Postgres 16 con los roles de Supabase.
- [x] Docs: `contrato.md`, `decisiones.md`, `variantes-y-vistas.md`, `contexto.md`, `arquitectura.md`, `supabase/README.md`.
- [x] **Home pública (D-69, D-70):** sin guard de sesión; sin sesión o con usuario desconocido el backend entrega `guest`; al registrarse asigna `logged`. «Registrarme» (bottom bar) y «Oferta de la semana» navegan a `/ingresar`, que agrega «Volver al inicio». Probado en mock y en Postgres (incluye migración desde A–D → `logged`).
- [x] Copys fuera de pendientes (D-71).
- [ ] **Responsable:** `npm run db:seed` (regenera `02-seed.sql`, que todavía tiene A–D) → ejecutar `01-schema.sql` y luego `02-seed.sql` en Supabase. Verificar con `select public.list_variants();` y `select public.list_initiatives();`.
- [ ] **Responsable:** `npx tsc --noEmit` y `npm run lint` sobre el repo completo (los archivos nuevos pasaron el chequeo de tipos de forma aislada).
- [ ] **Responsable:** prueba manual: abrir `/` sin sesión → vista Default con «Crea tu cuenta» → «Registrarme» → ingresar nombre → vuelve a `/` con la vista Logeado → asignar Loyalty y Cumpleaños desde el panel → recargar → prender «Pedir dirección» y «Aviso de incidencia» → recargar (también en una ventana incógnito sin sesión) → «Todos a Logeado» → `03-cleanup.sql`.

### Iteración 4 — Material de presentación
- [ ] Slides: qué es BDUI, casos de uso que no van en vivo (kiosko/Vales de Consumo, onboarding/legal, superficies satélite).
- [ ] Verificar referencias marcadas "por verificar" en `contexto.md`.
- [ ] Explicación para el equipo técnico usando solo lo marcado `[ARQ]`.

---

## Pendientes abiertos

| # | Pendiente | Iteración |
|---|-----------|-----------|
| P-1 | ~~Confirmar RPC vs Edge Function para resolver el screen (D-23).~~ Cerrado: RPC (D-23, D-49). | 3 |
| P-2 | ~~Validar copys borrador.~~ Cerrado: el equipo es dueño del contenido (D-71). | 3.5 |
| P-3 | Verificar referencias Nubank / DoorDash / Delivery Hero / Lyft. | 4 |
| P-4 | Decidir si las URLs visibles pasan a inglés (`/login`, `/settings`) o se mantienen en español (`/ingresar`, `/configuracion`). Hoy se mantienen (D-56). | 3 |
| P-5 | Iterar mejoras del panel de configuración con las ideas del responsable (ver Backlog). | 3 |
| P-6 | ~~Decidir qué hacer con `variant: floating` y unificar `variant` / `colorScheme`.~~ Cerrado: un solo eje `variant` por sección y `floating` retirado (D-73). | 3 |
