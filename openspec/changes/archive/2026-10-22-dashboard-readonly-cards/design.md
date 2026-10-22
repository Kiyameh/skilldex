# Design

## Context

Catálogo tipado disponible vía contrato. Skills son primaria; dos secciones diferenciadas; Tailwind.

## Goals / Non-Goals

**Goals:**
- Secciones Skills (primera) y Rules
- Cards con metadatos habituales y estado
- Empty states

**Non-Goals:**
- Toggle/create/open funcionales (pueden existir placeholders deshabilitados, pero no son requisito)
- Diseño visual final / motion heavy
- Más metadatos de Skills (futuro)

## Decisions

- **Componentes:** `SkillsSection`, `RulesSection`, `SkillCard`, `RuleCard` (nombres orientativos).
- **Estado enabled:** indicador visual claro (texto o switch disabled visual-only).
- **A11y:** secciones con headings; cards como articles; contraste suficiente.
- **Datos:** al montar, enviar request de catálogo; renderizar payload.

## Risks / Trade-offs

- Cards demasiado “dashboard generico”: mantener composición simple, Skills primero.
- Mezclar mutaciones aquí rompería el slice; resistir scope creep.
