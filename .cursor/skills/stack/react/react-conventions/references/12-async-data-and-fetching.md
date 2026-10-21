# Async data and fetching

## Cuando usar

- Para cargar datos remotos y reflejar estados de carga/error/success.
- Cuando una vista depende de informacion externa.

## Cuando NO usar

- Para datos estaticos o ya disponibles en props.
- Para duplicar fetches que ya resuelve una capa de cache global.

## Reglas de estilo

- Modelar estado asincrono minimo: `isLoading`, `error`, `data`.
- Cancelar peticiones al desmontar (`AbortController`) cuando aplique.
- Usar guard clauses para parametros invalidos antes de pedir datos.
- Tipar respuesta esperada en TypeScript.
- Evitar `fetch` duplicado por dependencias incorrectas en `useEffect`.

## Ejemplo correcto

```tsx
import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
}

const UsersView = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const controller = new AbortController();

    const loadUsers = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch("/api/users", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Request failed");
        const data: User[] = await response.json();
        setUsers(data);
      } catch (_error) {
        if (controller.signal.aborted) return;
        setError("No se pudieron cargar los usuarios");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    loadUsers();
    return () => controller.abort();
  }, []);

  if (isLoading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;
  if (!users.length) return <p>Sin datos</p>;

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};

export default UsersView;
```

## Anti-patrones

- No manejar estados de loading y error.
- Ignorar cancelacion en requests de larga vida.
- Mutar data existente en vez de reemplazar estado de forma inmutable.

## Checklist rapida

- Estados async claros.
- Respuesta tipada.
- Cleanup de request cuando aplica.
- Guard clauses para estados de UI.
