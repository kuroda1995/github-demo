import { useEffect, useState } from "react";
import { loadCards, saveCards } from "../utils/storage";
import {
  cardsInColumn,
  makeId,
  moveCard as moveCardInList,
  nextOrder,
  sortColumnCards,
} from "../utils/cardUtils";

const SAVE_ERROR_MESSAGE =
  "データの保存に失敗しました。ブラウザの空き容量をご確認ください。";

export function useCards() {
  const [cards, setCards] = useState(() => loadCards());
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    try {
      saveCards(cards);
      setSaveError(null);
    } catch (e) {
      setSaveError(SAVE_ERROR_MESSAGE);
    }
  }, [cards]);

  function addCard(columnId, values) {
    const title = values.title.trim();
    if (!title) return;
    setCards((prev) => [
      ...prev,
      {
        id: makeId(),
        title,
        description: values.description.trim(),
        priority: values.priority || "medium",
        dueDate: values.dueDate || null,
        columnId,
        order: nextOrder(prev, columnId),
      },
    ]);
  }

  function updateCard(id, values) {
    const title = values.title.trim();
    if (!title) return;
    setCards((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              title,
              description: values.description.trim(),
              priority: values.priority || "medium",
              dueDate: values.dueDate || null,
            }
          : c
      )
    );
  }

  function deleteCard(id) {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }

  function moveCard(cardId, destColumnId, destIndex) {
    setCards((prev) => moveCardInList(prev, cardId, destColumnId, destIndex));
  }

  function sortColumn(columnId, sortKey) {
    setCards((prev) => sortColumnCards(prev, columnId, sortKey));
  }

  return {
    cards,
    cardsInColumn: (columnId) => cardsInColumn(cards, columnId),
    addCard,
    updateCard,
    deleteCard,
    moveCard,
    sortColumn,
    saveError,
  };
}
