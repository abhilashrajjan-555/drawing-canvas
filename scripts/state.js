import { loadBoardState, saveBoardState } from "./storage.js";

export const COLUMN_DEFS = [
  { id: "backlog", title: "Backlog" },
  { id: "progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

const createEmptyState = () => ({
  columns: COLUMN_DEFS.map((col) => ({ ...col, cards: [] })),
});

const normalizeState = (rawState) => {
  if (!rawState || !Array.isArray(rawState.columns)) {
    return createEmptyState();
  }

  const map = new Map(
    rawState.columns.map((col) => [col.id, { ...col, cards: col.cards ?? [] }]),
  );

  return {
    columns: COLUMN_DEFS.map((col) => {
      const existing = map.get(col.id);
      return existing
        ? { id: existing.id, title: col.title, cards: existing.cards }
        : { ...col, cards: [] };
    }),
  };
};

const cloneState = (state) => JSON.parse(JSON.stringify(state));

const generateId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `card-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export class BoardState {
  constructor() {
    this.state = normalizeState(loadBoardState());
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => this.listeners.delete(listener);
  }

  snapshot() {
    return cloneState(this.state);
  }

  persistAndNotify() {
    saveBoardState(this.state);
    const data = this.snapshot();
    this.listeners.forEach((listener) => listener(data));
  }

  getColumn(columnId) {
    return this.state.columns.find((col) => col.id === columnId);
  }

  addCard(columnId, text) {
    const column = this.getColumn(columnId);
    if (!column) return;
    column.cards.push({ id: generateId(), text });
    this.persistAndNotify();
  }

  updateCard(cardId, newText) {
    const card = this.findCard(cardId);
    if (!card) return;
    card.text = newText;
    this.persistAndNotify();
  }

  deleteCard(cardId) {
    for (const column of this.state.columns) {
      const index = column.cards.findIndex((card) => card.id === cardId);
      if (index > -1) {
        column.cards.splice(index, 1);
        this.persistAndNotify();
        return;
      }
    }
  }

  moveCard(cardId, targetColumnId, targetIndex = null) {
    const origin = this.findCard(cardId, true);
    const targetColumn = this.getColumn(targetColumnId);
    if (!origin || !targetColumn) return;

    const [card] = origin.column.cards.splice(origin.index, 1);
    const insertionIndex =
      targetIndex === null || targetIndex === undefined
        ? targetColumn.cards.length
        : Math.max(0, Math.min(targetColumn.cards.length, targetIndex));
    targetColumn.cards.splice(insertionIndex, 0, card);
    this.persistAndNotify();
  }

  findCard(cardId, includeMeta = false) {
    for (const column of this.state.columns) {
      const index = column.cards.findIndex((card) => card.id === cardId);
      if (index > -1) {
        if (includeMeta) {
          return { column, index, card: column.cards[index] };
        }
        return column.cards[index];
      }
    }
    return null;
  }
}
