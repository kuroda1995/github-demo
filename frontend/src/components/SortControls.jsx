export function SortControls({ onSort }) {
  return (
    <div className="sort-controls">
      <button
        type="button"
        className="sort-button"
        onClick={() => onSort("priority")}
      >
        優先度順
      </button>
      <button
        type="button"
        className="sort-button"
        onClick={() => onSort("dueDate")}
      >
        期限順
      </button>
    </div>
  );
}
