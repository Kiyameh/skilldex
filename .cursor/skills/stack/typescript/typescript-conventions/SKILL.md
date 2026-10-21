---
name: typescript-conventions
description: Convenciones de código y documentación de TypeScript
metadata:
  version: "1.0.0"
  domain: stack
  triggers: TypeScript, React, Astro,
---

# Convenciones de Código TypeScript

## Trigger

Usar cuando se va a escribir o editar código TypeScript: componentes, hooks, servicios, utils.

## Reference Guide

Lee configuración adicional según el contexto:

| Topic          | Reference                      | Load When                                                    |
| -------------- | ------------------------------ | ------------------------------------------------------------ |
| Advanced Types | `references/advanced-types.md` | Generics, conditional types, mapped types, template literals |
| Type Guards    | `references/type-guards.md`    | Type narrowing, discriminated unions, assertion functions    |
| Utility Types  | `references/utility-types.md`  | Partial, Pick, Omit, Record, custom utilities                |
| Configuration  | `references/tsconfig.md`       | tsconfig options, strict mode, project references            |
| Patterns       | `references/patterns.md`       | Builder pattern, factory pattern, type-safe APIs             |

## Formato de código

### Evitar llaves si es posible

```typescript
// ✅
if (condition) doSomething();

// ❌
if (condition) {
  doSomething();
}
```

### Parámetros de funciones

Preferir usar parámetros separados en vez de objeto.
Usar objeto si:

- Parametros evidentemente relacionados semanticamente
- Muchos parametros (más de 4)

```typescript
// ✅ Por defecto: parámetros separados
function calculate(amount: number, rate: number) {}

// ✅ Excepción: parametros relaciondos
function createUser({ name, email, age }: CreateUserParams) {}

// ✅ Excepción: muchos parametros
function build({ firstMeasure, secondMeasure, type, mode, elements }) {}
```

## Constrains

✅ MUST DO

- Usar modo `strict`
- Usar el operador `satisfies` para type validation cuando sea necesario
- Usa _discriminated unions_ para state machines o error handling
- Generar archivos de declaración para las librerias
- No tipar cuando la inferencia es automática y evidente
- importar tipos con `type`
- Preferir `interface` frente a `type` para objetos
- Prefeerir `type`para uniones y tipos complejos
- Usar `const asertions` para tipos literales
- Usar una solución sencilla frente a un tipado complejo, si es posible

❌ MUST NOT DO

- Usar `any` explicito sin jutificación
- Usar assertions `as` sin justificación
- Mezclar imports de tipos y valores
- Usar enums (preferir objetos const)
- Circular type references

## Code examples de patrones habituales

### Discriminated unions for mutually exclusive states

Usar para:

```typescript
// Good: only valid combinations possible
type RequestState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };

// Bad: allows invalid combinations like { loading: true, error: Error }
type RequestState<T> = {
  loading: boolean;
  data?: T;
  error?: Error;
};
```

### Branded types

- Usar para: Critical domain primitives, API boundaries, currency/units

```typescript
// Branded type for domain modeling
type Brand<T, B extends string> = T & { readonly __brand: B };
type UserId = Brand<string, "UserId">;
type OrderId = Brand<number, "OrderId">;

const toUserId = (id: string): UserId => id as UserId;
const toOrderId = (id: number): OrderId => id as OrderId;

// Usage — prevents accidental id mix-ups at compile time
function getOrder(userId: UserId, orderId: OrderId) {
  /* ... */
}
```

### Const assertions

- Usar en: Cualquier caso en el que se usaría un enum

```typescript
const ROLES = ["admin", "user", "guest"] as const;
type Role = (typeof ROLES)[number]; // 'admin' | 'user' | 'guest'

// Array and type stay in sync automatically
function isValidRole(role: string): role is Role {
  return ROLES.includes(role as Role);
}
```

### Exhaustive switch

- Usar para: Evitar que un switch caiga en un default.

```typescript
type Status = "active" | "inactive";

function processStatus(status: Status): string {
  switch (status) {
    case "active":
      return "processing";
    case "inactive":
      return "skipped";
    default: {
      const _exhaustive: never = status;
      throw new Error(`unhandled status: ${_exhaustive}`);
    }
  }
}
```
