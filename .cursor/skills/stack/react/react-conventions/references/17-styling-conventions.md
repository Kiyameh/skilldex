# Styling conventions

## Cuando usar

- Al definir reglas de estilos para componentes React.
- Para asegurar consistencia visual y mantenibilidad.

## Antes de usar

- Preguntar al usuario o consultar otros componentes del proyecto por el sistema de estilos.

## Reglas de estilo

- Co-localizar estilos con el componente cuando sea posible.
- Usar naming claro por componente (`.container`, `.title`, `.actions`).
- Evitar selectores globales y especificidad excesiva.
- Centralizar tokens de diseno (espaciado, color, tipografia).

## Ejemplo correcto

```tsx
import styles from "./Card.module.css";

interface Props {
  title: string;
}

const Card = ({ title }: Props) => (
  <article className={styles.container}>
    <h2 className={styles.title}>{title}</h2>
  </article>
);

export default Card;
```

## Anti-patrones

- Mezclar varios paradigmas de estilos en el mismo componente sin motivo.
- Usar `!important` como solucion habitual.
- Repetir valores magicos en multiples archivos.

## Checklist rapida

- Sistema de estilos consistente.
- Estilos co-localizados.
- Tokens reutilizables aplicados.
- Baja especificidad CSS.
