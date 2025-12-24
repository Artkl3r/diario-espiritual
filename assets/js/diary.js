// assets/js/diary.js
import { db, auth } from "./firebase.js";
import { doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const dateInput = document.getElementById("select-date");
const arthurText = document.getElementById("diary-arthur");
const yasText = document.getElementById("diary-yasmin");
const saveArthur = document.getElementById("save-arthur");
const saveYas = document.getElementById("save-yasmin");
const statusArthur = document.getElementById("status-arthur");
const statusYas = document.getElementById("status-yasmin");

let currentKey = null;
let unsubscribe = null;

function getDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}

function bindRealtime(dayKey) {
  if (unsubscribe) unsubscribe();
  const docRef = doc(db, "diary", dayKey);
  unsubscribe = onSnapshot(docRef, (snap) => {
    const data = snap.data() || {};
    arthurText.value = data.arthur || "";
    yasText.value = data.yasmin || "";
  });
}

async function saveEntry(role) {
  if (!currentKey) return;
  const docRef = doc(db, "diary", currentKey);
  const payload = {};
  if (role === "arthur") {
    payload.arthur = arthurText.value;
  } else {
    payload.yasmin = yasText.value;
  }
  payload.updatedBy = auth.currentUser?.uid || "unknown";
  payload.updatedAt = Date.now();
  await setDoc(docRef, payload, { merge: true });
}

// Eventos de salvar
saveArthur.addEventListener("click", async () => {
  await saveEntry("arthur");
  statusArthur.textContent = "Salvo!";
  setTimeout(() => (statusArthur.textContent = ""), 2000);
});
saveYas.addEventListener("click", async () => {
  await saveEntry("yasmin");
  statusYas.textContent = "Salvo!";
  setTimeout(() => (statusYas.textContent = ""), 2000);
});

// Inicializa com o dia atual
document.addEventListener("DOMContentLoaded", () => {
  const today = new Date();
  dateInput.value = today.toISOString().split("T")[0]; // formato yyyy-mm-dd
  currentKey = getDateKey(today);
  bindRealtime(currentKey);
});

// Quando o usuário troca a data
dateInput.addEventListener("change", () => {
  const chosenDate = new Date(dateInput.value);
  currentKey = getDateKey(chosenDate);
  bindRealtime(currentKey);
});
