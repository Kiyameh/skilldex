# State with useState

## Cuando usar

- Para estado local y simple de un componente (UI state, toggles, inputs).
- Cuando el valor debe provocar re-render al cambiar.

## Cuando NO usar

- Para estado derivado de props o de otros estados (calcular en render).
- Para estado compartido amplio entre ramas lejanas (valorar `useContext` o store).
- Para logica de transiciones complejas con muchas acciones (valorar `useReducer`).

## Reglas de estilo

- Tipar siempre `useState` en TypeScript.
- Naming por defecto: `[value, setValue]`.
- Si el cambio viene de un evento, crear handler (`handleX`).
- Usar actualizaciones funcionales cuando depende del estado previo: `setX((prev) => ...)`.
- Priorizar estados atomicos; usar objetos solo si los datos estan intrinsecamente ligados.
- Inicializar con un valor coherente y estable (evitar `undefined` si no aporta).

## Ejemplo correcto

```tsx
import { useState } from "react";

interface Props {
  initialCount?: number;
}

const Counter = ({ initialCount = 0 }: Props) => {
  const [count, setCount] = useState<number>(initialCount);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleIncrement = () => setCount((prev) => prev + 1);

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    await fakeSave(count);
    setIsSaving(false);
  };

  return (
    <section>
      <p>{count}</p>
      <button onClick={handleIncrement}>+1</button>
      <button disabled={isSaving} onClick={handleSave}>
        {isSaving ? "Guardando..." : "Guardar"}
      </button>
    </section>
  );
};

const fakeSave = async (_value: number) => Promise.resolve();

export default Counter;
```

## Buenas prácticas

- Mantener cada estado con una sola responsabilidad.
- Preferir guard clauses en handlers antes de ejecutar actualizaciones.
- Si varios `setState` dependen entre si, revisar si conviene unificar en `useReducer`.
- Evitar mutaciones directas (arrays/objetos); crear nuevas referencias.
- Si un valor no cambia el render, usar `useRef` en lugar de `useState`.

## Anti-patrones

- `const [state, setState] = useState<any>(...)`.
- Guardar en estado valores calculables en cada render.
- Actualizar con `setCount(count + 1)` en acciones concurrentes repetibles.
- Un unico objeto gigante para datos no relacionados.
- Logica de evento inline compleja dentro del JSX.

## Checklist rapida

- `useState` tipado.
- Naming claro (`value`, `setValue`).
- Handler para cambios por evento.
- Update funcional si depende de `prev`.
- Estado atomico por defecto.
