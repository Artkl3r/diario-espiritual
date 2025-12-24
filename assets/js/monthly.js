// assets/js/monthly.js
import { db } from "./firebase.js";
import {
  doc, setDoc, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const monthLabel = document.getElementById("current-month-summary");
const prevBtn = document.getElementById("prev-month-summary");
const nextBtn = document.getElementById("next-month-summary");
const conclusions = document.getElementById("monthly-conclusions");
const saveBtn = document.getElementById("save-monthly");
const statusEl = document.getElementById("status-monthly");
const checklistEl = document.getElementById("spiritual-checklist");

let current = new Date();

function monthKey(date = current) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}`;
}
function label(date = current) {
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

let unsubscribe = null;

function bindMonth() {
  const key = monthKey();
  monthLabel.textContent = label();
  const ref = doc(db, "monthly", key);

  if (unsubscribe) unsubscribe();
  unsubscribe = onSnapshot(ref, (snap) => {
    const data = snap.data() || {};
    conclusions.value = data.conclusions || "";
    // checklist
    setChecked("task-oracao", !!data.tasks?.oracao);
    setChecked("task-leitura", !!data.tasks?.leitura);
    setChecked("task-caridade", !!data.tasks?.caridade);
  });
}

function setChecked(id, val) {
  const el = document.getElementById(id);
  if (el) el.checked = val;
}

async function saveConclusions() {
  const key = monthKey();
  const ref = doc(db, "monthly", key);
  await setDoc(ref, { conclusions: conclusions.value }, { merge: true });
  statusEl.textContent = "Salvo!";
  setTimeout(() => (statusEl.textContent = ""), 2000);
}

async function saveTask(id, val) {
  const key = monthKey();
  const ref = doc(db, "monthly", key);
  const tasks = {
    oracao: document.getElementById("task-oracao").checked,
    leitura: document.getElementById("task-leitura").checked,
    caridade: document.getElementById("task-caridade").checked,
  };
  await setDoc(ref, { tasks }, { merge: true });
}

prevBtn.addEventListener("click", () => {
  current.setMonth(current.getMonth() - 1);
  bindMonth();
});
nextBtn.addEventListener("click", () => {
  current.setMonth(current.getMonth() + 1);
  bindMonth();
});
saveBtn.addEventListener("click", saveConclusions);

// Checklist sincronizado
["task-oracao", "task-leitura", "task-caridade"].forEach((id) => {
  document.getElementById(id).addEventListener("change", (e) => {
    saveTask(id, e.target.checked);
  });
});

document.addEventListener("DOMContentLoaded", bindMonth);
