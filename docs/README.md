# docs/ — Contexto para desarrollo guiado por IA

Esta carpeta es la **memoria del proyecto**. Cualquier agente de IA (o persona) que retome el trabajo debe leerla antes de tocar código. Fue generada al cerrar la **Iteración 1 (ideación y diseño)** y se actualiza en cada iteración.

## Orden de lectura

| # | Archivo | Para qué sirve |
|---|---------|----------------|
| 1 | [contexto.md](./contexto.md) | Qué buscamos, para quién, guion de la presentación, alcance y no-alcance. |
| 2 | [arquitectura.md](./arquitectura.md) | Qué es arquitectura replicable `[ARQ]` y qué es atajo de la demo `[DEMO]`. |
| 3 | [contrato.md](./contrato.md) | Contrato Screen v1.1, catálogo de secciones, operaciones de datos y regla de sanitización. |
| 4 | [variantes-y-vistas.md](./variantes-y-vistas.md) | Presets A/B/C/D y comportamiento de `/`, `/ingresar`, `/configuracion`. |
| 5 | [decisiones.md](./decisiones.md) | Registro de decisiones (vigentes y descartadas) con su motivo. |
| 6 | [roadmap.md](./roadmap.md) | Estado actual del scaffold, plan por iteraciones y pendientes abiertos. |

## Convenciones de esta documentación

- **Idioma (D-56):** el **código** va en inglés (identificadores, variables, archivos y carpetas de código, comentarios, SQL, errores técnicos). El **wording** (textos visibles para la audiencia) y esta documentación van en español. Las URLs que ve la audiencia (`/ingresar`, `/configuracion`) se mantienen en español.
- **Etiquetas:**
  - `[ARQ]` → parte del diseño de arquitectura. Se explica al equipo técnico y se replica en otras plataformas (Swift, Android, .NET, kiosko).
  - `[DEMO]` → atajo o conveniencia para la PoC (p. ej. features de Next.js). **No** se documenta como algo a replicar.
- **Fuente de verdad:** si el código y estos documentos se contradicen, se asume que el documento es la intención y se pregunta antes de "corregir" cualquiera de los dos.
- **Mantenimiento:** toda decisión nueva se registra en `decisiones.md` y todo avance se refleja en `roadmap.md` en la misma sesión en que ocurre.
