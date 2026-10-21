# Accessibility a11y

## Cuando usar

- Siempre en componentes interactivos o de contenido relevante.
- Al crear formularios, modales, menus, tabs y navegacion por teclado.

## Cuando NO usar

- Nunca omitir a11y por rapidez.
- Nunca usar `div` clickable si existe un elemento semantico nativo.

## Consultar

Buscar si existe una skill de accesibilidad dedicada.

## Reglas de estilo

- Usar HTML semantico primero (`button`, `label`, `nav`, `main`).
- Asociar `label` con `input` mediante `htmlFor` e `id`.
- Garantizar foco visible y orden de tab natural.
- Usar ARIA solo cuando semantica nativa no alcanza.
- Notificar cambios dinamicos relevantes (ej. `aria-live`).

## Ejemplo correcto

```tsx
import { FormEvent, useId, useState } from "react";

const NewsletterForm = () => {
  const inputId = useId();
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!email) return setMessage("Introduce un email");
    setMessage("Suscripcion completada");
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor={inputId}>Email</label>
      <input
        id={inputId}
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <button type="submit">Suscribirme</button>
      <p aria-live="polite">{message}</p>
    </form>
  );
};

export default NewsletterForm;
```

## Anti-patrones

- Click handlers en `div` sin roles ni teclado.
- Placeholders como unico sustituto de label.
- Ocultar foco con CSS sin alternativa.

## Checklist rapida

- Semantica HTML correcta.
- Labels asociadas.
- Navegacion por teclado funcional.
- Mensajes dinamicos accesibles.
