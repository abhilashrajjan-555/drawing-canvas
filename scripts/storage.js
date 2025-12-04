const BOARD_KEY = "kanban-board-state";
const THEME_KEY = "kanban-theme";

const safeLocalStorage = () => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export function loadBoardState() {
  const store = safeLocalStorage();
  if (!store) return null;
  const raw = store.getItem(BOARD_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveBoardState(state) {
  const store = safeLocalStorage();
  if (!store) return;
  try {
    store.setItem(BOARD_KEY, JSON.stringify(state));
  } catch {
    /* no-op */
  }
}

export function loadTheme() {
  const store = safeLocalStorage();
  if (!store) return null;
  return store.getItem(THEME_KEY);
}

export function saveTheme(theme) {
  const store = safeLocalStorage();
  if (!store) return;
  try {
    store.setItem(THEME_KEY, theme);
  } catch {
    /* no-op */
  }
}
