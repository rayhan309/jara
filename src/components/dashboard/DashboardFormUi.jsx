export function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

export function CardActions({ onEdit, onDelete, isDeleting, editLabel = "Edit", deleteLabel = "Delete" }) {
  return (
    <div className="mt-4 flex gap-2 border-t border-dash-border pt-3">
      <button
        type="button"
        onClick={onEdit}
        className="rounded-md flex flex-1 items-center justify-center gap-1.5 border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
      >
        {editLabel}
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={isDeleting}
        className="rounded-md flex flex-1 items-center justify-center gap-1.5 border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isDeleting ? "Deleting..." : deleteLabel}
      </button>
    </div>
  );
}
