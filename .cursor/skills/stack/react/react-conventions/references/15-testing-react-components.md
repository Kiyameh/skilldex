# Testing React components

## Cuando usar

- Para validar comportamiento visible y contratos del componente.
- En componentes con logica de estado, eventos o ramas criticas.

## Cuando NO usar

- Para testear implementacion interna irrelevante para el usuario.
- Para duplicar cobertura con tests fragiles de snapshots masivos.

## Reglas de estilo

- Priorizar tests por comportamiento, no por detalles internos.
- Usar queries accesibles (`getByRole`, `getByLabelText`).
- Nombrar tests por escenario y resultado esperado.
- Mantener setup minimo y reutilizable.
- Mockear solo bordes externos (network, date, storage).

## Ejemplo correcto

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import Counter from "./Counter";

test("increments count when user clicks button", () => {
  render(<Counter />);

  fireEvent.click(screen.getByRole("button", { name: "+1" }));

  expect(screen.getByText("1")).toBeInTheDocument();
});
```

## Anti-patrones

- Testear funciones privadas del componente.
- Assert de texto demasiado acoplado a copy cambiante.
- Mockear todo y perder valor de integracion.

## Checklist rapida

- Escenario legible.
- Assert sobre resultado visible.
- Mocks minimos.
- Test estable ante refactor interno.
