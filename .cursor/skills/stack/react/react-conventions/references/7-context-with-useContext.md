# Context with useContext

## Cuando usar

- Para estado compartido por muchos componentes cercanos (tema, sesion, permisos, locale).
- Cuando quieres evitar prop drilling repetitivo en varias capas.

## Cuando NO usar

- Para estado local de una sola vista o componente.
- Para estado de alta frecuencia de actualizacion global (puede penalizar renders).
- Como reemplazo automático de toda gestion de estado compleja.

## La "trinidad del contexto".

1. **El Contexto**: `const MyContext = createContext(undefined)`;
2. **El Provider**: Un componente que envuelve a los hijos y maneja el estado.
3. **El Consumidor** (Hook personalizado): `useMyContext()`.

## Reglas de estilo

- Tipar siempre el contexto y su valor en TypeScript.
- Crear contexto + provider + hook de consumo (`useXContext`) por cada dominio.
- Validar uso del hook dentro del provider con error explicito `if (!context) throw new Error("...")`
- Mantener el valor del contexto pequeno y cohesionado.
- Dividir contextos por responsabilidad para limitar rerenders.
- Export default para el provider del dominio.

## Optimizacion de renders (memoizacion)

Cuando cambia el `value` de un Provider, se re-renderizan todos los consumidores de ese contexto.

Decision por defecto:

- Memorizar el `value` con `useMemo` para evitar cambios de referencia accidentales.
- Mantener el objeto `value` minimo y con dependencias reales.

```tsx
const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
```

## Uso del estado dentro del contexto:

Para manejar estados dentro del Provider seguir una de estas opciones:

- Opción A (Simple): Usar useState dentro del Provider. Ideal para temas (light/dark) o configuraciones simples.
- Opción B (Complejo): Usar useReducer. Es la mejor práctica cuando el contexto maneja lógica de negocio compleja (ej. un carrito de compras o autenticación).

## Ejemplo correcto

```tsx
import { createContext, ReactNode, useContext, useMemo, useState } from "react";

interface ThemeContextValue {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface Props {
  children: ReactNode;
}

const ThemeProvider = ({ children }: Props) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context)
    throw new Error("useThemeContext debe usarse dentro de ThemeProvider");
  return context;
};

export default ThemeProvider;
```

## Anti-patrones

- Contextos gigantes con datos no relacionados.
- Exponer setters crudos cuando conviene exponer acciones semanticas.
- Consumir `useContext` directamente en todo el arbol sin hook encapsulado.
- No validar `null` en el consumo del contexto.
- Pasar objetos/funciones nuevas en cada render del provider sin control.

## Checklist rapida

- Contexto tipado y cohesionado.
- Provider del dominio definido.
- Hook `useXContext` con validacion.
- Valor del provider estable y minimizado.
- Contexto dividido por responsabilidad.
