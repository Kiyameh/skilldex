---
name: css-conventions
description: Convenciones de código Css
---

# Convenciones de Código Css

## Trigger

Usar cuando se va a escribir o editar código Css o Css modules

## Generalidades

- El proyecto usa scoped css (astro lo usa por defecto, react mediante css modules), por lo tanto:
- Usar clases solo si son necesarias
- Clases con nombres breves, pero descriptivos (p.e. red-button, elevated, title)
- Usar siempre que sea posible las variables de `@/styles/global.css`

## Herramientas

- Puedes usar, si corresponde, estas herramientas para hacer el código css más moderno y legible:

### Preferencia de unidades

- Uso de `rem` frente a unidades absolutas
- Uso de `dvh` y `dvw` frente a `vh` o `vw`

### Dimensiones calculadas (funciones)

- Uso de `clamp()` para tipografía y espacios fluidos

```css
h1 {
  font-size: clamp(2rem, 5vw + 1rem, 4rem);
}
```

- Uso de `min()`, `max()` para establecer límites dinámicos en una sola línea

```css
.container {
  width: min(100% - 2rem, 1200px);
}
```

### Colores calculados (funciones color)

- Usa `color-mix()` para generar variaciones de opacidad o mezclas a partir de una variable base.

```css
.button-hover {
  background-color: color-mix(in oklch, var(--surface-200), white 15%);
}
```

### CSS Nesting

- Usa css nesting para simplificar el código (No más de tres niveles)
- Usa selectores de agrupación o parentesco para elementos expresamente relacionados con otros
- Usa selectores de atributo o selector `&` para simplificar el código.

```css
.button {
  background: blue;

  &.is-active {
    border: 2px solid white;
  }
}
.button > .icon[href] {
  opacity: 1;
}
```

### Selectores avanzados

- Usa `:has()` para aplicar estilos a un padre según el estado o existencia de sus hijos.

```css
.card:has(.badge-new) {
  border-color: gold;
}

form:has(input:invalid) button[type="submit"] {
  opacity: 0.5;
  pointer-events: none;
}
```

- Usa `:is()` para agrupar selectores y `:where()` para agrupar reduciendo la especificidad a cero.

```css
/* Mantiene la especificidad del elemento más alto */
:is(h1, h2, h3) {
  line-height: 1.2;
}

/* Especificidad cero: muy fácil de sobrescribir después */
:where(.article, .sidebar) p {
  margin-bottom: 1rem;
}
```

### Variables para valores repetidos

- Siempre que en un mismo archivo se repita varias veces una característica, definela en una variable.

```css
--alert-color: oklch(50% 0.15 25);

.alert {
  border: 1px solid var(--alert-color);
}
.text {
  color: var(--alert-color);
}
```

- Declara variables locales limitadas al alcance de un componente.
  _Evita saturar el :root con cientos de variables si estas solo se usan en un componente específico_

```css
.card {
  --card-padding: 2rem;
  padding: var(--card-padding);
}

.card-compact {
  --card-padding: 1rem;
}
```

### Queries

- Usa container queries `@container` en lugar de media queries para componentes reutilizables.
  _El componente se adapta según el espacio disponible en su contenedor padre, no según el tamaño de la pantalla, haciéndolo 100% modular_

```css
.layout {
  container-type: inline-size;
}

.card {
  display: flex;
  flex-direction: column;
}

@container (min-width: 400px) {
  .card {
    flex-direction: row;
  }
}
```

- Pon las media queries o los container queries siempre debajo del estilo que modifican. No importa si se usan varios queries en un archivo

```css
.card {
  display: flex;
  flex-direction: column;
}

@container (min-width: 400px) {
  .card {
    flex-direction: row;
  }
}

.header {
  background: blue;
}

@container (min-width: 400px) {
  .header {
    background: red;
  }
}
```

- Usa la sintaxis matemática moderna para las media/container queries.

```css
@media (width >= 768px) and (width <= 1024px) {
  .sidebar {
    display: block;
  }
}
```

### Mejoras en la tipografía

- Usa `text-wrap: balance` en titulares para evitar líneas asimétricas.

```css
h1,
h2,
h3 {
  text-wrap: balance;
  max-width: 60ch;
}
```

- Usa `text-wrap: pretty` en párrafos para evitar palabras viudas al final del bloque.

```css
p {
  text-wrap: pretty;
}
```
