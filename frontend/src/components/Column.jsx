import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";
import { Card } from "./Card";
import { CardForm } from "./CardForm";
import { SortControls } from "./SortControls";

export function Column({ column, cards, onAddCard, onUpdateCard, onDeleteCard, onSort }) {
  const [isAdding, setIsAdding] = useState(false);
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const cardIds = cards.map((c) => c.id);

  return (
    <section ref={setNodeRef} className={"column" + (isOver ? " drag-over" : "")}>
      <div className="column-header">
        <span className="column-name">{column.name}</span>
        <span className="column-count">({cards.length})</span>
      </div>

      <SortControls onSort={(key) => onSort(column.id, key)} />

      <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
        <div className="card-list">
          {cards.length === 0 ? (
            <p className="empty-message">カードがありません</p>
          ) : (
            cards.map((card) => (
              <Card key={card.id} card={card} onUpdate={onUpdateCard} onDelete={onDeleteCard} />
            ))
          )}
        </div>
      </SortableContext>

      {isAdding ? (
        <CardForm
          confirmLabel="追加"
          onConfirm={(values) => {
            onAddCard(column.id, values);
            setIsAdding(false);
          }}
          onCancel={() => setIsAdding(false)}
        />
      ) : (
        <button type="button" className="add-card-button" onClick={() => setIsAdding(true)}>
          ＋ カードを追加
        </button>
      )}
    </section>
  );
}
