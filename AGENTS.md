<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:project-context -->
# Contexto del proyecto (leer antes de cualquier tarea)

Este repo es una **PoC de Backend-Driven UI (BDUI)** para una demo en vivo de experimentación/A-B ante negocio y producto. Toda la memoria del proyecto está en `docs/`:

1. `docs/README.md` — índice y convenciones.
2. `docs/contexto.md` — objetivo, guion, alcance y no-alcance.
3. `docs/arquitectura.md` — `[ARQ]` vs `[DEMO]`.
4. `docs/contrato.md` — Screen v1.1, secciones, operaciones, sanitización.
5. `docs/variantes-y-vistas.md` — presets A/B/C/D y rutas.
6. `docs/decisiones.md` — decisiones vigentes y descartadas.
7. `docs/roadmap.md` — estado actual y checklist de la iteración en curso.

## Reglas para agentes

- Antes de proponer algo, clasifícalo como `[ARQ]` (se replica en nativo/.NET) o `[DEMO]` (conveniencia de Next). Next.js se usa libremente, pero nunca se presenta como parte del diseño.
- **No** agregar: métricas, eventos funcionales, tiempo real, polling, caché del screen, autenticación real, otras pantallas, ni refactors de buenas prácticas fuera del objetivo. Revisa `docs/decisiones.md` antes de reproponer algo descartado.
- La Home vive en la raíz `/` (no existe `/home`). Rutas: `/`, `/ingresar`, `/configuracion`.
- La Home (`/`) y `/configuracion` nunca se cachean.
- El cliente no decide qué mostrar ni interpola datos del usuario: eso lo hace el backend (o el adaptador `mock` que lo simula).
- Las vistas solo usan las operaciones de `lib/data`; nunca leen fixtures ni Supabase directamente.
- Mocks (D-77): toda respuesta simulada del backend (endpoint que aún no existe) va en `contract/fixtures/`. No crear `mocks/` ni carpetas de mocks junto a pantallas o paquetes. `config/` es solo configuración local de la app (p. ej. `app-config.json`, el logo), no contrato.
- `packages/` es compartido entre proyectos de la organización: no lleva lógica de un único consumidor. Lo específico de esta app (capa de datos, sesión) vive en `lib/` (D-55).
- Cambios de contrato: actualizar en el mismo commit `docs/contrato.md`, `contract/fixtures/` y los schemas Zod. Si cambia un fixture: `npm run db:seed` y re-ejecutar `supabase/02-seed.sql` (nunca editar el seed a mano).
- Mantener el diseño KFC.
- Al terminar una tarea: marcar avance en `docs/roadmap.md` y registrar decisiones nuevas en `docs/decisiones.md`.
- Idioma (D-56): **código en inglés** (identificadores, variables, archivos y carpetas de código, comentarios, SQL, errores técnicos). **Wording en español**: los textos visibles para la audiencia y la documentación en `docs/`. Las URLs que ve la audiencia (`/ingresar`, `/configuracion`) se mantienen en español.
- Estilos en el contrato (D-60): variantes semánticas (`variant: "dark"`), nunca valores crudos (hex). El layout no decide los estilos de las secciones. Un solo eje de estilo por sección: `variant` (D-73); el de pantalla es `theme` (D-63).
- Reordenar secciones (D-74): solo viajan ids y el backend valida y reordena; nunca enviar contenido de secciones desde el panel. El panel es de escritorio y solo lo opera el presentador (D-75).
- Variables de entorno (D-57): los valores reales van en `.env.local` (ignorado por git). `.env.example` es solo plantilla y nunca lleva valores reales; Next no lo lee. Si falta `.env.local`, `DATA_SOURCE` cae a `mock`.
<!-- END:project-context -->
