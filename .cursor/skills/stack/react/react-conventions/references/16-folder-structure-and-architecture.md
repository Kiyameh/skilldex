# Folder structure and architecture

## Cuando usar

- Al definir organizacion base para componentes, hooks y servicios.
- Al escalar codigo para multiples features y equipos.

## Reglas de estilo

- Un folder por componente por defecto.
- Un componente principal por archivo por defecto (`Component.tsx`).
- Co-localizar archivos cercanos: estilos, tests y tipos del componente.
- Organizar por feature cuando el dominio crece.
- Evitar carpetas `utils` genericas sin criterio de dominio.

## Ejemplo correcto

```text
features/
  auth/
    components/
      LoginForm/
        LoginForm.tsx
        LoginForm.test.tsx
        LoginForm.module.css
    hooks/
      useSession.ts
    services/
      auth-api.ts
```

## Anti-patrones

- Estructura por tipo en apps grandes sin separacion por feature.
- Archivos gigantes con multiples responsabilidades.
- Dependencias circulares entre carpetas de dominio.

## Checklist rapida

- Estructura entendible por feature.
- Co-localizacion de archivos relacionados.
- Limites de responsabilidad claros.
- Sin carpetas cajon de sastre.
