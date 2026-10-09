# Contexto

## Objetivo

Preparar una **demo en vivo** para el equipo de **producto** que muestre cómo un enfoque **Backend-Driven UI (BDUI)** les permite cambiar la Home según el **contexto del usuario** (no logeado, logeado, loyalty, heavy, cumpleaños, temporada) y prender o apagar iniciativas **sin depender de un release del frontend**.

- Es una **PoC para vender la idea**, no un entregable final.
- Debe ser **sencilla, directa y clara** en las bondades. No abrumar.
- Más adelante habrá otra presentación para **producto + tech + stakeholders**; para esa, todo vuelve a empezar (datos limpios, posiblemente otro alcance).

## Audiencia y formato

- Al menos **4 personas**, cada una desde su propio dispositivo (principalmente celular).
- El frontend se publica en **Vercel**; las personas entran a una URL.
- El presentador controla qué ve cada persona desde un panel de escritorio (`/configuracion`); el público solo mira los cambios en sus dispositivos (D-75).
- Los cambios se ven cuando cada persona **recarga su navegador**. No hay tiempo real ni polling. Es exactamente como funcionaría en producción: cada carga de pantalla pide la UI al backend.

## Guion de la presentación

1. Introducción breve: qué es BDUI en el contexto de experimentación y A/B.
2. Todos entran a la URL (la raíz `/`) **sin registrarse**: el backend les entrega la vista **Default** (no logeado), con la bottom bar «Crea tu cuenta».
3. Cada persona toca «Registrarme», escribe su **nombre** en `/ingresar` y vuelve a la Home: el backend se enteró del registro y ahora le entrega la vista **Logeado** (saludo con su nombre, elegidos para ti, favoritos).
   - Si dos personas se llaman igual, se les pide **nombre y apellido**.
   - Si aun así hay colisión, no pasa nada: esas personas verán lo mismo.
4. **Ronda 1:** el presentador abre `/configuracion`, muestra la lista de personas registradas y asigna vistas de contexto: "Moisés es loyalty, Ana cumple años hoy, Luis es heavy". La lógica que decidiría eso en producción se da por resuelta.
5. Las personas **recargan** y comparan lo que ven entre sí: mismo contrato, distinto layout, distinto tema.
6. **Feature flags:** el presentador prende «Pedir dirección» y luego «Aviso de incidencia» en la sección Bottom bar del panel. Todos recargan y ven cómo la misma barra cambia de iniciativa según la prioridad. Luego las apaga.
7. **Orden de secciones:** el presentador abre una vista en el panel (por ejemplo `Loyalty`), arrastra una sección más arriba que otra y toca «Guardar orden». Quienes tengan esa vista recargan y ven el nuevo orden: el layout de un segmento cambió sin release (D-74).
   - Solo el presentador opera el panel, que es de escritorio (D-75). Los asistentes miran los cambios en sus dispositivos; no eligen su vista ni reordenan. D-43 (operador rotativo) queda sin efecto.
8. Cierre con slides de los demás casos de uso (ver abajo).
9. Reset: «Todos a Logeado» desde el panel. El orden de las secciones se restablece re-sembrando (`npm run db:seed` + `supabase/02-seed.sql`).

Terminada la presentación, el presentador **borra los datos a mano** en el backend (`supabase/03-cleanup.sql`, que también devuelve las iniciativas a su estado inicial). `03-cleanup.sql` **no** restablece el orden de las secciones: eso lo hace el seed (D-74).

## Casos de uso que se cuentan en la presentación

| Caso de uso | Cómo se muestra |
|-------------|-----------------|
| Home según el contexto del usuario (sin sesión → registrado → heavy, cumpleaños) | En vivo: vista `guest` sin sesión, `logged` al registrarse, luego `heavy`, `birthday` |
| Branding por segmento sin tocar componentes | En vivo: vista `loyalty` (tema negro) |
| Layouts temáticos de temporada | En vivo: vista `christmas` |
| Feature flags: una misma pieza para varias iniciativas (registro, dirección, incidencias), con prioridad | En vivo: bottom bar desde el panel |
| Reordenar las secciones de una vista sin release (el layout de un segmento) | En vivo: editor de orden en el panel |
| Kioskos: menús y promos por tienda o franja horaria; paridad web/app/kiosko desde un mismo contrato. Aplica a la iniciativa **Vales de Consumo** como alternativa al webview | Solo slide (el layout `kiosk` sigue en el contrato) |
| Onboarding, formularios y pantallas regulatorias/legales | Solo slide |
| Superficies "satélite" (p. ej. Live Activities) | Solo slide |

## Alcance de la PoC

**Dentro:**
- Una sola vista de demo: la **Home de KFC**. El diseño KFC se mantiene.
- Tres rutas: `/` (Home), `/ingresar`, `/configuracion`.
- Seis vistas de contexto y la bottom bar con tres iniciativas (ver `variantes-y-vistas.md`).
- Reordenar las secciones de cada vista desde el panel de escritorio (solo el orden, D-74).
- Login solo por nombre, para identificar a la persona en la demo. La Home es pública: registrarse es opcional y cambia la vista (D-69).
- Frontend con datos mock bajo enfoque **Contract First**; backend real (Supabase) en una iteración posterior, con cambio transparente para el frontend.
- Componentes propios en `packages/ui` con lo ya instalado (sin shadcn, D-35).

**Fuera (descartado explícitamente):**
- Métricas, mediciones, eventos funcionando (`TRACK_EVENT` puede quedar como `console.log` o no hacer nada).
- Tiempo real y polling.
- Buenas prácticas o refactors que no sirvan directamente al objetivo de la demo.
- Otras pantallas además de la Home.
- Agregar, quitar o editar secciones desde el panel: solo se reordenan.
- Autenticación real, contraseñas, roles.
- La lógica que decide el contexto de cada usuario (reglas, segmentos, políticas): se simula asignando la vista a mano.
- Componentes `notice_sheet` y formularios dinámicos (la bottom bar es otra cosa, D-64).
- Renderizar Live Activities.

## Referencias

| Referencia | Estado |
|------------|--------|
| Airbnb — *A Deep Dive into Airbnb's Server-Driven UI System* (Ghost Platform, Ryan Brooks, 2021): https://medium.com/airbnb-engineering/a-deep-dive-into-airbnbs-server-driven-ui-system-842244c5f5 | Verificada. Ideas tomadas: screens + sections, layouts con placements, acciones declarativas, un schema compartido entre plataformas. |
| Material de Rafael Ring (Nubank) sobre BDUI | **Por verificar.** No usar en slides hasta tener el link original. |
| DoorDash, Delivery Hero (home/discovery con SDUI) | **Por verificar.** |
| Lyft en Live Activities con protobuf por el límite de 4KB | **Por verificar.** |
