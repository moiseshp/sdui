# packages/

Estructura de paquetes compartidos entre todos los proyectos de la organización. Cada paquete es una unidad independiente con responsabilidades claras, publicable de forma autónoma y consumible por cualquier proyecto.

---

## Filosofía

**Variantes, no composiciones ad-hoc.** Cualquier necesidad visual específica de un proyecto se resuelve como una variante dentro del paquete correspondiente, nunca como una implementación paralela en el proyecto consumidor. Esto garantiza coherencia visual y evita la divergencia a largo plazo.

**Especificidad en el proyecto, no en el paquete.** Si una necesidad es genuinamente única a un proyecto, se resuelve en ese proyecto. Los paquetes compartidos no se contaminan con lógica de un solo consumidor.

**Domain-driven donde aplica.** Los paquetes que encapsulan un dominio rico (como `bdui`) co-localizan toda su lógica interna: tipos, hooks, schemas, utilidades. No se crean carpetas globales para hooks o types si esos artefactos solo tienen sentido dentro de un dominio.

---

## Paquetes

### `ui`

**Componentes 100% UI sin lógica de negocio.**

Contiene los átomos y moléculas del design system: `Button`, `Input`, `Badge`, `Card`, `Typography`, etc. Los componentes no conocen conceptos de negocio ni hacen fetching de datos.

La especificidad entre proyectos o marcas se resuelve exclusivamente mediante **variantes** (`variant="primary"`, `variant="ghost"`, etc.), no mediante composiciones ad-hoc ni reimplementaciones en cada proyecto.

Conceptualmente alineado con el nivel de átomos y moléculas de Atomic Design.

**Depende de:** globals.css (theme del proyecto)
**Es consumido por:** `layout`, `sections`, y los proyectos directamente.

---

### `layout`

**Chrome estructural de la aplicación.**

Contiene los componentes que conforman la envolvente persistente de cada web: `AnnouncementBar`, `HeaderLayout`, `FooterLayout`, `BottomNavigation`. Son componentes estructurales que existen con independencia de la ruta activa y no forman parte del contenido de las páginas.

La estructura es compartida entre proyectos. Las diferencias visuales entre marcas se resuelven a través de `globals.css` y variantes, no rediseñando los componentes.

Conceptualmente alineado con el nivel de templates de Atomic Design, restringido al chrome de la aplicación.

**Depende de:** `ui`, `globals.css`.
**Es consumido por:** los proyectos directamente, como shell de la aplicación.

---

### `sections`

**Organismos de contenido reutilizables.**

Contiene los organismos que componen el cuerpo de las páginas: `HeroBanner`, `FeaturedProducts`, `AppDownloadBanner`, `NewsletterSignup`, `PromoBanner`, etc.

Son candidatos naturales a ser renderizados por el sistema BDUI, aunque su definición no depende de él — funcionan como componentes React convencionales y pueden usarse independientemente.

Los componentes de `sections` **no hacen fetching propio**. Reciben sus datos como props, hidratados desde el BFF a través del schema BDUI. La lógica de qué mostrar y bajo qué criterio es responsabilidad del BFF, no del componente.

Conceptualmente alineado con el nivel de organismos de Atomic Design.

**Depende de:** `ui`, `globals.css`.
**Es consumido por:** `bdui` (como renderers), y los proyectos directamente cuando se usan fuera del sistema BDUI.

---

### `bdui`

**Todo lo concerniente al dominio Backend-Driven UI.**

Organizado de forma domain-driven: toda la lógica BDUI vive en este paquete, sin dispersarse en carpetas globales de hooks, types o utils.

Contiene:

- **Schema types**: definición TypeScript del contrato entre BFF y cliente (componentes, acciones, secciones, pantallas).
- **Renderers**: lógica que mapea un tipo de componente del schema a su implementación React.
- **Action handlers**: procesamiento de las acciones declaradas en el schema (`navigate`, `apiCall`, `track`, etc.).
- **Providers**: contexto y configuración del sistema BDUI para los proyectos consumidores.
- **Hooks**: utilidades reactivas internas al dominio (`useRenderer`, `useAction`, etc.).

Sigue el patrón **Screen + Section Tree** (referencia: Airbnb Ghost Platform), donde el BFF retorna un árbol de secciones que el cliente renderiza de forma declarativa.

**Depende de:** `sections`, `ui`, `globals.css`.
**Es consumido por:** los proyectos que implementan pantallas dirigidas por el BFF.

---

### `utils`

**Utilidades cross-proyecto.**

Contiene todo lo que es genuinamente transversal a la organización y no pertenece a ningún dominio específico:

- Funciones puras reutilizables (formatters, parsers, helpers).
- Configuraciones compartidas de tooling: TypeScript (`tsconfig` base), ESLint, Prettier, y configuraciones de build.

La regla para que algo viva en `utils`: debe ser útil para al menos dos proyectos o paquetes distintos y no depender de ningún concepto de dominio del sistema.

**Depende de:** nada.
**Es consumido por:** todos los paquetes y proyectos.

---

### `lib`

**Implementaciones custom de lógica JavaScript y wrappers de terceros.**

Contiene librerías propias o integraciones que encapsulan dependencias externas con comportamiento específico de la organización: manejo de moneda (`currency`), integración con GTM (`gtm-custom`), conexión con pasarelas de pago (`payment_connection`), etc.

La distinción con `utils` es clara: `utils` son funciones puras sin dependencias externas pesadas; `lib` son implementaciones que wrappean, extienden o integran librerías de terceros con lógica propia. Si algo requiere instalar una dependencia externa y adaptarla al contexto de la organización, vive en `lib`.

**Depende de:** dependencias externas según cada implementación. No depende de paquetes internos del sistema.
**Es consumido por:** los proyectos y paquetes que necesiten cada integración puntual.

---

## Reglas generales

1. **Las dependencias solo van hacia abajo** en el grafo. Ningún paquete importa de un paquete que lo consume.
2. **Sin valores visuales hardcodeados.** Todo color, espaciado o valor tipográfico referencia `globals.css`.
3. **Sin lógica de un único consumidor en paquetes compartidos.** Si algo solo lo necesita un proyecto, va en ese proyecto.
4. **Nuevas necesidades visuales = nueva variante**, no un nuevo componente paralelo.
5. **`sections` no fetcha datos.** Los datos siempre llegan desde afuera, hidratados por el BFF.
