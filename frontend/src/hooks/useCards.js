import { useCallback, useEffect, useState } from "react";
import * as cardsApi from "../api/cardsApi";
import {
  cardsInColumn,
  moveCard as moveCardInList,
  nextOrder,
  sortColumnCards,
} from "../utils/cardUtils";

const LOAD_ERROR_MESSAGE =
  "データの取得に失敗しました。バックエンドが起動しているかご確認ください。";
const SAVE_ERROR_MESSAGE = "データの保存に失敗しました。もう一度お試しください。";

function toCardRequest(card) {
  return {
    title: card.title,
    description: card.description,
    priority: card.priority,
    dueDate: card.dueDate,
    columnId: card.columnId,
    order: card.order,
  };
}

export function useCards() {
  const [cards, setCards] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [cardsData, columnsData] = await Promise.all([
        cardsApi.getCards(),
        cardsApi.getColumns(),
      ]);
      setCards(cardsData);
      setColumns(columnsData);
      setError(null);
    } catch (e) {
      setError(LOAD_ERROR_MESSAGE);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const searchCards = useCallback(async (filters) => {
    try {
      const result = await cardsApi.getCards(filters);
      setCards(result);
      setIsSearching(Boolean(filters.keyword || filters.priority || filters.columnId));
      setError(null);
    } catch (e) {
      setError(LOAD_ERROR_MESSAGE);
    }
  }, []);

  async function addCard(columnId, values) {
    const title = values.title.trim();
    if (!title) return;
    try {
      const saved = await cardsApi.createCard({
        title,
        description: values.description.trim(),
        priority: values.priority || "medium",
        dueDate: values.dueDate || null,
        columnId,
        order: nextOrder(cards, columnId),
      });
      setCards((prev) => [...prev, saved]);
      setError(null);
    } catch (e) {
      setError(SAVE_ERROR_MESSAGE);
    }
  }

  async function updateCard(id, values) {
    const title = values.title.trim();
    if (!title) return;
    const current = cards.find((c) => c.id === id);
    if (!current) return;
    try {
      const saved = await cardsApi.updateCard(
        id,
        toCardRequest({
          ...current,
          title,
          description: values.description.trim(),
          priority: values.priority || "medium",
          dueDate: values.dueDate || null,
        })
      );
      setCards((prev) => prev.map((c) => (c.id === id ? saved : c)));
      setError(null);
    } catch (e) {
      setError(SAVE_ERROR_MESSAGE);
    }
  }

  async function deleteCard(id) {
    try {
      await cardsApi.deleteCard(id);
      setCards((prev) => prev.filter((c) => c.id !== id));
      setError(null);
    } catch (e) {
      setError(SAVE_ERROR_MESSAGE);
    }
  }

  async function persistReorderedCards(nextCards, previousCards) {
    const changed = nextCards.filter((next) => {
      const prev = previousCards.find((c) => c.id === next.id);
      return prev && (prev.order !== next.order || prev.columnId !== next.columnId);
    });
    await Promise.all(changed.map((c) => cardsApi.updateCard(c.id, toCardRequest(c))));
  }

  async function moveCard(cardId, destColumnId, destIndex) {
    const previous = cards;
    const nextCards = moveCardInList(cards, cardId, destColumnId, destIndex);
    setCards(nextCards);
    try {
      await persistReorderedCards(nextCards, previous);
      setError(null);
    } catch (e) {
      setError(SAVE_ERROR_MESSAGE);
      loadAll();
    }
  }

  async function sortColumn(columnId, sortKey) {
    const previous = cards;
    const nextCards = sortColumnCards(cards, columnId, sortKey);
    setCards(nextCards);
    try {
      await persistReorderedCards(nextCards, previous);
      setError(null);
    } catch (e) {
      setError(SAVE_ERROR_MESSAGE);
      loadAll();
    }
  }

  return {
    cards,
    columns,
    isLoading,
    isSearching,
    error,
    cardsInColumn: (columnId) => cardsInColumn(cards, columnId),
    addCard,
    updateCard,
    deleteCard,
    moveCard,
    sortColumn,
    searchCards,
  };
}
