import { COLUMN_DEFS } from "./state.js";
import { DragManager } from "./drag-manager.js";

export class BoardView {
  constructor(container, boardState) {
    this.container = container;
    this.boardState = boardState;
    this.columnTemplate = document.getElementById("columnTemplate");
    this.cardTemplate = document.getElementById("cardTemplate");
    this.dialog = document.getElementById("cardDialog");
    this.form = document.getElementById("cardForm");
    this.formTitle = document.getElementById("cardFormTitle");
    this.textarea = document.getElementById("cardText");
    this.columnSelect = document.getElementById("cardColumn");
    this.saveButton = document.getElementById("cardSaveButton");
    this.editingCardId = null;

    this.populateColumnSelect();
    this.registerFormSubmit();

    this.dragManager = new DragManager(this.container, this.boardState);
    this.dialog.addEventListener("close", () => {
      this.form.reset();
      this.editingCardId = null;
    });
    this.unsubscribe = this.boardState.subscribe((state) => this.render(state));
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
  }

  populateColumnSelect() {
    this.columnSelect.innerHTML = "";
    COLUMN_DEFS.forEach((col) => {
      const option = document.createElement("option");
      option.value = col.id;
      option.textContent = col.title;
      this.columnSelect.append(option);
    });
  }

  registerFormSubmit() {
    this.form.addEventListener("submit", (event) => {
      event.preventDefault();
      const text = this.textarea.value.trim();
      const columnId = this.columnSelect.value;
      if (!text) return;

      if (this.editingCardId) {
        const current = this.boardState.findCard(this.editingCardId, true);
        if (!current) return;
        if (current.card.text !== text) {
          this.boardState.updateCard(this.editingCardId, text);
        }
        if (current.column.id !== columnId) {
          this.boardState.moveCard(this.editingCardId, columnId);
        }
      } else {
        this.boardState.addCard(columnId, text);
      }

      this.dialog.close();
    });
  }

  openDialog({ mode, columnId, text = "", cardId = null }) {
    this.editingCardId = cardId;
    this.formTitle.textContent = mode === "edit" ? "Edit Card" : "Add Card";
    this.columnSelect.value = columnId;
    this.textarea.value = text;
    this.dialog.showModal();
    requestAnimationFrame(() => this.textarea.focus());
  }

  render(state) {
    this.container.innerHTML = "";
    state.columns.forEach((column) => {
      const columnElement = this.createColumnElement(column);
      this.container.append(columnElement);
    });
  }

  createColumnElement(column) {
    const fragment = this.columnTemplate.content.cloneNode(true);
    const section = fragment.querySelector(".column");
    section.dataset.columnId = column.id;
    fragment.querySelector("h2").textContent = column.title;
    fragment.querySelector(
      ".card-count",
    ).textContent = `${column.cards.length} cards`;

    const addButton = fragment.querySelector(".add-card-button");
    addButton.addEventListener("click", () => {
      this.openDialog({ mode: "add", columnId: column.id });
    });

    const cardsContainer = fragment.querySelector(".cards");
    cardsContainer.classList.toggle("empty", column.cards.length === 0);

    column.cards.forEach((card, index) => {
      const cardElement = this.createCardElement(card, column.id);
      cardsContainer.append(cardElement);
    });

    return fragment;
  }

  createCardElement(card, columnId) {
    const fragment = this.cardTemplate.content.cloneNode(true);
    const cardElement = fragment.querySelector(".card");
    cardElement.dataset.cardId = card.id;
    fragment.querySelector(".card-body").textContent = card.text;

    const editButton = fragment.querySelector(".card-edit");
    editButton.addEventListener("click", () => {
      this.openDialog({
        mode: "edit",
        columnId,
        text: card.text,
        cardId: card.id,
      });
    });

    const deleteButton = fragment.querySelector(".card-delete");
    deleteButton.addEventListener("click", () => {
      const confirmed = window.confirm("Delete this card?");
      if (confirmed) {
        this.boardState.deleteCard(card.id);
      }
    });

    return fragment;
  }
}
