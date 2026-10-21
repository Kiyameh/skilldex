# Components basics

## Cuando usar

- Al crear componentes funcionales de UI en React con TypeScript.
- Como base por defecto antes de aplicar patrones mas avanzados.

## Cuando NO usar

- En utilidades puras sin render de React.
- Cuando el comportamiento requiere un hook compartido en vez de un componente.

## Reglas de estilo

- Usar funcion flecha por defecto.
- Definir `interface Props` por defecto.
- Recibir props con destructuring en la firma.
- Priorizar `export default`.
- Un componente por archivo por defecto.
- Un folder por componente por defecto (`ComponentName/ComponentName.tsx`).
- Preferir clausulas de guarda para cortar pronto.
- Evitar `{}` o `()` en `if` y `return` de una sola linea.

## Ejemplo correcto

```tsx
interface Props {
  title: string;
  subtitle?: string;
}

const CardHeader = ({ title, subtitle }: Props) => {
  if (!title) return null;

  return (
    <header>
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </header>
  );
};

export default CardHeader;
```

## Anti-patrones

- Usar `function Component()` como estilo base si el equipo acordo flechas.
- Usar `props.title` en todo el componente en vez de destructuring.
- Mezclar varios componentes no relacionados en el mismo archivo.
- Añadir wrappers innecesarios en JSX.

## Checklist rapida

- `interface Props` definida.
- Props destructuradas en la firma.
- Guard clauses antes del `return` principal.
- `export default` aplicado.
- Un solo componente por archivo.
