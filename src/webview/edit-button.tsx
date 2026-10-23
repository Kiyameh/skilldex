import { PencilIcon } from "./pencil-icon";

interface EditButtonProps {
  onClick: () => void;
}

const EDIT_LABEL = "Editar";

const CONTROL_BUTTON_CLASS =
  "inline-flex shrink-0 items-center gap-1.5 rounded text-xs focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-(--vscode-focusBorder,#007fd4)";

export function EditButton({ onClick }: EditButtonProps) {
  return (
    <button
      type="button"
      className={`${CONTROL_BUTTON_CLASS} opacity-0 focus-visible:opacity-90 group-hover:opacity-90 group-focus-within:opacity-90`}
      onClick={onClick}
    >
      <PencilIcon />
      <span>{EDIT_LABEL}</span>
    </button>
  );
}
