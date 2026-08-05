import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { formatDueDate, priorityLabel } from "../utils/cardUtils";
import { CardForm } from "./CardForm";

export function Card({ card, columns, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id, disabled: isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style}>
        <CardForm
          initialTitle={card.title}
          initialDescription={card.description}
          initialPriority={card.priority}
          initialDueDate={card.dueDate || ""}
          initialColumnId={card.columnId}
          columns={columns}
          confirmLabel="保存"
          onConfirm={(values) => {
            onUpdate(card.id, values);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={"card" + (isDragging ? " dragging" : "")}
      {...attributes}
      {...listeners}
    >
      <div className="card-main" onClick={() => setIsEditing(true)}>
        <div className="card-badges">
          <span className={"card-priority priority-" + (card.priority || "medium")}>
            {priorityLabel(card.priority) || null}
          </span>
          <span className="card-due">{formatDueDate(card.dueDate) || null}</span>
        </div>
        <span className="card-title">{card.title}</span>
        <p className="card-description">{card.description || null}</p>
      </div>
      <button
        type="button"
        className="card-delete"
        title="削除"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(card.id);
        }}
      >
        ×
      </button>
    </div>
  );
}
