# Performance memoization

## Cuando usar

- Cuando hay rerenders frecuentes y medibles en componentes costosos.
- Cuando una computacion es cara y depende de un conjunto claro de dependencias.
- Cuando una callback estable evita rerenders en hijos memorizados.

## Cuando NO usar

- Como optimizacion preventiva sin evidencia de problema.
- En componentes pequenos donde el costo de memoizar supera el beneficio.
- Para "ocultar" arquitectura deficiente o props inestables.

## Reglas de estilo

- Medir primero (React DevTools Profiler) y optimizar despues.
- `useMemo` para valores/computaciones; `useCallback` para funciones.
- `memo` solo en componentes puros con props estables.
- Mantener dependencias completas y explicitas.
- Evitar cadenas de memoizacion innecesarias.
- Preferir simplificar estado/props antes que apilar memoizacion.

## Ejemplo correcto

```tsx
import { memo, useCallback, useMemo, useState } from "react";

interface Row {
  id: string;
  name: string;
}

interface TableProps {
  rows: Row[];
  onSelect: (id: string) => void;
}

const Table = memo(({ rows, onSelect }: TableProps) => (
  <ul>
    {rows.map((row) => (
      <li key={row.id}>
        <button onClick={() => onSelect(row.id)}>{row.name}</button>
      </li>
    ))}
  </ul>
));

const UsersPanel = ({ rows }: { rows: Row[] }) => {
  const [query, setQuery] = useState<string>("");

  const filteredRows = useMemo(
    () =>
      rows.filter((row) =>
        row.name.toLowerCase().includes(query.toLowerCase())
      ),
    [rows, query]
  );

  const handleSelect = useCallback((id: string) => {
    console.log("Selected", id);
  }, []);

  return (
    <section>
      <input value={query} onChange={(event) => setQuery(event.target.value)} />
      <Table rows={filteredRows} onSelect={handleSelect} />
    </section>
  );
};

export default UsersPanel;
```

## Anti-patrones

- Envolver todo en `memo`, `useMemo` y `useCallback` sin necesidad.
- Dependencias incompletas para "forzar" estabilidad.
- Memorizar valores triviales o de bajo costo.
- Crear objetos inline como props en cada render y esperar que `memo` funcione.
- Asumir mejora de rendimiento sin medir antes/despues.

## Checklist rapida

- Problema de rendimiento identificado y medido.
- Hook de memoizacion elegido segun objetivo correcto.
- Dependencias declaradas correctamente.
- Codigo sigue legible y mantenible.
