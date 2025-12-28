// assets/js/calendar.js
console.log("Calendar script carregado");

import { db, auth } from "./firebase.js";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
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
const statusMsg = document.getElementById("event-status");

const btnSave = document.getElementById("save-event");
const btnDelete = document.getElementById("delete-event");
const btnClose = document.getElementById("close-modal");
const btnPrev = document.getElementById("prev-month");
const btnNext = document.getElementById("next-month");

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
    cell.className =
      "h-20 rounded-lg border border-green-100 bg-white hover:bg-green-50 flex flex-col items-center justify-center";
    cell.innerHTML = `<span class="text-gray-700">${d}</span><span class="text-xs text-gray-400">Clique</span>`;
    cell.addEventListener("click", () =>
      openDayModal(date.getFullYear(), date.getMonth(), d)
    );
    grid.appendChild(cell);
  }
}

function openDayModal(year, month, day) {
  selectedDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}`;
  modalDateLabel.textContent = new Date(year, month, day).toLocaleDateString(
    "pt-BR"
  );

  // Reset form
  eventIdInput.value = "";
  titleInput.value = "";
  timeInput.value = "";
  typeInput.value = "Espiritual";
  notesInput.value = "";
  setStatus("");

  // Assinar eventos do dia
  if (unsubscribeDay) unsubscribeDay();
  const q = query(collection(db, "events"), where("date", "==", selectedDateStr));
  unsubscribeDay = onSnapshot(
    q,
    (snap) => {
      eventList.innerHTML = "";
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        const item = document.createElement("li");
        item.className = "p-3 rounded-lg border border-green-100";
        item.innerHTML = `
          <div class="flex justify-between gap-4">
            <div class="min-w-0">
              <p class="text-gray-800 font-medium truncate">${data.title || "(Sem título)"}</p>
              <p class="text-sm text-gray-500">${data.time || "--:--"} • ${data.type || "—"}</p>
              <p class="text-sm text-gray-600 mt-1 break-words">${data.notes || ""}</p>
            </div>
            <div class="flex flex-col items-end gap-2">
              <button data-id="${docSnap.id}" class="text-sm text-red-600 hover:underline">Excluir</button>
              <button data-id="${docSnap.id}" class="text-sm text-green-600 hover:underline">Editar</button>
            </div>
          </div>
        `;

        // Excluir
        item.querySelector('button.text-red-600').addEventListener("click", async (e) => {
          const id = e.currentTarget.getAttribute("data-id");
          try {
            await deleteDoc(doc(db, "events", id));
            setStatus("🗑️ Evento excluído!");
          } catch (err) {
            console.error(err);
            setStatus("Erro ao excluir o evento.");
          }
        });

        // Editar: carrega dados no formulário
        item.querySelector('button.text-green-600').addEventListener("click", () => {
          eventIdInput.value = data.id || docSnap.id;
          titleInput.value = data.title || "";
          timeInput.value = data.time || "";
          typeInput.value = data.type || "Espiritual";
          notesInput.value = data.notes || "";
          setStatus("Editando evento...");
        });

        eventList.appendChild(item);
      });
    },
    (err) => {
      console.error(err);
      setStatus("Erro ao carregar eventos do dia.");
    }
  );

  // Abrir modal
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeModal() {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  selectedDateStr = null;
  if (unsubscribeDay) {
    unsubscribeDay();
    unsubscribeDay = null;
  }
  setStatus("");
}

function setStatus(message) {
  if (!statusMsg) return;
  statusMsg.textContent = message || "";
  if (message) {
    // limpa após alguns segundos
    clearTimeout(setStatus._t);
    setStatus._t = setTimeout(() => {
      statusMsg.textContent = "";
    }, 3000);
  }
}

// Eventos UI
btnClose?.addEventListener("click", closeModal);

btnSave?.addEventListener("click", async (e) => {
  e.preventDefault();
  if (!selectedDateStr) {
    setStatus("Selecione um dia no calendário.");
    return;
  }
  if (!titleInput.value.trim()) {
    setStatus("Título é obrigatório.");
    return;
  }

  const id = eventIdInput.value || crypto.randomUUID();
  const payload = {
    id,
    date: selectedDateStr,
    title: titleInput.value.trim(),
    time: timeInput.value || "",
    type: typeInput.value || "Espiritual",
    notes: notesInput.value || "",
    createdBy: auth.currentUser?.uid || "anonymous",
    createdAt: Date.now(),
  };

  try {
    // Evita recarregamento por submissão de form
    await setDoc(doc(db, "events", id), payload);
    setStatus("✅ Evento salvo com sucesso!");

    // Limpa form após salvar
    eventIdInput.value = "";
    titleInput.value = "";
    timeInput.value = "";
    typeInput.value = "Espiritual";
    notesInput.value = "";
  } catch (err) {
  console.error("Erro ao salvar:", err.code, err.message);
  setStatus(`Erro ao salvar evento: ${err.code || ""} ${err.message || ""}`);
  }
});

btnDelete?.addEventListener("click", async (e) => {
  e.preventDefault();
  const id = eventIdInput.value;
  if (!id) {
    setStatus("Selecione um evento para excluir (clique em Editar).");
    return;
  }
  try {
    await deleteDoc(doc(db, "events", id));
    setStatus("🗑️ Evento excluído!");
    eventIdInput.value = "";
    titleInput.value = "";
    timeInput.value = "";
    typeInput.value = "Espiritual";
    notesInput.value = "";
  } catch (err) {
    console.error(err);
    setStatus("Erro ao excluir evento.");
  }
});

btnPrev?.addEventListener("click", () => {
  currentMonth.setMonth(currentMonth.getMonth() - 1);
  renderCalendar(currentMonth);
});

btnNext?.addEventListener("click", () => {
  currentMonth.setMonth(currentMonth.getMonth() + 1);
  renderCalendar(currentMonth);
});

document.addEventListener("DOMContentLoaded", () => {
  renderCalendar(currentMonth);
});
