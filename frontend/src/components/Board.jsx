import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useState } from "react";
import { useCards } from "../hooks/useCards";
import { formatDueDate, priorityLabel } from "../utils/cardUtils";
import { Column } from "./Column";
import { ErrorBanner } from "./ErrorBanner";

export function Board() {
  const {
    cards,
    columns,
    isLoading,
    error,
    cardsInColumn,
    addCard,
    updateCard,
    deleteCard,
    moveCard,
    sortColumn,
  } = useCards();
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const activeCard = activeId ? cards.find((c) => c.id === activeId) : null;

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeCardData = cards.find((c) => c.id === active.id);
    if (!activeCardData) return;

    const isColumnTarget = columns.some((c) => c.id === over.id);
    const destColumnId = isColumnTarget
      ? over.id
      : cards.find((c) => c.id === over.id)?.columnId;
    if (!destColumnId) return;

    const destSiblings = cardsInColumn(destColumnId).filter((c) => c.id !== active.id);
    const overIndex = destSiblings.findIndex((c) => c.id === over.id);

    let destIndex;
    if (isColumnTarget || overIndex === -1) {
      // 列自体（空きスペース）に落とした場合は一番下に入れる
      destIndex = destSiblings.length;
    } else {
      // カードの上半分に落としたら「その前」、下半分に落としたら「その後」に入れる
      const activeRect = active.rect.current.translated;
      const overRect = over.rect;
      const droppedBelowCenter =
        activeRect && overRect
          ? activeRect.top + activeRect.height / 2 > overRect.top + overRect.height / 2
          : false;
      destIndex = droppedBelowCenter ? overIndex + 1 : overIndex;
    }

    moveCard(active.id, destColumnId, destIndex);
  }

  if (isLoading) {
    return <p className="board-status">読み込み中...</p>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <ErrorBanner message={error} />
      <main className="board">
        {columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            cards={cardsInColumn(column.id)}
            onAddCard={addCard}
            onUpdateCard={updateCard}
            onDeleteCard={deleteCard}
            onSort={sortColumn}
          />
        ))}
      </main>
      <DragOverlay>
        {activeCard ? (
          <div className="card card-overlay">
            <div className="card-main">
              <div className="card-badges">
                <span className={"card-priority priority-" + (activeCard.priority || "medium")}>
                  {priorityLabel(activeCard.priority) || null}
                </span>
                <span className="card-due">{formatDueDate(activeCard.dueDate) || null}</span>
              </div>
              <span className="card-title">{activeCard.title}</span>
              <p className="card-description">{activeCard.description || null}</p>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
