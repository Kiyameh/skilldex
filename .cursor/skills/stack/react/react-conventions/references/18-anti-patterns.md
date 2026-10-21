# Anti patterns

## Cuando usar

- Como lista de verificacion final antes de merge.
- Para detectar problemas comunes de calidad en React.

## Cuando NO usar

- Como sustituto de guias especificas por tema.
- Para justificar reglas sin contexto tecnico.

## Reglas de estilo

- Tratar cada anti-patron como senal de revision.
- Proponer alternativa concreta junto al anti-patron.
- Priorizar impacto en mantenibilidad, rendimiento y UX.

## Ejemplo correcto

```tsx
// ❌ Anti-patron: estado derivado duplicado
const [fullName, setFullName] = useState<string>("");
useEffect(() => setFullName(`${name} ${lastName}`), [name, lastName]);

// ✅ Alternativa: calcular durante render
const fullName = `${name} ${lastName}`;
```

## Anti-patrones

- Guardar estado derivado que puede calcularse en render.
- Abusar de `useEffect` para logica no externa.
- Pasar objetos/funciones inestables como props sin necesidad.
- Componentes gigantes sin separacion por responsabilidades.
- Falta de semantica HTML y tests de comportamiento.

## Checklist rapida

- No hay estado derivado duplicado.
- Efectos solo para sincronizacion externa.
- Props y handlers estables cuando importa rendimiento.
- Componente pequeno y cohesionado por dominio.
