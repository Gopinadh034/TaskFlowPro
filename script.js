// ===============================
// TaskFlow Pro - Phase 1 (Updated JS)
// ===============================

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentTab = "all";
let editTaskId = null;

// Elements
const taskContainer = document.getElementById("taskContainer");
const taskTitle = document.getElementById("taskTitle");
const taskPriority = document.getElementById("taskPriority");
const taskCategory = document.getElementById("taskCategory");
const taskDueDate = document.getElementById("taskDueDate");
const taskReminder = document.getElementById("taskReminder");
const addTaskBtn = document.getElementById("addTaskBtn");
const searchInput = document.getElementById("searchInput");

const toast = document.getElementById("toast");

const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");
const trashTasks = document.getElementById("trashTasks");

// Modal
const editModal = document.getElementById("editModal");
const editTitle = document.getElementById("editTitle");
const editPriority = document.getElementById("editPriority");
const editCategory = document.getElementById("editCategory");
const editDueDate = document.getElementById("editDueDate");
const editReminder = document.getElementById("editReminder");

const saveEditBtn = document.getElementById("saveEditBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");


// ===============================
// Utility
// ===============================

function getDateTime() {
    return new Date().toLocaleString();
}

function generateId() {
    return Date.now();
}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function showToast(message) {
    toast.textContent = message;
    toast.style.display = "block";
    setTimeout(() => {
        toast.style.display = "none";
    }, 3000);
}

// ===============================
// Add Task
// ===============================

addTaskBtn.addEventListener("click", addTask);

function addTask() {
    const title = (taskTitle.value || "").trim();
    if (!title) {
        showToast("⚠️ Enter Task Title");
        return;
    }

    const task = {
        id: generateId(),
        title,
        priority: taskPriority.value,
        category: taskCategory.value,
        dueDate: taskDueDate.value,
        reminder: taskReminder ? taskReminder.value : "",
        status: "pending",
        deleted: false,
        createdAt: getDateTime(),
        updatedAt: "",
        completedAt: "",
        deletedAt: ""
    };

    tasks.push(task);
    saveTasks();
    renderTasks();
    clearForm();
    showToast("✅ Task Added");
}

function clearForm() {
    taskTitle.value = "";
    taskPriority.value = "High";
    taskCategory.value = "Work";
    taskDueDate.value = "";
    if (taskReminder) taskReminder.value = "";
}


// ===============================
// Render Tasks
// ===============================

function renderTasks() {

    taskContainer.innerHTML = "";

    let filteredTasks = [...tasks];

    const searchText =
        searchInput.value.toLowerCase();

    filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(searchText)
    );

    if (currentTab === "pending") {

        filteredTasks =
            filteredTasks.filter(
                task =>
                task.status === "pending" &&
                !task.deleted
            );

    } else if (currentTab === "completed") {

        filteredTasks =
            filteredTasks.filter(
                task =>
                task.status === "completed" &&
                !task.deleted
            );

    } else if (currentTab === "trash") {

        filteredTasks =
            filteredTasks.filter(
                task => task.deleted
            );

    } else {

        filteredTasks =
            filteredTasks.filter(
                task => !task.deleted
            );
    }

    if (filteredTasks.length === 0) {

        taskContainer.innerHTML = `
            <div class="task-card">
                <h3>No Tasks Found</h3>
            </div>
        `;

        updateDashboard();
        return;
    }

    filteredTasks.forEach(task => {

        const card =
            document.createElement("div");

        card.className = "task-card";

        let priorityClass = "";

        if (task.priority === "High") {
            priorityClass = "high";
        }

        if (task.priority === "Medium") {
            priorityClass = "medium";
        }

        if (task.priority === "Low") {
            priorityClass = "low";
        }

        card.innerHTML = `

            <div class="task-top">

                <div class="task-title">
                    ${task.title}
                </div>

                <span class="priority ${priorityClass}">
                    ${task.priority}
                </span>

            </div>

            <div class="task-info">

                <p>
                    📂 Category:
                    ${task.category}
                </p>

                <p>
                    📅 Due:
                    ${task.dueDate || "Not Set"}
                </p>

                <p>
                    📌 Status:
                    ${task.status}
                </p>

                ${task.reminder ? `
                <p>
                    ⏰ Reminder: ${task.reminder}
                </p>` : ""}

                <hr style="margin:10px 0">

                <p>
                    🕒 Created:
                    ${task.createdAt}
                </p>

                ${task.updatedAt ?
                `<p>✏️ Updated: ${task.updatedAt}</p>`
                : ""}

                ${task.completedAt ?
                `<p>✅ Completed: ${task.completedAt}</p>`
                : ""}

                ${task.deletedAt ?
                `<p>🗑️ Deleted: ${task.deletedAt}</p>`
                : ""}

            </div>

            <div class="task-actions">

                ${
                    !task.deleted
                    ?
                    `
                    <i
                    class="fa-solid fa-pen"
                    onclick="openEditModal(${task.id})">
                    </i>

                    <i
                    class="fa-solid fa-check"
                    onclick="toggleStatus(${task.id})">
                    </i>

                    <i
                    class="fa-solid fa-trash"
                    onclick="deleteTask(${task.id})">
                    </i>
                    `
                    :
                    `
                    <i
                    class="fa-solid fa-rotate-left"
                    onclick="restoreTask(${task.id})">
                    </i>

                    <i
                    class="fa-solid fa-trash"
                    onclick="permanentDelete(${task.id})">
                    </i>
                    `
                }

            </div>
        `;

        taskContainer.appendChild(card);
    });

    updateDashboard();
}

// ===============================
// Search
// ===============================

searchInput.addEventListener(
    "keyup",
    renderTasks
);

// ===============================
// Tabs
// ===============================

document
.querySelectorAll(".tab-btn")
.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            document
            .querySelectorAll(".tab-btn")
            .forEach(btn =>
                btn.classList.remove("active")
            );

            button.classList.add("active");

            currentTab =
                button.dataset.tab;

            renderTasks();
        }
    );
});

// ===============================
// Complete / Pending
// ===============================

function toggleStatus(id) {

    const task =
        tasks.find(
            task => task.id === id
        );

    if (!task) return;

    if (task.status === "pending") {

        task.status =
            "completed";

        task.completedAt =
            getDateTime();

        showToast(
            "🎉 Task Completed"
        );

    } else {

        task.status =
            "pending";

        task.completedAt = "";

        showToast(
            "📌 Task Moved To Pending"
        );
    }

    saveTasks();

    renderTasks();
}

// ===============================
// Delete Task
// ===============================

function deleteTask(id) {

    const task =
        tasks.find(
            task => task.id === id
        );

    task.deleted = true;

    task.deletedAt =
        getDateTime();

    saveTasks();

    renderTasks();

    showToast(
        "🗑️ Task Moved To Trash"
    );
}

// ===============================
// Restore Task
// ===============================

function restoreTask(id) {

    const task =
        tasks.find(
            task => task.id === id
        );

    task.deleted = false;

    task.deletedAt = "";

    saveTasks();

    renderTasks();

    showToast(
        "♻️ Task Restored"
    );
}

// ===============================
// Permanent Delete
// ===============================

function permanentDelete(id) {

    const confirmDelete =
        confirm(
            "Delete permanently?"
        );

    if (!confirmDelete) return;

    tasks =
        tasks.filter(
            task => task.id !== id
        );

    saveTasks();

    renderTasks();

    showToast(
        "❌ Permanently Deleted"
    );
}

// ===============================
// Edit Task
// ===============================

function openEditModal(id) {

    const task =
        tasks.find(
            task => task.id === id
        );

    editTaskId = id;

    editTitle.value =
        task.title;

    editPriority.value =
        task.priority;

    editCategory.value =
        task.category;

    editDueDate.value =
        task.dueDate;

    editModal.style.display =
        "flex";
}

saveEditBtn.addEventListener(
    "click",
    saveEdit
);

function saveEdit() {

    const task =
        tasks.find(
            task =>
            task.id === editTaskId
        );

    task.title =
        editTitle.value;

    task.priority =
        editPriority.value;

    task.category =
        editCategory.value;

    task.dueDate =
        editDueDate.value;

    task.updatedAt =
        getDateTime();

    saveTasks();

    renderTasks();

    editModal.style.display =
        "none";

    showToast(
        "✏️ Task Updated"
    );
}

cancelEditBtn.addEventListener(
    "click",
    () => {

        editModal.style.display =
            "none";
    }
);

// ===============================
// Dashboard
// ===============================

function updateDashboard() {

    totalTasks.textContent =
        tasks.filter(
            task => !task.deleted
        ).length;

    pendingTasks.textContent =
        tasks.filter(
            task =>
            task.status === "pending" &&
            !task.deleted
        ).length;

    completedTasks.textContent =
        tasks.filter(
            task =>
            task.status === "completed" &&
            !task.deleted
        ).length;

    trashTasks.textContent =
        tasks.filter(
            task =>
            task.deleted
        ).length;
}

// ===============================
// Initial Load
// ===============================

renderTasks();