import { STORAGE_KEY } from "../constants";

export function loadCards() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    return [];
  }
}

export function saveCards(cards) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}
