# Variantes y vistas

## Vistas de contexto

Cada vista es un **Screen v1.2 completo** guardado como fixture en `contract/fixtures/variant-<id>.json` (y luego en la tabla `variants`). Reemplazan a los presets A–D (D-62), que quedaron en `_legacy/contract/fixtures/`. No hay editor de JSON en el panel: las vistas se preparan antes de la presentación.

La lógica que decide qué vista le toca a cada persona (¿es loyalty?, ¿es su cumpleaños?) **no es alcance**: se simula asignando la vista desde el panel. Lo que se demuestra es el diferencial **contexto + layout**.

| id | Nombre | `theme` | `header` | Secciones (en orden) | Qué demuestra |
|----|--------|---------|----------|----------------------|---------------|
| `guest` | Default (no logeado) | `default` | `header_default` | `hero_banner` · `featured_products` «Los combos más elegidos» · `featured_products` «Lo más top del momento» (badges #1–#4) · `featured_products` «Las promociones de la semana» (badge por día) · `promo_banner` «Oferta de la semana» (lleva a `/ingresar`) | `kind: anonymous`. **Vender primero**: lo que ve quien no tiene sesión mientras sea la vista sin sesión activa (lo es por defecto, D-69, D-81). No se asigna a personas. |
| `guest-signup` | Enfoque registro (no logeado) | `default` | `header_default` | `announcement_bar` «Crea tu cuenta gratis…» · `coupon_card` «10% en tu primer pedido» (CTA «Crear mi cuenta» a `/ingresar`) · `promo_banner` «Con tu cuenta, pides más rápido» (lleva a `/ingresar`) · `hero_banner` (`peek`) · `featured_products` «Los combos más elegidos» | `kind: anonymous`. **Registrar primero**: la alternativa a `guest` para quien navega sin sesión. Se activa desde el panel y la ven **todos** los visitantes sin sesión (D-81). Junto a `guest`, cuenta el experimento «vender primero vs. registrar primero». |
| `logged` | Logeado | `default` | `header_greeting` «¡Hola, {{firstName}}!» | `announcement_bar` exclusivo con cuenta · `featured_products` «Elegidos para ti» · `featured_products` «Tu lista de favoritos» (grid) · `promo_banner` «Solo por hoy» | La vista que el backend asigna **al registrarse** (D-69). Punto de partida y rollback. |
| `loyalty` | Loyalty | `loyalty` | `header_greeting` con «Miembro Club KFC Gold ★» | Igual que `logged` + `loyalty_card` (puntos y progreso) tras el anuncio; anuncio de puntos dobles y oferta «exclusivo Club» | Mismo layout, otro **tema**: el rojo pasa a negro con dorado sin tocar ninguna sección. |
| `christmas` | Navidad | `christmas` | `header_greeting` «¡Felices fiestas, {{firstName}}! 🎄» | `announcement_bar` de pre-orden · `promo_banner` «Banquete navideño» · `featured_products` «Para la mesa navideña» (grid) · `coupon_card` «Pre-orden de Nochebuena» | Layout temático de temporada con su propio tema (verde). |
| `heavy` | Usuario heavy | `default` | `header_greeting` «¡Qué bueno verte, {{firstName}}!» | `announcement_bar` de beneficio por frecuencia · `coupon_card` «Sólo para ti» · `featured_products` «Tus de siempre» («Lo pediste N veces») · `promo_banner` «Pide de nuevo» | Segmento por comportamiento (no necesariamente loyalty). |
| `birthday` | Cumpleaños | `default` | `header_greeting` «¡Feliz cumpleaños, {{firstName}}! 🎂» | `announcement_bar` · `coupon_card` «Tu regalo de cumpleaños» · `featured_products` «Arma tu celebración» · `promo_banner` «Bucket fiesta» | Contexto de un día específico. |

Notas:
- Todas usan `layout: default`. `kiosk` y `daypart_menu` siguen en el contrato, pero ninguna vista los usa hoy.
- Ningún fixture de vista trae `bottomBar`: la agrega el backend según las iniciativas prendidas (`contrato.md` §4.1).
- Cada vista declara en `variants.json` su `kind`: `anonymous` (sin sesión) o `signed-in` (con sesión). El panel las agrupa así (D-80, D-81).
- El contenido base (imágenes, productos) sale de los assets KFC en S3 de delosi-pidelo. Los fixtures **no tienen CTAs "Ver todos"** (D-32). Las únicas acciones de navegación son `NAVIGATE` a `/ingresar` en las vistas sin sesión y en la bottom bar de registro (D-70), y los botones del header (Usuario → `/ingresar`, Configuración → `/configuracion`) en todas las vistas.
- Los saludos y cupones usan `{{firstName}}` ("Moisés"), no el nombre completo, para no romper el header (D-72).
- Los copys son propios del equipo y no requieren validación (D-71).

## Bottom bar (iniciativas)

Definidas en `contract/fixtures/initiatives.json` (tabla `initiatives`). Gana la prendida de menor prioridad que aplica a la vista del usuario.

| id | Nombre | Prioridad | Para | Inicial | Se puede cerrar |
|----|--------|-----------|------|---------|-----------------|
| `incident` | Aviso de incidencia | P1 | Todas las vistas | apagada | No |
| `address` | Pedir dirección al abrir la app | P2 | Todas las vistas | apagada | Sí |
| `register` | Invitar a registrarse | P3 | `guest`, `guest-signup` (sin sesión) | prendida | Sí. Su CTA «Registrarme» lleva a `/ingresar` |

Momento sugerido en la presentación: con la sala repartida en varias vistas, prender «Pedir dirección» (aparece en todas), luego «Aviso de incidencia» (le gana a todo y no se puede cerrar) y apagar ambas para volver al estado inicial. Todo sin release, solo recargando.

## Vistas

### `/` (Home)
- La Home de la demo vive en la raíz. No existe `/home`.
- **Pública** (D-69): no exige sesión ni redirige.
- Sin sesión (o con una cookie de un usuario que ya no existe) → `getHomeScreen(null)` → el backend entrega la vista sin sesión activa (`guest` por defecto, D-81).
- Con sesión → `getHomeScreen(userId)` → la vista asignada (`logged` al registrarse).
- En ambos casos: valida → renderiza tema + header slot + layout + secciones + bottom bar (si llega).
- **Sin caché.** Leer la cookie hace la página dinámica; cada recarga pide el screen de nuevo.
- Diseño KFC se mantiene.
- Implementado en `app/(home)/page.tsx`.

### `/ingresar`
- Cabecera roja KFC con logo y "¡Bienvenido!", un input "Tu nombre" y un botón "Ingresar" (`app/ingresar/input.tsx`, `packages/ui/button.tsx`).
- Texto de ayuda: *"Si alguien más tiene tu nombre, agrega tu apellido."* Si el nombre es inválido, el mismo espacio muestra el error.
- Al enviar (Server Action): `registerUser(name)` → guarda el `id` en la cookie de sesión → navega a `/`. Como el backend asigna `logged` al registrarse, la persona ve el cambio de Home al instante (D-69).
- Se llega desde la Home: CTA «Registrarme» de la bottom bar u «Oferta de la semana» (D-70). Tiene un enlace «Volver al inicio».
- **Siempre** muestra el formulario, aunque haya sesión: así alguien puede volver a ingresar con otro nombre (D-48).
- Implementado en `app/ingresar/` (`page.tsx`, `sign-in-form.tsx`, `input.tsx`, `actions.ts` con `signInAction`).

### `/configuracion`
Panel del presentador, **de escritorio** (D-75): lo opera solo el presentador; el público únicamente mira los cambios en sus dispositivos. Pensado para que **producto** entienda cada concepto por separado (D-80).
- **No** requiere sesión ni redirige a `/ingresar`. No tiene protección: simplemente no se comparte la URL.
- Arriba: título, una línea que explica el panel e indicador de la **fuente de datos activa** «Supabase» (verde) o «Mock (en memoria)» (ámbar) (D-58).
- **Tres tabs**, cada uno responde una pregunta de producto. El tab activo vive en la URL (`?tab=vistas|segmentos|mensajes`), así recargar, «Actualizar lista» y cada guardado mantienen al presentador en el mismo tab. Sin `?tab` (o con un valor desconocido) abre **Vistas**. Las pestañas muestran cuántos segmentos hay conectados y cuántos mensajes están activos.

**Tab Vistas** — «¿Qué puede ver alguien en la Home?»
- Grupo **Sin sesión**: las vistas `kind: anonymous` (Default y Enfoque registro). Todos los visitantes sin sesión ven la misma; la activa tiene borde de marca y la etiqueta «La ven ahora», y las demás, el botón «Mostrar esta vista» (`setAnonymousVariant`, guarda al instante como los interruptores de mensajes). Tras guardar: «Listo: quien navega sin sesión ahora ve … Pide a la sala que recargue.» (D-81).
- Grupo **Con sesión**: las vistas `kind: signed-in`. Cada tarjeta dice cuántos segmentos la ven; Logeado lleva la etiqueta «Al registrarse» (D-69). Se asignan en el tab Segmentos.
- Cada vista enlaza a su editor de secciones (`/configuracion/[vista]`, abajo).

**Tab Segmentos** — «¿A quién se le muestra cada vista?»
- `[DEMO]` Cada persona conectada **representa un segmento** de clientes: en la presentación, «este segmento ve la vista Usuario heavy». En producción el backend decidiría el segmento por su cuenta.
- **Cómo están repartidos**: un chip por vista con sesión con su cantidad de segmentos.
- **Asignar a todos los segmentos**: un botón «Todos a …» por vista con sesión, con su color (D-66). «Todos a Logeado» hace de **rollback**. Se arman con `assignVariant` (`assignAllAction`); no son una operación nueva.
- Botón **«Actualizar lista»** para ver a quienes acaban de ingresar.
- Una **tarjeta por segmento** (no tabla): círculo con el emoji de la vista actual, `displayName`, «Segmento `id`» y un `<select>` nativo que solo ofrece vistas con sesión (`assignVariant`). Tras guardar: «Listo. Pídele a {nombre} que recargue».
- Solo aparecen quienes se registraron: quien navega sin sesión ve la vista sin sesión activa y no aparece en el panel. Estado vacío con instrucciones.

**Tab Mensajes** — «¿Qué aviso aparece abajo en la Home?»
- «Mensajes destacados» es el nombre de producto de la bottom bar; una línea aclara que técnicamente cada mensaje es un *feature flag* (D-64).
- **Ahora se muestra**: qué mensaje ve quien está sin sesión (con el nombre de la vista activa) y quien tiene sesión (una fila por grupo de vistas que reciben el mismo mensaje). `[DEMO]` Replica la regla del backend solo para mostrarla; la Home siempre recibe la ganadora del backend.
- **Mensajes disponibles**: una tarjeta por iniciativa con nombre, descripción, «Prioridad N» (la 1 es «la más alta»), «Quién lo ve» en palabras de producto («Todos, con y sin sesión», «Quien navega sin sesión»…) y un interruptor (`setInitiativeEnabled`). Tras guardar: «Listo: mensaje prendido/apagado. Pide a la sala que recargue.» (D-64, D-66).

Comunes:
- **Sin caché** (`connection()`).
- No incluye borrado de usuarios (el presentador limpia los datos a mano en el backend).
- Implementado en `app/configuracion/`: `page.tsx` (encabezado y tabs), `panel-tabs.tsx` (barra de tabs y títulos), `panel-model.ts` (`[DEMO]` agrupación, conteos, audiencias y «ahora se muestra»), `views-tab.tsx` + `anonymous-variant-picker.tsx`, `segments-tab.tsx`, `messages-tab.tsx`, `actions.ts`, `bulk-assign.tsx`, `initiative-toggle.tsx`, `refresh-button.tsx`, `switch.tsx`, `variant-select.tsx`, `variant-emoji.tsx` y `variant-styles.ts`. `switch.tsx` es el interruptor único del panel: lo usan las iniciativas y el editor de secciones (D-79). Nada de esto vive en `packages/` (D-79).

### `/configuracion/[vista]` (orden y visibilidad de secciones, D-74, D-78)
Editor de escritorio para reordenar, ocultar y mostrar las secciones de **una vista** (`guest`, `guest-signup`, `logged`, `loyalty`, `christmas`, `heavy`, `birthday`). Se entra desde las tarjetas del tab Vistas y se vuelve con «← Volver a Vistas».
- Lee `getVariantScreen(vista)` y muestra una **tarjeta por sección**: nombre en lenguaje de negocio («Banner principal», «Carrusel de productos», «Barra de anuncio», «Cupón», «Tarjeta de puntos…»), su título como resumen, miniatura si tiene imagen, número de posición y un **interruptor de visibilidad**. Nunca JSON.
- El **header** (arriba) y la **bottom bar** (abajo) aparecen como filas bloqueadas: no se reordenan ni se ocultan. La bottom bar la decide una iniciativa y no se guarda en `screen`.
- **Ocultar / mostrar** (D-78): el interruptor de cada fila **solo cambia el borrador**, igual que arrastrar. Una sección oculta se ve atenuada con la etiqueta «Oculta», conserva su posición y se puede seguir arrastrando.
- Se reordena con **arrastrar y soltar** nativo del navegador (sin dependencias, D-76).
- Un solo botón **«Guardar cambios»**, activo solo si cambió el orden o la visibilidad. Mientras tanto se lee «Cambios sin guardar: orden y visibilidad» (o solo uno de los dos), para que el presentador explique cada paso antes de aplicarlo. No hay «descartar» (D-75).
- Al guardar llama **una vez** a `reorderSections(vista, ids, ocultos)`: solo viajan ids; el backend valida, reordena `screen.sections` y marca las ocultas. Aviso: «Guardado. Quien tenga esta vista verá los cambios al recargar.»
- Es el layout de la **vista**, no de una persona: aplica a todas las que la tengan asignada.
- Solo reordena, oculta y muestra: no agrega, quita ni edita secciones.
- **Restablecer** = re-sembrar (`npm run db:seed` + `supabase/02-seed.sql`), que devuelve el orden y la visibilidad de los fixtures. `03-cleanup.sql` no los restablece.
- Sin caché (`connection()`).
- Implementado en `app/configuracion/[variantId]/` (`page.tsx`, `section-order-editor.tsx`, `section-labels.ts`); la acción es `reorderSectionsAction`, en `app/configuracion/actions.ts`. El interruptor es `app/configuracion/switch.tsx` (D-79).

## Sesión `[DEMO]`

La sesión es solo el `id` sanitizado en la cookie `bdui_demo` (`httpOnly`, `sameSite: lax`, 7 días). Se escribe en el Server Action de `/ingresar` y se lee en la Home con `lib/session.ts`. En nativo el equivalente sería UserDefaults / SharedPreferences. No hay logout en el alcance: para cambiar de nombre basta con volver a `/ingresar`.
