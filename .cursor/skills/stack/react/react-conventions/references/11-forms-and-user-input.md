# Forms and user input

## Cuando usar

- En formularios controlados y validacion de datos de entrada.
- Cuando la UI debe reaccionar en tiempo real al input del usuario.

## Cuando NO usar

- Para formularios extremadamente simples sin estado local.
- Para validacion de negocio compleja dispersa en multiples componentes.

## Reglas de estilo

- Inputs controlados por defecto (`value` + `onChange`).
- Crear handlers por campo o por dominio (`handleEmailChange`).
- Tipar eventos (`ChangeEvent`, `FormEvent`) en TypeScript.
- Validar en submit y mostrar errores cerca del campo.
- Usar guard clauses en submit (`if (!isValid) return`).

## Ejemplo correcto

```tsx
import { ChangeEvent, FormEvent, useState } from "react";

interface FormValues {
  email: string;
  password: string;
}

const LoginForm = () => {
  const [values, setValues] = useState<FormValues>({ email: "", password: "" });
  const [error, setError] = useState<string>("");

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) =>
    setValues((prev) => ({ ...prev, email: event.target.value }));

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) =>
    setValues((prev) => ({ ...prev, password: event.target.value }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!values.email || !values.password)
      return setError("Completa todos los campos");
    setError("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={values.email} onChange={handleEmailChange} />
      <input
        type="password"
        value={values.password}
        onChange={handlePasswordChange}
      />
      {error && <p>{error}</p>}
      <button type="submit">Entrar</button>
    </form>
  );
};

export default LoginForm;
```

## Anti-patrones

- Mezclar inputs controlados y no controlados sin motivo.
- Validar solo en backend cuando la UX requiere feedback inmediato.
- Logica de submit extensa inline en JSX.

## Checklist rapida

- Inputs controlados.
- Eventos tipados.
- Errores visibles y claros.
- Guard clauses en submit.
