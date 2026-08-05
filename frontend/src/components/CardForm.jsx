import { useRef, useState } from "react";
import { PRIORITIES } from "../constants";

export function CardForm({
  initialTitle = "",
  initialDescription = "",
  initialPriority = "medium",
  initialDueDate = "",
  confirmLabel,
  onConfirm,
  onCancel,
}) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [priority, setPriority] = useState(initialPriority);
  const [dueDate, setDueDate] = useState(initialDueDate || "");
  const titleInputRef = useRef(null);

  function submit() {
    if (!title.trim()) {
      titleInputRef.current?.focus();
      return;
    }
    onConfirm({
      title,
      description,
      priority,
      dueDate: dueDate || null,
    });
  }

  return (
    <div className="card-form">
      <input
        ref={titleInputRef}
        type="text"
        className="cf-title"
        placeholder="タイトル（必須）"
        value={title}
        autoFocus
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          } else if (e.key === "Escape") {
            onCancel();
          }
        }}
      />

      <textarea
        className="cf-description"
        rows={2}
        placeholder="説明文（任意）"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            onCancel();
          }
        }}
      />

      <div className="cf-row">
        <select
          className="cf-priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          {PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>
              {"優先度: " + p.label}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="cf-due"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <div className="cf-actions">
        <button type="button" className="cf-confirm" onClick={submit}>
          {confirmLabel}
        </button>
        <button type="button" className="cf-cancel" onClick={onCancel}>
          キャンセル
        </button>
      </div>
    </div>
  );
}
