export class DragManager {
  constructor(container, state) {
    this.container = container;
    this.state = state;
    this.draggedId = null;
    this.bindEvents();
  }

  bindEvents() {
    this.container.addEventListener("dragstart", (event) =>
      this.onDragStart(event),
    );
    this.container.addEventListener("dragend", () => this.onDragEnd());
    this.container.addEventListener("dragover", (event) =>
      this.onDragOver(event),
    );
    this.container.addEventListener("drop", (event) => this.onDrop(event));
    this.container.addEventListener("dragenter", (event) =>
      this.onDragEnter(event),
    );
    this.container.addEventListener("dragleave", (event) =>
      this.onDragLeave(event),
    );
  }

  onDragStart(event) {
    const card = event.target.closest(".card");
    if (!card) return;
    this.draggedId = card.dataset.cardId;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", this.draggedId);
    requestAnimationFrame(() => card.classList.add("dragging"));
  }

  onDragEnd() {
    const dragging = this.container.querySelector(".card.dragging");
    if (dragging) dragging.classList.remove("dragging");
    this.draggedId = null;
    this.clearDropTargets();
  }

  onDragEnter(event) {
    const column = event.target.closest(".column");
    if (!column || !this.draggedId) return;
    column.classList.add("drop-target");
  }

  onDragLeave(event) {
    const column = event.target.closest(".column");
    if (!column || !this.draggedId) return;
    if (!column.contains(event.relatedTarget)) {
      column.classList.remove("drop-target");
    }
  }

  onDragOver(event) {
    if (!this.draggedId) return;
    const column = event.target.closest(".column");
    if (!column) return;
    event.preventDefault();
    column.classList.add("drop-target");
  }

  onDrop(event) {
    if (!this.draggedId) return;
    const column = event.target.closest(".column");
    if (!column) return;
    event.preventDefault();

    const columnId = column.dataset.columnId;
    const cardsContainer = column.querySelector(".cards");
    const index = this.calculateDropIndex(cardsContainer, event.clientY);
    this.state.moveCard(this.draggedId, columnId, index);
    this.onDragEnd();
  }

  calculateDropIndex(container, pointerY) {
    const cards = Array.from(container.querySelectorAll(".card")).filter(
      (card) => card.dataset.cardId !== this.draggedId,
    );

    for (let i = 0; i < cards.length; i += 1) {
      const rect = cards[i].getBoundingClientRect();
      if (pointerY < rect.top + rect.height / 2) {
        return i;
      }
    }
    return cards.length;
  }

  clearDropTargets() {
    this.container
      .querySelectorAll(".column.drop-target")
      .forEach((col) => col.classList.remove("drop-target"));
  }
}
