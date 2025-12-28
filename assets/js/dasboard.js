// assets/js/dashboard.js

// Tenta importar as mensagens; se falhar, usa fallback local
let dailyMessages = [];
(async () => {
  try {
    const mod = await import("./messages.js");
    dailyMessages = mod.dailyMessages || [];
    console.log(`[dashboard] messages.js carregado com ${dailyMessages.length} mensagens`);
  } catch (err) {
    console.warn("[dashboard] Falha ao carregar messages.js. Usando fallback local.", err);
    dailyMessages = [
      "Cada amanhecer é uma nova chance de amar mais e julgar menos.",
      "A paz que procuramos fora nasce primeiro dentro.",
      "Gratidão transforma o suficiente em abundância.",
      "Respire, confie e siga em frente.",
      "Você é maior do que seus medos.",
      "Pequenos passos constroem grandes mudanças.",
      "Permita-se recomeçar quantas vezes for preciso.",
      "A gentileza é a linguagem do coração.",
      "A luz que você compartilha volta para você.",
      "Hoje é um bom dia para escolher a paz.",
    ];
  } finally {
    // Quando mensagens estiverem prontas, renderiza
    renderDashboard();
  }
})();

// Calcula progresso do ano (inclui o dia atual, considera anos bissextos)
function calculateYearProgress(date = new Date()) {
  const year = date.getFullYear();
  const start = new Date(year, 0, 1);   // 1º de janeiro
  const end = new Date(year, 11, 31);   // 31 de dezembro

  const elapsedDays = Math.floor((date - start) / (1000 * 60 * 60 * 24)) + 1;
  const totalDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

  const percent = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
  const rounded = Math.round(percent);

  console.log(`[dashboard] Dias: ${elapsedDays}/${totalDays} -> ${rounded}%`);
  return { percent: rounded, elapsedDays, totalDays };
}

// Índice do dia no ano (0..364 ou 365)
function getDayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date - start;
  const idx = Math.floor(diff / (1000 * 60 * 60 * 24)); 
  return idx;
}

// Atualiza UI: barra de progresso e mensagem do dia
function renderDashboard() {
  // Protege contra execução antes do DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderDashboard);
    return;
  }

  const { percent, elapsedDays, totalDays } = calculateYearProgress();

  // Barra de progresso
  const bar = document.getElementById("progress-bar");
  const label = document.getElementById("progress-percent");
  if (bar) {
    bar.style.width = `${percent}%`;
    // Opcional: mostrar texto dentro da barra. Se preferir só no label, remova a linha abaixo.
    bar.textContent = "";
  } else {
    console.warn('[dashboard] Elemento "progress-bar" não encontrado.');
  }
  if (label) {
    label.textContent = `${percent}%`;
  } else {
    console.warn('[dashboard] Elemento "progress-percent" não encontrado.');
  }

  // Mensagem do dia
  const idx = getDayOfYear();
  
  const msgEl = document.getElementById("daily-message");
  const msg =
    (Array.isArray(dailyMessages) && dailyMessages[idx]) ||
    "Hoje é um bom dia para escolher a paz.";

  if (msgEl) {
    msgEl.textContent = msg;
  } else {
    console.warn('[dashboard] Elemento "daily-message" não encontrado.');
  }

  // Logs úteis
  console.log(`[dashboard] Dia do ano: ${idx}, Mensagens disponíveis: ${dailyMessages.length}`);
}

// Garante uma renderização inicial mesmo sem o import assíncrono
document.addEventListener("DOMContentLoaded", () => {
  // Se as mensagens ainda não chegaram, renderiza com fallback de porcentagem apenas.
  if (!dailyMessages.length) {
    renderDashboard();
  }
});
