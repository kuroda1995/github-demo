(function () {
  "use strict";

  const STORAGE_KEY = "task-board-mock:cards";

  const COLUMNS = [
    { id: "todo", name: "未着手" },
    { id: "doing", name: "進行中" },
    { id: "done", name: "完了" },
  ];

  const PRIORITIES = [
    { value: "high", label: "高" },
    { value: "medium", label: "中" },
    { value: "low", label: "低" },
  ];

  /** @type {{id: string, title: string, description: string, priority: string, dueDate: string|null, columnId: string, order: number}[]} */
  let cards = [];

  const boardEl = document.getElementById("board");
  const cardTemplate = document.getElementById("card-template");
  const errorBanner = document.getElementById("error-banner");

  function showError(message) {
    errorBanner.textContent = message;
    errorBanner.classList.add("visible");
  }

  function clearError() {
    errorBanner.classList.remove("visible");
  }

  function loadCards() {
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

  function saveCards() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
      clearError();
    } catch (e) {
      showError("データの保存に失敗しました。ブラウザの空き容量をご確認ください。");
    }
  }

  function makeId() {
    if (window.crypto && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return "card-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  }

  function cardsInColumn(columnId) {
    return cards
      .filter((c) => c.columnId === columnId)
      .sort((a, b) => a.order - b.order);
  }

  function nextOrder(columnId) {
    const inColumn = cardsInColumn(columnId);
    return inColumn.length === 0 ? 0 : inColumn[inColumn.length - 1].order + 1;
  }

  function priorityLabel(value) {
    const found = PRIORITIES.find((p) => p.value === value);
    return found ? found.label : "";
  }

  function formatDueDate(dueDate) {
    if (!dueDate) return "";
    const [, month, day] = dueDate.split("-");
    return `期限: ${Number(month)}/${Number(day)}`;
  }

  function addCard(columnId, values) {
    const title = values.title.trim();
    if (!title) return;
    cards.push({
      id: makeId(),
      title,
      description: values.description.trim(),
      priority: values.priority || "medium",
      dueDate: values.dueDate || null,
      columnId,
      order: nextOrder(columnId),
    });
    saveCards();
    render();
  }

  function updateCard(id, values) {
    const title = values.title.trim();
    if (!title) return;
    const card = cards.find((c) => c.id === id);
    if (!card) return;
    card.title = title;
    card.description = values.description.trim();
    card.priority = values.priority || "medium";
    card.dueDate = values.dueDate || null;
    saveCards();
    render();
  }

  function deleteCard(id) {
    cards = cards.filter((c) => c.id !== id);
    saveCards();
    render();
  }

  function moveCard(id, targetColumnId) {
    const card = cards.find((c) => c.id === id);
    if (!card) return;
    card.columnId = targetColumnId;
    card.order = nextOrder(targetColumnId);
    saveCards();
    render();
  }

  /**
   * タイトル・説明文・優先度・期限をまとめて入力/編集するフォームを作る。
   * 追加(add-card)・編集(card click)の両方から共通で使う。
   */
  function buildCardForm(options) {
    const {
      title = "",
      description = "",
      priority = "medium",
      dueDate = "",
      confirmLabel,
      onConfirm,
      onCancel,
    } = options;

    const form = document.createElement("div");
    form.className = "card-form";

    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.className = "cf-title";
    titleInput.placeholder = "タイトル（必須）";
    titleInput.value = title;

    const descInput = document.createElement("textarea");
    descInput.className = "cf-description";
    descInput.rows = 2;
    descInput.placeholder = "説明文（任意）";
    descInput.value = description;

    const row = document.createElement("div");
    row.className = "cf-row";

    const prioritySelect = document.createElement("select");
    prioritySelect.className = "cf-priority";
    PRIORITIES.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.value;
      opt.textContent = "優先度: " + p.label;
      if (p.value === priority) opt.selected = true;
      prioritySelect.appendChild(opt);
    });

    const dueInput = document.createElement("input");
    dueInput.type = "date";
    dueInput.className = "cf-due";
    dueInput.value = dueDate || "";

    row.appendChild(prioritySelect);
    row.appendChild(dueInput);

    const actions = document.createElement("div");
    actions.className = "cf-actions";

    const confirmBtn = document.createElement("button");
    confirmBtn.type = "button";
    confirmBtn.className = "cf-confirm";
    confirmBtn.textContent = confirmLabel;

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "cf-cancel";
    cancelBtn.textContent = "キャンセル";

    actions.appendChild(confirmBtn);
    actions.appendChild(cancelBtn);

    form.appendChild(titleInput);
    form.appendChild(descInput);
    form.appendChild(row);
    form.appendChild(actions);

    function submit() {
      if (!titleInput.value.trim()) {
        titleInput.focus();
        return;
      }
      onConfirm({
        title: titleInput.value,
        description: descInput.value,
        priority: prioritySelect.value,
        dueDate: dueInput.value || null,
      });
    }

    confirmBtn.addEventListener("click", submit);
    cancelBtn.addEventListener("click", onCancel);
    titleInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submit();
      } else if (e.key === "Escape") {
        onCancel();
      }
    });
    descInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        onCancel();
      }
    });

    return { form, focusTitle: () => titleInput.focus() };
  }

  function buildCardElement(card) {
    const node = cardTemplate.content.firstElementChild.cloneNode(true);
    node.dataset.id = card.id;

    const priorityEl = node.querySelector(".card-priority");
    priorityEl.textContent = priorityLabel(card.priority);
    priorityEl.className = "card-priority priority-" + (card.priority || "medium");

    const dueEl = node.querySelector(".card-due");
    dueEl.textContent = formatDueDate(card.dueDate);

    const titleEl = node.querySelector(".card-title");
    titleEl.textContent = card.title;

    const descEl = node.querySelector(".card-description");
    descEl.textContent = card.description || "";

    const mainEl = node.querySelector(".card-main");
    mainEl.addEventListener("click", (e) => {
      e.stopPropagation();
      const { form, focusTitle } = buildCardForm({
        title: card.title,
        description: card.description,
        priority: card.priority,
        dueDate: card.dueDate,
        confirmLabel: "保存",
        onConfirm: (values) => updateCard(card.id, values),
        onCancel: () => render(),
      });
      node.replaceWith(form);
      focusTitle();
    });

    const deleteBtn = node.querySelector(".card-delete");
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteCard(card.id);
    });

    node.addEventListener("dragstart", (e) => {
      node.classList.add("dragging");
      e.dataTransfer.setData("text/plain", card.id);
      e.dataTransfer.effectAllowed = "move";
    });
    node.addEventListener("dragend", () => {
      node.classList.remove("dragging");
    });

    return node;
  }

  function buildColumnElement(column) {
    const columnEl = document.createElement("section");
    columnEl.className = "column";
    columnEl.dataset.columnId = column.id;

    const header = document.createElement("div");
    header.className = "column-header";

    const nameEl = document.createElement("span");
    nameEl.className = "column-name";
    nameEl.textContent = column.name;

    const countEl = document.createElement("span");
    countEl.className = "column-count";
    const columnCards = cardsInColumn(column.id);
    countEl.textContent = `(${columnCards.length})`;

    header.appendChild(nameEl);
    header.appendChild(countEl);

    const listEl = document.createElement("div");
    listEl.className = "card-list";

    if (columnCards.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-message";
      empty.textContent = "カードがありません";
      listEl.appendChild(empty);
    } else {
      columnCards.forEach((card) => {
        listEl.appendChild(buildCardElement(card));
      });
    }

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "add-card-button";
    addBtn.textContent = "＋ カードを追加";
    addBtn.addEventListener("click", () => {
      const { form, focusTitle } = buildCardForm({
        confirmLabel: "追加",
        onConfirm: (values) => addCard(column.id, values),
        onCancel: () => render(),
      });
      addBtn.replaceWith(form);
      focusTitle();
    });

    columnEl.appendChild(header);
    columnEl.appendChild(listEl);
    columnEl.appendChild(addBtn);

    columnEl.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      columnEl.classList.add("drag-over");
    });
    columnEl.addEventListener("dragleave", () => {
      columnEl.classList.remove("drag-over");
    });
    columnEl.addEventListener("drop", (e) => {
      e.preventDefault();
      columnEl.classList.remove("drag-over");
      const cardId = e.dataTransfer.getData("text/plain");
      if (cardId) moveCard(cardId, column.id);
    });

    return columnEl;
  }

  function render() {
    boardEl.innerHTML = "";
    COLUMNS.forEach((column) => {
      boardEl.appendChild(buildColumnElement(column));
    });
  }

  cards = loadCards();
  render();
})();
