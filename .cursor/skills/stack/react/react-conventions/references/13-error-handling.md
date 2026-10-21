# Error handling

## Cuando usar

- Para manejar errores de red, validacion y fallos de render.
- Para definir experiencia de fallback consistente en la UI.

## Cuando NO usar

- Para ocultar errores sin trazabilidad.
- Para capturar todo en un `catch` generico sin contexto.

## Reglas de estilo

- Diferenciar errores esperados (negocio) de inesperados (tecnicos).
- Mostrar mensajes accionables al usuario, no errores crudos.
- Mantener errores en estado local cuando afectan solo al componente.
- Usar Error Boundary para fallos de render en subarboles.
- Limpiar error al reintentar para evitar UI stale.

## Ejemplo correcto

```tsx
import { useState } from "react";

const SaveProfileButton = () => {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/profile", { method: "POST" });
      if (!response.ok) throw new Error("Save failed");
    } catch (_error) {
      setError("No se pudo guardar. Intenta de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section>
      {error && <p>{error}</p>}
      <button disabled={isSaving} onClick={handleSave}>
        {isSaving ? "Guardando..." : "Guardar perfil"}
      </button>
    </section>
  );
};

export default SaveProfileButton;
```

## Anti-patrones

- `catch` vacio o solo `console.log` sin fallback.
- Mensajes tecnicos sin contexto para usuario final.
- No permitir reintentos despues de un error.

## Checklist rapida

- Error visible y accionable.
- Estado de error reseteado en reintento.
- Diferencia entre error esperado e inesperado.
- Fallback de UI definido.
