// assets/js/calendar.js
console.log("Calendar script carregado");

import { db, auth } from "./firebase.js";
import {
  collection, doc, setDoc, deleteDoc, onSnapshot, query, where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let currentMonth = new Date();

const monthLabel = document.getElementById("current-month");
const grid = document.getElementById("calendar-grid");
const modal = document.getElementById("event-modal");
const modalDateLabel = document.getElementById("modal-date");
const eventList = document.getElementById("event-list");

const eventIdInput = document.getElementById("event-id");
const titleInput = document.getElementById("event-title");
const timeInput = document.getElementById("event-time");
const typeInput = document.getElementById("event-type");
const notesInput = document.getElementById("event-notes");

let selectedDateStr = null;
let unsubscribeDay = null;

function formatMonthLabel(date) {
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function getDaysInMonth(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  return { firstDay, lastDay };
}

function renderCalendar(date) {
  monthLabel.textContent = formatMonthLabel(date);
  grid.innerHTML = "";

  const { firstDay, lastDay } = getDaysInMonth(date);
  const startWeekday = firstDay.getDay(); // 0..6

  // Cabeçalhos de dias
  const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  weekdays.forEach((w) => {
    const h = document.createElement("div");
    h.className = "text-sm text-gray-600 font-medium text-center";
    h.textContent = w;
    grid.appendChild(h);
  });

  // Espaços iniciais
  for (let i = 0; i < startWeekday; i++) {
    const empty = document.createElement("div");
    empty.className = "h-20";
    grid.appendChild(empty);
  }

  // Dias
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const cell = document.createElement("button");
    cell.className = "h-20 rounded-lg border border-green-100 bg-white hover:bg-green-50 flex flex-col items-center justify-center";
    cell.innerHTML = `<span class="text-gray-700">${d}</span><span class="text-xs text-gray-400">Clique</span>`;
    cell.addEventListener("click", () => openDayModal(date.getFullYear(), date.getMonth(), d));
    grid.appendChild(cell);
  }
}

function openDayModal(year, month, day) {
  selectedDateStr = `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
  modalDateLabel.textContent = new Date(year, month, day).toLocaleDateString("pt-BR");
  eventIdInput.value = "";
  titleInput.value = "";
  timeInput.value = "";
  typeInput.value = "Espiritual";
  notesInput.value = "";

  // Assinar eventos do dia
  if (unsubscribeDay) unsubscribeDay();
  const q = query(collection(db, "events"), where("date", "==", selectedDateStr));
  unsubscribeDay = onSnapshot(q, (snap) => {
    eventList.innerHTML = "";
    snap.forEach((docSnap) => {
      const item = document.createElement("li");
      const data = docSnap.data();
      item.className = "p-3 rounded-lg border border-green-100";
      item.innerHTML = `
        <div class="flex justify-between">
          <div>
            <p class="text-gray-800 font-medium">${data.title || "(Sem título)"}</p>
            <p class="text-sm text-gray-500">${data.time || "--:--"} • ${data.type || "—"}</p>
            <p class="text-sm text-gray-600 mt-1">${data.notes || ""}</p>
          </div>
          <button data-id="${docSnap.id}" class="text-sm text-red-600 hover:underline">Excluir</button>
        </div>
      `;
      item.querySelector("button").addEventListener("click", async (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        await deleteDoc(doc(db, "events", id));
      });
      eventList.appendChild(item);
    });
  });

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeModal() {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

document.getElementById("close-modal").addEventListener("click", closeModal);

document.getElementById("save-event").addEventListener("click", async (e) => {
  e.preventDefault();
  if (!selectedDateStr) return;

  const id = eventIdInput.value || crypto.randomUUID();
  await setDoc(doc(db, "events", id), {
    id,
    date: selectedDateStr,
    title: titleInput.value,
    time: timeInput.value,
    type: typeInput.value,
    notes: notesInput.value,
    createdBy: auth.currentUser?.uid || "unknown",
    createdAt: Date.now(),
  });

  // Limpa form após salvar
  eventIdInput.value = "";
  titleInput.value = "";
  timeInput.value = "";
  notesInput.value = "";
});

document.getElementById("delete-event").addEventListener("click", async (e) => {
  e.preventDefault();
  const id = eventIdInput.value;
  if (id) {
    await deleteDoc(doc(db, "events", id));
    eventIdInput.value = "";
    titleInput.value = "";
    timeInput.value = "";
    typeInput.value = "Espiritual";
    notesInput.value = "";
  }
});

document.getElementById("prev-month").addEventListener("click", () => {
  currentMonth.setMonth(currentMonth.getMonth() - 1);
  renderCalendar(currentMonth);
});
document.getElementById("next-month").addEventListener("click", () => {
  currentMonth.setMonth(currentMonth.getMonth() + 1);
  renderCalendar(currentMonth);
});

document.addEventListener("DOMContentLoaded", () => renderCalendar(currentMonth));
