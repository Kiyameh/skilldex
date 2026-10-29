import { PencilIcon } from "./pencil-icon";

interface EditButtonProps {
  onClick: () => void;
}

const EDIT_LABEL = "Editar";

const CONTROL_BUTTON_CLASS =
  "inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-(--vscode-sideBarSectionHeader-border,#3c3c3c) px-1.5 py-0.5 text-xs transition-colors hover:bg-(--vscode-toolbar-hoverBackground,#ffffff14) focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-(--vscode-focusBorder,#007fd4)";

export function EditButton({ onClick }: EditButtonProps) {
  return (
    <button
      type="button"
      className={`${CONTROL_BUTTON_CLASS} opacity-0 focus-visible:opacity-90 group-hover:opacity-90 group-focus-within:opacity-90`}
      onClick={onClick}
    >
      <span>{EDIT_LABEL}</span>
      <PencilIcon />
    </button>
  );
}
