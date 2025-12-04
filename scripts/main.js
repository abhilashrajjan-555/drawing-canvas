import { BoardState } from "./state.js";
import { BoardView } from "./dom.js";
import { loadTheme, saveTheme } from "./storage.js";

const boardContainer = document.getElementById("board");
const themeToggle = document.getElementById("themeToggle");

const boardState = new BoardState();
new BoardView(boardContainer, boardState);

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const storedTheme = loadTheme();
let currentTheme = storedTheme ?? (prefersDark ? "dark" : "light");

const applyTheme = (theme) => {
  currentTheme = theme === "dark" ? "dark" : "light";
  if (currentTheme === "dark") {
    document.body.dataset.theme = "dark";
    themeToggle.textContent = "Light Theme";
    themeToggle.setAttribute("aria-pressed", "true");
  } else {
    delete document.body.dataset.theme;
    themeToggle.textContent = "Dark Theme";
    themeToggle.setAttribute("aria-pressed", "false");
  }
  saveTheme(currentTheme);
};

themeToggle.addEventListener("click", () => {
  applyTheme(currentTheme === "dark" ? "light" : "dark");
});

applyTheme(currentTheme);
