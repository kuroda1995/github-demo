import { request } from "./http";

export function getCards(filters = {}) {
  const params = new URLSearchParams();
  if (filters.keyword) params.set("keyword", filters.keyword);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.columnId) params.set("columnId", filters.columnId);
  const query = params.toString();
  return request(`/api/cards${query ? `?${query}` : ""}`);
}

export function getColumns() {
  return request("/api/columns");
}

export function createCard(card) {
  return request("/api/cards", { method: "POST", body: JSON.stringify(card) });
}

export function updateCard(id, card) {
  return request(`/api/cards/${id}`, { method: "PUT", body: JSON.stringify(card) });
}

export function deleteCard(id) {
  return request(`/api/cards/${id}`, { method: "DELETE" });
}
