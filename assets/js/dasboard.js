// assets/js/dashboard.js
import { dailyMessages } from "./messages.js";

// Calcula progresso do ano
function calculateYearProgress(date = new Date()) {
  const year = date.getFullYear();
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  const elapsed = (date - start) / (1000 * 60 * 60 * 24);
  const total = (end - start) / (1000 * 60 * 60 * 24) + 1;
  const percent = Math.min(100, Math.max(0, (elapsed / total) * 100));
  return Math.round(percent);
}

// Mostra mensagem do dia (index baseado em dia do ano)
function getDayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24)); // 0..364
}

function renderDashboard() {
  const percent = calculateYearProgress();
  const bar = document.getElementById("progress-bar");
  const label = document.getElementById("progress-percent");
  if (bar) bar.style.width = `${percent}%`;
  if (label) label.textContent = `${percent}%`;

  const idx = getDayOfYear();
  const msg = dailyMessages[idx] || "Hoje é um bom dia para escolher a paz.";
  const msgEl = document.getElementById("daily-message");
  if (msgEl) msgEl.textContent = msg;
}

document.addEventListener("DOMContentLoaded", renderDashboard);
