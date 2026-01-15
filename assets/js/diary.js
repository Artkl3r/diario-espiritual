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
const favArthur = document.getElementById("fav-arthur");
const favYas = document.getElementById("fav-yasmin");

let currentKey = null;
let unsubscribe = null;

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

// Favoritos (localStorage) com verificação de duplicados
function addFavorite(author, text) {
  if (!text.trim()) return;
  const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

  const exists = favoritos.some(fav =>
    fav.author === author && fav.date === currentKey && fav.text === text
  );
  if (exists) {
    alert("Essa reflexão já está nos favoritos!");
    return;
  }

  favoritos.push({ author, text, date: currentKey });
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
  alert("Reflexão adicionada aos favoritos!");
}

favArthur.addEventListener("click", () => {
  addFavorite("Arthur", arthurText.value);
});

favYas.addEventListener("click", () => {
  addFavorite("Yasmin", yasText.value);
});

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
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  dateInput.value = todayStr;
  currentKey = todayStr;
  bindRealtime(currentKey);
});

dateInput.addEventListener("change", () => {
  const value = dateInput.value;
  if (!value) return;
  currentKey = value;
  bindRealtime(currentKey);
});
