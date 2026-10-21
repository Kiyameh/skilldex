# Reducer patterns with useReducer

## Cuando usar

- Cuando el estado tiene multiples campos relacionados y varias transiciones.
- Cuando necesitas transiciones predecibles y centralizadas.
- Cuando quieres separar la logica de negocio del JSX del componente.

## Cuando NO usar

- Para estados simples de uno o dos valores (`useState` suele ser suficiente).
- Cuando no hay reglas de transicion claras entre estados.
- Para efectos secundarios dentro del reducer (deben vivir fuera).

## Modelo mental recomendado

- `state`: foto actual del estado.
- `action`: evento que describe que ocurrio.
- `reducer`: funcion pura que decide el siguiente estado.
- `dispatch`: mecanismo para enviar acciones.

## Reglas de estilo

- Tipar siempre `State`, `Action` y `Reducer` en TypeScript.
- Definir `Action` como union discriminada (`type` + `payload`).
- Usar `switch` con `default` exhaustivo (`never`) para seguridad de tipos.
- Mantener el reducer puro: sin `fetch`, sin `Date.now()`, sin mutaciones.
- Nombrar acciones como eventos de dominio (`'task/added'`, `'task/toggled'`).
- Crear handlers (`handleX`) para disparar `dispatch` desde eventos de UI.

## Ejemplo completo tipado

```tsx
import { FormEvent, useReducer, useState } from "react";

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

interface State {
  tasks: Task[];
  filter: "all" | "active" | "completed";
}

type Action =
  | { type: "task/added"; payload: { id: string; title: string } }
  | { type: "task/toggled"; payload: { id: string } }
  | { type: "filter/changed"; payload: { filter: State["filter"] } }
  | { type: "tasks/clearedCompleted" };

const initialState: State = {
  tasks: [],
  filter: "all",
};

const tasksReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "task/added":
      return {
        ...state,
        tasks: [
          ...state.tasks,
          {
            id: action.payload.id,
            title: action.payload.title,
            completed: false,
          },
        ],
      };

    case "task/toggled":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? { ...task, completed: !task.completed }
            : task
        ),
      };

    case "filter/changed":
      return { ...state, filter: action.payload.filter };

    case "tasks/clearedCompleted":
      return { ...state, tasks: state.tasks.filter((task) => !task.completed) };

    default: {
      const exhaustive: never = action;
      return state;
    }
  }
};

const TaskManager = () => {
  const [state, dispatch] = useReducer(tasksReducer, initialState);
  const [title, setTitle] = useState<string>("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    dispatch({
      type: "task/added",
      payload: { id: crypto.randomUUID(), title: title.trim() },
    });
    setTitle("");
  };

  const handleToggle = (id: string) =>
    dispatch({ type: "task/toggled", payload: { id } });

  const visibleTasks = state.tasks.filter((task) => {
    if (state.filter === "active") return !task.completed;
    if (state.filter === "completed") return task.completed;
    return true;
  });

  return (
    <section>
      <form onSubmit={handleSubmit}>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <button type="submit">Agregar</button>
      </form>

      <div>
        <button
          onClick={() =>
            dispatch({ type: "filter/changed", payload: { filter: "all" } })
          }
        >
          Todas
        </button>
        <button
          onClick={() =>
            dispatch({ type: "filter/changed", payload: { filter: "active" } })
          }
        >
          Activas
        </button>
        <button
          onClick={() =>
            dispatch({
              type: "filter/changed",
              payload: { filter: "completed" },
            })
          }
        >
          Completadas
        </button>
      </div>

      <ul>
        {visibleTasks.map((task) => (
          <li key={task.id}>
            <label>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggle(task.id)}
              />
              {task.title}
            </label>
          </li>
        ))}
      </ul>

      <button onClick={() => dispatch({ type: "tasks/clearedCompleted" })}>
        Limpiar completadas
      </button>
    </section>
  );
};

export default TaskManager;
```

## Anti-patrones

- Reducers que mutan estado (`push`, asignaciones directas, etc.).
- Acciones genericas sin semantica (`setData`, `updateEverything`).
- Meter llamadas async dentro del reducer.
- Reducer gigante sin separar por dominio cuando crece demasiado.

## Checklist rapida

- `State` y `Action` tipados.
- Union discriminada para acciones.
- Reducer puro e inmutable.
- `dispatch` solo desde handlers/eventos claros.
- `default` exhaustivo con `never`.
