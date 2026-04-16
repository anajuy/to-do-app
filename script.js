// ================= STATE =================
const TaskStore = (() => {
  let tasks = [];

  return {
    load(data) {
      tasks = data;
    },
    getAll() {
      return [...tasks];
    },
    add(task) {
      tasks.push(task);
    },
    remove(id) {
      tasks = tasks.filter(t => t.id !== id);
    },
    toggle(id, completed) {
      tasks = tasks.map(t =>
        t.id === id ? { ...t, completed } : t
      );
    }
  };
})();

// ================= STORAGE =================
const Storage = {
  save(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  },
  load() {
    try {
      const data = localStorage.getItem("tasks");
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
};

// ================= UI =================
const UI = {
  taskList: document.getElementById("taskList"),
  input: document.getElementById("taskInput"),
  priority: document.getElementById("priority"),
  message: document.getElementById("emptyMessage"),

  createElement(tag, className, content) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (content) el.textContent = content;
    return el;
  },

  render(tasks) {
    this.taskList.innerHTML = "";

    const fragment = document.createDocumentFragment();

    tasks.forEach(task => {
      fragment.appendChild(this.createTaskItem(task));
    });

    this.taskList.appendChild(fragment);

    this.message.style.display = tasks.length ? "none" : "block";
  },

  createTaskItem(task) {
    const li = this.createElement("li", task.priority);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;

    const span = this.createElement("span", "", task.text);

    if (task.completed) span.classList.add("completed");

    const deleteBtn = this.createElement("button", "delete-btn", "X");

    checkbox.addEventListener("change", () => {
      Controller.toggleTask(task.id, checkbox.checked);
    });

    deleteBtn.addEventListener("click", () => {
      Controller.deleteTask(task.id);
    });

    li.append(checkbox, span, deleteBtn);
    return li;
  },

  clearInput() {
    this.input.value = "";
  }
};

// ================= CONTROLLER =================
const Controller = {
  init() {
    const data = Storage.load();
    TaskStore.load(data);
    this.render();
    this.bindEvents();
  },

  bindEvents() {
    document.getElementById("addBtn")
      .addEventListener("click", () => this.addTask());

    UI.input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.addTask();
    });
  },

  addTask() {
    const text = UI.input.value.trim();

    if (text.length < 3) return;

    const task = {
      id: crypto.randomUUID(),
      text,
      priority: UI.priority.value,
      completed: false
    };

    TaskStore.add(task);
    this.update();
    UI.clearInput();
  },

  deleteTask(id) {
    TaskStore.remove(id);
    this.update();
  },

  toggleTask(id, completed) {
    TaskStore.toggle(id, completed);
    this.update();
  },

  update() {
    const tasks = TaskStore.getAll();
    Storage.save(tasks);
    this.render();
  },

  render() {
    UI.render(TaskStore.getAll());
  }
};

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  Controller.init();
})
