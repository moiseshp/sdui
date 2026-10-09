# supabase/

Scripts SQL del backend de la demo. Se ejecutan a mano en **Supabase → SQL Editor → New query → pegar → Run**.

| Archivo | Cuándo | Qué hace |
|---------|--------|----------|
| `01-schema.sql` | Una vez (o al cambiar el esquema) | Tablas `variants`, `demo_users` e `initiatives`, seguridad (tablas cerradas) y las 9 funciones RPC del contrato. También actualiza una base creada con los presets A–D. |
| `02-seed.sql` | Después de `01`, y cada vez que cambie un fixture | Carga/actualiza las vistas y las iniciativas de la bottom bar desde `contract/fixtures/`. Retira las vistas que ya no existen (las personas en ellas pasan a la vista Logeado). **Generado**: no editar a mano. |
| `03-cleanup.sql` | Al terminar cada presentación | Borra las personas y devuelve cada iniciativa a su estado inicial; conserva vistas e iniciativas. |

Todos son idempotentes: se pueden volver a ejecutar sin romper nada. Volver a ejecutar `02` nunca cambia si una iniciativa está prendida o apagada, pero **sí restablece el orden de las secciones** de cada vista (sobrescribe `screen`, D-74).

## Generar el seed

```bash
npm run db:seed
```

Lee `contract/fixtures/` y escribe `supabase/02-seed.sql`. Los fixtures son la fuente de verdad; el seed nunca se edita a mano.

## Seguridad

- Las tablas tienen RLS activo **sin políticas** y sin permisos para `anon`/`authenticated`: la clave pública no puede leerlas ni escribirlas directo.
- Lo único que la clave pública puede hacer es invocar las 9 funciones (`security definer`):

| Operación (`lib/data`) | Función RPC | Endpoint REST |
|-----------------------------|-------------|---------------|
| `registerUser` | `upsert_user(p_id, p_display_name)` | `POST /rest/v1/rpc/upsert_user` |
| `getHomeScreen` | `get_home_screen(p_user_id)` | `POST /rest/v1/rpc/get_home_screen` |
| `listUsers` | `list_users()` | `POST /rest/v1/rpc/list_users` |
| `listVariants` | `list_variants()` | `POST /rest/v1/rpc/list_variants` |
| `assignVariant` | `assign_variant(p_user_id, p_variant_id)` | `POST /rest/v1/rpc/assign_variant` |
| `listInitiatives` | `list_initiatives()` | `POST /rest/v1/rpc/list_initiatives` |
| `setInitiativeEnabled` | `set_initiative_enabled(p_initiative_id, p_enabled)` | `POST /rest/v1/rpc/set_initiative_enabled` |
| `getVariantScreen` | `get_variant_screen(p_variant_id)` | `POST /rest/v1/rpc/get_variant_screen` |
| `reorderSections` | `reorder_sections(p_variant_id, p_section_ids)` | `POST /rest/v1/rpc/reorder_sections` |

Ese mapeo 1:1 es lo que se lleva al equipo técnico: cualquier plataforma (Swift, Android, .NET) consume las mismas 9 operaciones.

Riesgo aceptado (demo): quien tenga la URL del proyecto y la clave pública puede invocar las funciones, incluidas `assign_variant`, `set_initiative_enabled` y `reorder_sections` (esta última solo recibe ids, nunca contenido, D-74). Es coherente con D-25 (panel sin protección) y los datos se borran tras cada presentación.

## Cómo resuelve `get_home_screen`

La Home es pública (D-69):

1. Sin sesión (`p_user_id` nulo) o usuario desconocido → vista anónima `guest`. Usuario registrado → la vista que tiene asignada (al registrarse, `logged`).
2. Si hay iniciativas prendidas cuya audiencia incluye esa vista (`audience` nulo = todas), agrega `bottomBar` con la `section` de la de menor `priority` (P1 gana).
3. Si hay usuario, reemplaza `{{displayName}}` (nombre completo) y `{{firstName}}` (primera palabra, para saludos, D-72) en todo el payload, escapados como string JSON.

Nunca devuelve `null`.

## Verificación

Probado contra Postgres 16 emulando los roles de Supabase (`anon`, `authenticated`, `service_role`): las 9 funciones responden con la forma de `lib/data/types.ts`, el acceso directo a tablas es denegado, sin sesión o con un usuario desconocido se entrega la vista `guest` con su bottom bar, al registrarse se asigna `logged`, la prioridad de la bottom bar se respeta (incidencia > dirección > registro), `{{displayName}}` se interpola sin romper el JSON aun con comillas o barras en el nombre, la migración desde los presets A–D mueve a las personas a `logged` y los tres scripts son idempotentes.
