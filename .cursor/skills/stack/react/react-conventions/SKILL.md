---
name: react-conventions
description: Convenciones y buenas practicas para React
metadata:
  version: "1.0.0"
  domain: stack
  triggers: React, Jsx, Tsx
---

# React conventions

## Trigger

Usar cuando se va a escribir o editar codigo React: componentes, hooks, estado, efectos, rendimiento, accesibilidad y testing.

- Usar también la skill `typescript-conventions`

## Casos de uso

- Crear componentes nuevos siguiendo una API clara y consistente.
- Decidir que hook utilizar segun el problema a resolver.
- Evitar anti-patrones comunes de estado, efectos y renderizado.
- Mejorar rendimiento y legibilidad sin optimizaciones prematuras.
- Aplicar buenas practicas de testing y accesibilidad en componentes React.

## Decision tree

1. ¿Es logica accionada por usuario (click, input, submit)? -> `handler` dedicado (`handleX`/`onX`)
2. ¿El valor se puede derivar desde props/estado actual? -> calcular en render (sin estado extra)
3. ¿Hay estado local simple (toggle, input, loading)? -> `useState` tipado y estado atomico
4. ¿Hay estado complejo con multiples transiciones? -> `useReducer` + acciones tipadas
5. ¿Necesitas compartir estado entre ramas de componentes? -> `useContext` (valor memorizado y contexto por dominio)
6. ¿Necesitas sincronizar con sistema externo (API, timer, listener, storage)? -> `useEffect` + cleanup
7. ¿Necesitas un valor mutable sin render o acceso DOM imperativo? -> `useRef`
8. ¿Hay trabajo caro o props inestables causando rerenders medibles? -> `useMemo`/`useCallback`/`memo`
9. ¿La misma logica se repite entre componentes? -> extraer `custom hook`
10. ¿Hay formularios o validacion de entrada? -> estado controlado + handlers + validacion en submit
11. ¿La capa UI depende de carga remota? -> modelar `isLoading`/`error`/`data` y controlar cancelacion
12. ¿Hay incertidumbre sobre calidad final? -> revisar `references/18-anti-patterns.md` antes de merge

## ✅ Best practices

- Priorizar composiciones con `children` antes que prop-drilling
- TypeScript por defecto en componentes, hooks y contratos de datos.
- Un componente por archivo y un folder por componente por defecto.
- Usar guard clauses para reducir anidacion y simplificar ramas.
- Mantener responsabilidades pequenas: componente, hook y contexto por dominio.
- Estandarizar naming: `Props`, `handleX`, `onX`, `[value, setValue]`.
- Modelar estados de UI explicitos: loading, error, empty, success.
- Optimizar solo cuando exista evidencia de rendimiento (profiling).
- Priorizar semantica HTML y accesibilidad desde la primera version.
- Testear comportamiento observable, no implementacion interna.

## Indice de referencias

- `references/1-components-basics.md`: fundamentos para crear componentes, composicion y uso de props.
- `references/2-component-design.md`: diseno de API de componentes, convenciones de props y variantes.
- `references/3-jsx-rendering-patterns.md`: patrones de renderizado en JSX, condicionales, listas y estructura de render.
- `references/4-state-with-useState.md`: uso correcto de `useState`, actualizaciones y estado derivado.
- `references/5-side-effects-with-useEffect.md`: uso de `useEffect`, dependencias, limpieza y sincronizacion externa.
- `references/6-references-with-useRef.md`: uso de `useRef` para referencias DOM y valores mutables sin render.
- `references/7-context-with-useContext.md`: uso de `useContext`, estructura de providers y alcance de estado compartido.
- `references/8-performance-memoization.md`: memoizacion con `useMemo`, `useCallback` y `memo`.
- `references/9-reducer-patterns-with-useReducer.md`: manejo de estados complejos con `useReducer` y acciones.
- `references/10-custom-hooks.md`: creacion de custom hooks reutilizables con APIs consistentes.
- `references/11-forms-and-user-input.md`: convenciones para formularios, entradas de usuario y validacion.
- `references/12-async-data-and-fetching.md`: carga de datos asincrona y gestion de estados de red.
- `references/13-error-handling.md`: manejo de errores de UI y estrategias de fallback.
- `references/14-accessibility-a11y.md`: buenas practicas de accesibilidad en componentes React.
- `references/15-testing-react-components.md`: criterios y patrones para testear componentes React.
- `references/16-folder-structure-and-architecture.md`: organizacion de carpetas y arquitectura de componentes.
- `references/17-styling-conventions.md`: convenciones para estilos y consistencia visual.
- `references/18-anti-patterns.md`: anti-patrones frecuentes y como evitarlos.
