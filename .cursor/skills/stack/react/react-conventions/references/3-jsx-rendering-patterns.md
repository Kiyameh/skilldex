# JSX rendering patterns

## Cuando usar

- Al renderizar condicionales, listas y estados de carga/error.
- Para mantener JSX legible y facil de mantener.

## Cuando NO usar

- Cuando una condicion compleja debe extraerse a una funcion o variable descriptiva.
- Cuando el bloque JSX es tan grande que conviene dividir en subcomponentes.

## Reglas de estilo

- Priorizar clausulas de guarda antes del `return` principal.
- Usar `&&` para condicionales simples de una linea.
- Usar ternario solo si ambas ramas son cortas y claras.
- Renderizar listas con `key` estable (nunca `index` si hay cambios dinamicos).
- Evitar anidar ternarios y condiciones profundas en JSX.
- Extraer trozos repetidos a componentes pequenos.

## Ejemplo correcto

```tsx
interface Props {
  isLoading: boolean;
  error?: string;
  items: { id: string; label: string }[];
}

const ItemList = ({ isLoading, error, items }: Props) => {
  if (isLoading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;
  if (!items.length) return <p>Sin resultados</p>;

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.label}</li>
      ))}
    </ul>
  );
};

export default ItemList;
```

## Anti-patrones

- Ternarios anidados en JSX.
- `map` sin `key` estable.
- Condiciones largas directamente dentro del `return`.
- Usar `index` como `key` por defecto.

## Checklist rapida

- Guard clauses para loading/error/empty.
- Condicionales simples con `&&`.
- Ternarios solo en casos cortos.
- Listas con `key` estable.
