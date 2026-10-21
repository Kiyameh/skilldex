# References with useRef

## Cuando usar

- Para acceder a nodos DOM (`focus`, `scroll`, `measure`).
- Para guardar valores mutables que no deben disparar render.
- Para persistir datos entre renders (ids de timer, flags internos).

## Cuando NO usar

- Para estado que debe reflejarse en UI (usar `useState`).
- Para reemplazar flujo reactivo con mutaciones silenciosas.
- Para compartir estado entre componentes (usar `props`, `context` o store).

## Reglas de estilo

- Tipar siempre la ref en TypeScript.
- Inicializar refs DOM con `null`.
- Naming claro por intencion: `inputRef`, `timeoutRef`, `previousValueRef`.
- Actualizar `.current` solo cuando aporta control imperativo o persistencia no reactiva.
- Si el cambio debe re-renderizar, no usar `useRef`.
- Combinar con guard clauses antes de usar `.current`.
- Para referencias al DOM, anadir null check siempre: `inputRef.current?.focus()`.

## Ejemplo correcto

```tsx
import { useEffect, useRef, useState } from "react";

interface Props {
  autoFocus?: boolean;
}

const SearchInput = ({ autoFocus = false }: Props) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previousQueryRef = useRef<string>("");
  const [query, setQuery] = useState<string>("");

  const handleChange = (value: string) => setQuery(value);

  useEffect(() => {
    if (!autoFocus) return;
    if (!inputRef.current) return;
    inputRef.current.focus();
  }, [autoFocus]);

  useEffect(() => {
    previousQueryRef.current = query;
  }, [query]);

  return (
    <section>
      <input
        ref={inputRef}
        value={query}
        onChange={(event) => handleChange(event.target.value)}
        placeholder="Buscar..."
      />
      <p>Anterior: {previousQueryRef.current || "-"}</p>
    </section>
  );
};

export default SearchInput;
```

## Anti-patrones

- Guardar en `useRef` datos que la UI necesita renderizar en tiempo real.
- No tipar refs (`useRef(null)` sin generico en TS cuando aplica).
- Encadenar logica de negocio alrededor de mutaciones en `.current`.
- Acceder a `.current` sin validar `null`.
- Usar refs para evitar dependencias que deberian declararse.

## Checklist rapida

- Ref tipada correctamente.
- Uso de ref justificado (DOM o valor mutable no reactivo).
- Guard clauses antes de acceder a `.current`.
- Sin uso de ref para estado visible en UI.
