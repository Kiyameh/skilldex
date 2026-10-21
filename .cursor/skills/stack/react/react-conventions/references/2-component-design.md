# Component design

## Cuando usar

- Al definir la API publica de un componente (props, variantes, callbacks).
- Cuando necesitas que un componente sea reutilizable y predecible.

## Cuando NO usar

- Para componentes muy acoplados a una pantalla concreta sin reutilizacion.
- Cuando la logica pertenece a un custom hook y no al componente.

## Reglas de estilo

- `Props` debe ser pequena, clara y tipada en TypeScript.
- Nombrar booleans como `isX`, `hasX`.
- Callbacks con prefijo `on` (`onClose`, `onChange`).
- Priorizar composicion via `children` frente a exceso de props.
- Evitar props ambiguas (`data`, `config`, `options` sin tipo claro).
- Dar prioridad a clausulas de guarda en ramas invalidas.

## Ejemplo correcto

```tsx
import { ReactNode } from "react";

interface Props {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

const Modal = ({ isOpen, title, children, onClose }: Props) => {
  if (!isOpen) return null;

  return (
    <section aria-modal="true" role="dialog">
      <header>
        <h2>{title}</h2>
        <button onClick={onClose}>Cerrar</button>
      </header>
      <div>{children}</div>
    </section>
  );
};

export default Modal;
```

## Anti-patrones

- Props con significado solapado (`isVisible` + `hidden`).
- Exponer demasiados flags para un solo componente.
- Acoplar fetch de datos y presentacion en el mismo componente base.

## Checklist rapida

- Props nombradas con intencion clara.
- Callbacks `onX`.
- `children` usado cuando aporta composicion.
- Guard clause aplicada para estados no renderizables.
