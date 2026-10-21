# Side effects with useEffect

## Cuando usar

- Para sincronizar el componente con sistemas externos (API, timers, listeners, storage).
- Cuando necesitas ejecutar cleanup al desmontar o al cambiar dependencias.

## Cuando NO usar

- Para transformar datos que pueden calcularse durante el render.
- Para manejar eventos de usuario directos (usar handlers).
- Para inicializar estado derivado de props en cada render.

## Reglas de estilo

- Priorizar React moderno: primero intentar resolver sin `useEffect`.
- Mantener un solo objetivo por efecto (un efecto = una responsabilidad).
- Incluir todas las dependencias reales del efecto.
- Declarar funciones usadas solo por el efecto dentro del propio `useEffect`.
- Implementar cleanup siempre que haya suscripciones, timers o tareas cancelables.
- Usar guard clauses al inicio del efecto para cortar casos invalidos.

## Ejemplo correcto

```tsx
import { useEffect, useState } from "react";

interface Props {
  userId?: string;
}

const UserProfile = ({ userId }: Props) => {
  const [name, setName] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!userId) return;

    const controller = new AbortController();

    const loadUser = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Error cargando usuario");
        const data: { name: string } = await response.json();
        setName(data.name);
      } catch (_error) {
        if (controller.signal.aborted) return;
        setError("No se pudo cargar el usuario");
      }
    };

    loadUser();
    return () => controller.abort();
  }, [userId]);

  if (error) return <p>{error}</p>;
  if (!userId) return <p>Selecciona un usuario</p>;

  return <p>{name || "Cargando..."}</p>;
};

export default UserProfile;
```

## Anti-patrones

- `useEffect` para logica que puede vivir en render o en un handler.
- Efectos enormes con multiples responsabilidades.
- Omitir dependencias para "forzar" comportamiento.
- No limpiar listeners/timers/peticiones, provocando fugas.
- Hacer `setState` en bucle por dependencias mal definidas.

## Checklist rapida

- El efecto sincroniza algo externo.
- Dependencias completas y correctas.
- Guard clauses para casos no validos.
- Cleanup implementado si aplica.
- Sin logica de evento dentro del efecto.
