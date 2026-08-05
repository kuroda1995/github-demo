import { PRIORITIES } from "../constants";

export function makeId() {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "card-" + Date.now() + "-" + Math.random().toString(16).slice(2);
}

export function cardsInColumn(cards, columnId) {
  return cards
    .filter((c) => c.columnId === columnId)
    .sort((a, b) => a.order - b.order);
}

export function nextOrder(cards, columnId) {
  const inColumn = cardsInColumn(cards, columnId);
  return inColumn.length === 0 ? 0 : inColumn[inColumn.length - 1].order + 1;
}

export function priorityRank(value) {
  const index = PRIORITIES.findIndex((p) => p.value === value);
  return index === -1 ? PRIORITIES.length : index;
}

export function priorityLabel(value) {
  const found = PRIORITIES.find((p) => p.value === value);
  return found ? found.label : "";
}

export function formatDueDate(dueDate) {
  if (!dueDate) return "";
  const [, month, day] = dueDate.split("-");
  return `期限: ${Number(month)}/${Number(day)}`;
}

/**
 * カードを移動先の列の指定位置(destIndex)に差し込み、影響を受けた列(移動先・移動元)の
 * order を 0,1,2... に振り直した新しい cards 配列を返す。
 */
export function moveCard(cards, cardId, destColumnId, destIndex) {
  const movingCard = cards.find((c) => c.id === cardId);
  if (!movingCard) return cards;
  const sourceColumnId = movingCard.columnId;

  const destSiblings = cardsInColumn(cards, destColumnId).filter((c) => c.id !== cardId);
  const clampedIndex = Math.max(0, Math.min(destIndex, destSiblings.length));
  destSiblings.splice(clampedIndex, 0, movingCard);

  const updatedById = new Map();
  destSiblings.forEach((c, index) => {
    updatedById.set(c.id, { ...c, columnId: destColumnId, order: index });
  });

  if (sourceColumnId !== destColumnId) {
    const remainingSource = cardsInColumn(cards, sourceColumnId).filter((c) => c.id !== cardId);
    remainingSource.forEach((c, index) => {
      updatedById.set(c.id, { ...c, order: index });
    });
  }

  return cards.map((c) => updatedById.get(c.id) || c);
}

/**
 * 指定した列のカードを sortKey ("priority" | "dueDate") で並び替え、
 * order を 0,1,2... に振り直した新しい cards 配列を返す。ボタンで押した瞬間だけの一回限りの操作。
 */
export function sortColumnCards(cards, columnId, sortKey) {
  const list = cardsInColumn(cards, columnId);
  const sorted = [...list].sort((a, b) => {
    if (sortKey === "priority") {
      return priorityRank(a.priority) - priorityRank(b.priority);
    }
    if (sortKey === "dueDate") {
      const aVal = a.dueDate || "9999-99-99";
      const bVal = b.dueDate || "9999-99-99";
      if (aVal < bVal) return -1;
      if (aVal > bVal) return 1;
      return 0;
    }
    return 0;
  });

  const orderById = new Map(sorted.map((c, index) => [c.id, index]));
  return cards.map((c) => (orderById.has(c.id) ? { ...c, order: orderById.get(c.id) } : c));
}
