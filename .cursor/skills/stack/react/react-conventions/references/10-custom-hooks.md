# Custom hooks

## Cuando usar

- Cuando una logica de estado o efectos se repite entre componentes.
- Cuando quieres separar logica de UI para mejorar legibilidad y testing.

## Cuando NO usar

- Para logica usada por un solo componente y muy pequena.
- Para ocultar reglas de negocio sin una API clara.

## Reglas de estilo

- Nombrar siempre con prefijo `use`.
- Tipar parametros y retorno en TypeScript.
- Devolver una API pequena y estable (objeto o tupla, no ambos).
- Mantener handlers dentro del hook si pertenecen a su dominio.
- Evitar exponer estado interno irrelevante.

## Ejemplo correcto

```tsx
import { useMemo, useState } from "react";

interface UsePaginationOptions {
  initialPage?: number;
  pageSize?: number;
}

interface UsePaginationResult<T> {
  page: number;
  pageSize: number;
  totalPages: number;
  currentItems: T[];
  goToNextPage: () => void;
  goToPrevPage: () => void;
}

const usePagination = <T,>(
  items: T[],
  options: UsePaginationOptions = {}
): UsePaginationResult<T> => {
  const { initialPage = 1, pageSize = 10 } = options;
  const [page, setPage] = useState<number>(initialPage);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  const currentItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const goToNextPage = () =>
    setPage((prev) => (prev < totalPages ? prev + 1 : prev));
  const goToPrevPage = () => setPage((prev) => (prev > 1 ? prev - 1 : prev));

  return {
    page,
    pageSize,
    totalPages,
    currentItems,
    goToNextPage,
    goToPrevPage,
  };
};

export default usePagination;
```

## Anti-patrones

- Hooks con demasiadas responsabilidades.
- Hooks que retornan objetos gigantes y poco cohesionados.
- Llamar hooks condicionalmente dentro del custom hook.

## Checklist rapida

- Nombre `useX`.
- API tipada y pequena.
- Responsabilidad unica.
- Reutilizable en mas de un componente.
